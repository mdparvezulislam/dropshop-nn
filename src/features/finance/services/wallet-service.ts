import { WalletRepository } from "../repositories/wallet-repository";
import { LedgerRepository } from "../repositories/ledger-repository";
import type { Wallet, WorkspaceRole } from "../domain/wallet-entity";
import { logger } from "@/shared/utils/logger";
import { EventBus } from "@/shared/lib/event-bus/event-bus";
import { runInTransaction } from "@/shared/lib/database/query-builder";

export interface WalletBalances {
  availableBalance: number;
  pendingBalance: number;
  lockedBalance: number;
  withdrawableBalance: number;
  lifetimeEarnings: number;
  lifetimeWithdrawals: number;
  currency: string;
}

export class WalletService {
  private readonly walletRepository: WalletRepository;
  private readonly ledgerRepository: LedgerRepository;

  constructor() {
    this.walletRepository = new WalletRepository();
    this.ledgerRepository = new LedgerRepository();
  }

  async getBalances(walletId: string): Promise<WalletBalances> {
    const wallet = await this.walletRepository.findById(walletId);
    if (!wallet) {
      throw new Error(`Wallet not found: ${walletId}`);
    }

    const entries = await this.ledgerRepository.find({ walletId });

    let availableBalance = 0;
    let pendingBalance = 0;
    let lockedBalance = 0;
    let lifetimeEarnings = 0;
    let lifetimeWithdrawals = 0;

    for (const entry of entries) {
      if (entry.status === "cleared") {
        availableBalance += entry.amount;
      } else if (entry.status === "pending") {
        pendingBalance += entry.amount;
      } else if (entry.status === "locked") {
        // Locked entries are negative amounts (e.g. pending withdrawals)
        lockedBalance += Math.abs(entry.amount);
      }

      if (entry.type === "profit_credit") {
        lifetimeEarnings += entry.amount;
      }

      // If a withdrawal has been cleared/paid, it was logged as withdrawal_paid
      if (entry.type === "withdrawal_paid") {
        lifetimeWithdrawals += Math.abs(entry.amount);
      }
    }

    const withdrawableBalance = Math.max(0, availableBalance - lockedBalance);

    return {
      availableBalance,
      pendingBalance,
      lockedBalance,
      withdrawableBalance,
      lifetimeEarnings,
      lifetimeWithdrawals,
      currency: wallet.currency,
    };
  }

  async createWallet(workspaceId: string, role: WorkspaceRole, options?: { session?: any }): Promise<Wallet> {
    const execute = async (session: any) => {
      const existing = await this.walletRepository.findOne({ workspaceId }, { session });
      if (existing) {
        return existing;
      }

      const wallet = await this.walletRepository.create({
        workspaceId,
        workspaceRole: role,
        currency: "BDT",
        status: "active",
      }, { session });

      // Create opening balance ledger entry
      await this.ledgerRepository.create({
        walletId: wallet.id,
        amount: 0,
        type: "opening_balance",
        status: "cleared",
        metadata: { info: "Opening platform business wallet setup" },
      }, { session });

      await EventBus.publish(
        "finance.wallet_created",
        {
          walletId: wallet.id,
          workspaceId,
          role,
        },
        { source: "finance" },
      );

      logger.info("WalletService: business wallet instantiated", {
        walletId: wallet.id,
        workspaceId,
      });

      return wallet;
    };

    if (options?.session) {
      return execute(options.session);
    }
    return runInTransaction(execute);
  }
}

export default WalletService;
