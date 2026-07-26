import { WalletRepository } from "../repositories/wallet-repository";
import { LedgerRepository } from "../repositories/ledger-repository";
import { FinanceAuditRepository } from "../repositories/finance-audit-repository";
import { WalletService } from "./wallet-service";
import type { LedgerEntry } from "../domain/ledger-entity";
import { logger } from "@/lib/utils/logger";
import { EventBus } from "@/lib/event-bus/event-bus";
import { runInTransaction } from "@/lib/database/query-builder";

export interface AdjustmentParams {
  walletId: string;
  amount: number; // positive integer cents
  reason: string;
  internalNote?: string;
  actorId: string;
  actorRole?: string;
  allowNegativeBalance?: boolean;
}

export class AdjustmentService {
  private readonly walletRepository: WalletRepository;
  private readonly ledgerRepository: LedgerRepository;
  private readonly financeAuditRepository: FinanceAuditRepository;
  private readonly walletService: WalletService;

  constructor() {
    this.walletRepository = new WalletRepository();
    this.ledgerRepository = new LedgerRepository();
    this.financeAuditRepository = new FinanceAuditRepository();
    this.walletService = new WalletService();
  }

  async creditWallet(params: AdjustmentParams): Promise<LedgerEntry> {
    if (params.amount <= 0) {
      throw new Error("Credit amount must be greater than zero");
    }
    if (!params.reason?.trim()) {
      throw new Error("Mandatory reason is required for manual wallet credit");
    }

    return runInTransaction(async (session) => {
      const wallet = await this.walletRepository.findById(params.walletId, { session });
      if (!wallet) {
        throw new Error(`Wallet not found: ${params.walletId}`);
      }

      const balancesBefore = await this.walletService.getBalances(params.walletId);
      const refNum = `REF-LED-ADJ-${Math.floor(100000 + Math.random() * 900000)}`;

      // 1. Create cleared ledger credit entry
      const entry = await this.ledgerRepository.create(
        {
          referenceNumber: refNum,
          walletId: params.walletId,
          workspaceId: wallet.workspaceId,
          amount: params.amount,
          currency: wallet.currency ?? "BDT",
          type: "manual_credit",
          status: "cleared",
          sourceModule: "manual_adjustment",
          referenceType: "manual",
          description: `Admin manual credit: ${params.reason}`,
          createdBy: params.actorId,
          metadata: {
            reason: params.reason,
            internalNote: params.internalNote,
            actorRole: params.actorRole,
          },
        },
        { session },
      );

      const newBalance = balancesBefore.availableBalance + params.amount;

      // 2. Audit Log Entry
      await this.financeAuditRepository.create(
        {
          referenceNumber: refNum,
          action: "manual_adjustment",
          walletId: params.walletId,
          actorId: params.actorId,
          actorRole: params.actorRole,
          amount: params.amount,
          oldBalance: balancesBefore.availableBalance,
          newBalance,
          currency: wallet.currency ?? "BDT",
          reason: `Manual Credit: ${params.reason}`,
          internalNotes: params.internalNote,
        },
        { session },
      );

      // 3. EventBus publication
      await EventBus.publish(
        "finance.wallet_credited",
        {
          walletId: params.walletId,
          amount: params.amount,
          type: "manual_credit",
          referenceNumber: refNum,
          reason: params.reason,
        },
        { source: "finance" },
      );

      logger.info("AdjustmentService: manual wallet credit completed", {
        walletId: params.walletId,
        amount: params.amount,
        refNum,
        actorId: params.actorId,
      });

      return entry;
    });
  }

  async debitWallet(params: AdjustmentParams): Promise<LedgerEntry> {
    if (params.amount <= 0) {
      throw new Error("Debit amount must be greater than zero");
    }
    if (!params.reason?.trim()) {
      throw new Error("Mandatory reason is required for manual wallet debit");
    }

    return runInTransaction(async (session) => {
      const wallet = await this.walletRepository.findById(params.walletId, { session });
      if (!wallet) {
        throw new Error(`Wallet not found: ${params.walletId}`);
      }

      const balancesBefore = await this.walletService.getBalances(params.walletId);
      const debitAmount = -params.amount;

      // Negative balance safety check
      if (!params.allowNegativeBalance && balancesBefore.availableBalance < params.amount) {
        throw new Error(
          `Insufficient available balance for debit. Current: ৳${(balancesBefore.availableBalance / 100).toFixed(2)}, Debit: ৳${(params.amount / 100).toFixed(2)}`,
        );
      }

      const refNum = `REF-LED-ADJ-${Math.floor(100000 + Math.random() * 900000)}`;

      // 1. Create cleared ledger debit entry
      const entry = await this.ledgerRepository.create(
        {
          referenceNumber: refNum,
          walletId: params.walletId,
          workspaceId: wallet.workspaceId,
          amount: debitAmount,
          currency: wallet.currency ?? "BDT",
          type: "manual_debit",
          status: "cleared",
          sourceModule: "manual_adjustment",
          referenceType: "manual",
          description: `Admin manual debit: ${params.reason}`,
          createdBy: params.actorId,
          metadata: {
            reason: params.reason,
            internalNote: params.internalNote,
            actorRole: params.actorRole,
          },
        },
        { session },
      );

      const newBalance = balancesBefore.availableBalance - params.amount;

      // 2. Audit Log Entry
      await this.financeAuditRepository.create(
        {
          referenceNumber: refNum,
          action: "manual_adjustment",
          walletId: params.walletId,
          actorId: params.actorId,
          actorRole: params.actorRole,
          amount: debitAmount,
          oldBalance: balancesBefore.availableBalance,
          newBalance,
          currency: wallet.currency ?? "BDT",
          reason: `Manual Debit: ${params.reason}`,
          internalNotes: params.internalNote,
        },
        { session },
      );

      // 3. EventBus publication
      await EventBus.publish(
        "finance.wallet_debited",
        {
          walletId: params.walletId,
          amount: debitAmount,
          type: "manual_debit",
          referenceNumber: refNum,
          reason: params.reason,
        },
        { source: "finance" },
      );

      logger.info("AdjustmentService: manual wallet debit completed", {
        walletId: params.walletId,
        amount: params.amount,
        refNum,
        actorId: params.actorId,
      });

      return entry;
    });
  }
}

export default AdjustmentService;
