import { WalletRepository } from "../repositories/wallet-repository";
import { LedgerRepository } from "../repositories/ledger-repository";
import type { Wallet, WorkspaceRole, WalletBalances } from "../domain/wallet-entity";
import { logger } from "@/shared/utils/logger";
import { EventBus } from "@/shared/lib/event-bus/event-bus";
import { runInTransaction } from "@/shared/lib/database/query-builder";

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

    let currentBalance = 0;
    let availableBalance = 0;
    let pendingBalance = 0;
    let lockedBalance = 0;
    let lifetimeEarnings = 0;
    let lifetimeWithdrawals = 0;
    let lifetimeDeposits = 0;

    for (const entry of entries) {
      if (entry.status === "cleared") {
        currentBalance += entry.amount;
        availableBalance += entry.amount;
      } else if (entry.status === "pending") {
        if (entry.amount > 0) {
          pendingBalance += entry.amount;
        }
      } else if (entry.status === "locked") {
        // Locked debits for pending withdrawals
        lockedBalance += Math.abs(entry.amount);
      }

      if (entry.amount > 0 && ["profit_credit", "credit", "commission", "manual_credit", "bonus"].includes(entry.type)) {
        lifetimeEarnings += entry.amount;
      }

      if (["withdrawal_paid", "withdrawal"].includes(entry.type) || (entry.type === "withdrawal_request" && entry.status === "cleared")) {
        lifetimeWithdrawals += Math.abs(entry.amount);
      }

      if (["deposit", "manual_credit"].includes(entry.type) && entry.status === "cleared" && entry.amount > 0) {
        lifetimeDeposits += entry.amount;
      }
    }

    const withdrawableBalance = Math.max(0, availableBalance - lockedBalance);

    return {
      walletId: wallet.id,
      workspaceId: wallet.workspaceId,
      workspaceRole: wallet.workspaceRole,
      currentBalance,
      availableBalance,
      pendingBalance,
      lockedBalance,
      withdrawableBalance,
      lifetimeEarnings,
      lifetimeWithdrawals,
      lifetimeDeposits,
      currency: wallet.currency ?? "BDT",
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

      const refNum = `REF-LED-INIT-${Math.floor(100000 + Math.random() * 900000)}`;

      // Create opening balance ledger entry
      await this.ledgerRepository.create({
        referenceNumber: refNum,
        walletId: wallet.id,
        workspaceId,
        amount: 0,
        currency: "BDT",
        type: "opening_balance",
        status: "cleared",
        sourceModule: "system",
        description: `Opening platform business wallet setup for ${role}`,
        createdBy: "system",
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
        role,
      });

      return wallet;
    };

    if (options?.session) {
      return execute(options.session);
    }
    return runInTransaction(execute);
  }

  async listWallets(): Promise<Wallet[]> {
    return this.walletRepository.listAllWallets();
  }
}

export default WalletService;
