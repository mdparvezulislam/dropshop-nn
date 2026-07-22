import { WalletRepository } from "../repositories/wallet-repository";
import { LedgerRepository } from "../repositories/ledger-repository";
import { WithdrawalRepository } from "../repositories/withdrawal-repository";
import { FinanceAuditRepository } from "../repositories/finance-audit-repository";
import { WalletService } from "./wallet-service";
import type { Withdrawal, WithdrawalStatus, PayoutMethod } from "../domain/withdrawal-entity";
import { logger } from "@/shared/utils/logger";
import { EventBus } from "@/shared/lib/event-bus/event-bus";
import { runInTransaction } from "@/shared/lib/database/query-builder";

export class WithdrawalService {
  private readonly walletRepository: WalletRepository;
  private readonly ledgerRepository: LedgerRepository;
  private readonly withdrawalRepository: WithdrawalRepository;
  private readonly financeAuditRepository: FinanceAuditRepository;
  private readonly walletService: WalletService;

  constructor() {
    this.walletRepository = new WalletRepository();
    this.ledgerRepository = new LedgerRepository();
    this.withdrawalRepository = new WithdrawalRepository();
    this.financeAuditRepository = new FinanceAuditRepository();
    this.walletService = new WalletService();
  }

  async requestWithdrawal(
    walletId: string,
    amount: number, // in cents
    method: PayoutMethod,
    payoutDetails: Withdrawal["payoutDetails"],
    actorId: string = "system",
  ): Promise<Withdrawal> {
    return runInTransaction(async (session) => {
      // 1. Duplicate active withdrawal check
      const pendingRequests = await this.withdrawalRepository.findActivePendingByWallet(walletId);
      if (pendingRequests.length >= 5) {
        throw new Error("Maximum pending withdrawal requests limit reached. Please wait for previous payouts to clear.");
      }

      // 2. Verify wallet balances
      const balances = await this.walletService.getBalances(walletId);
      if (balances.withdrawableBalance < amount) {
        throw new Error(`Insufficient withdrawable balance. Requested: ${amount}, Available: ${balances.withdrawableBalance}`);
      }

      const refNum = `WTH-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      // 3. Create withdrawal request document
      const withdrawal = await this.withdrawalRepository.create({
        referenceNumber: refNum,
        walletId,
        amount,
        currency: balances.currency ?? "BDT",
        status: "pending",
        method,
        payoutDetails,
        fee: 0,
        createdBy: actorId,
      }, { session });

      const ledgerRef = `REF-LED-WTH-${Math.floor(100000 + Math.random() * 900000)}`;

      // 4. Create locked ledger debit entry
      await this.ledgerRepository.create({
        referenceNumber: ledgerRef,
        walletId,
        workspaceId: balances.workspaceId,
        amount: -amount,
        currency: balances.currency ?? "BDT",
        type: "withdrawal_request",
        status: "locked",
        sourceModule: "withdrawal",
        referenceType: "withdrawal",
        referenceId: withdrawal.id,
        description: `Locked debit for withdrawal request ${refNum} (${method})`,
        createdBy: actorId,
        metadata: { method, accountNumber: payoutDetails.accountNumber, referenceNumber: refNum },
      }, { session });

      // 5. Audit Log
      await this.financeAuditRepository.create({
        referenceNumber: refNum,
        action: "withdrawal_requested",
        walletId,
        actorId,
        amount: -amount,
        oldBalance: balances.availableBalance,
        newBalance: balances.availableBalance - amount,
        currency: balances.currency ?? "BDT",
        reason: `Requested payout of ৳${(amount / 100).toFixed(2)} via ${method}`,
      }, { session });

      await EventBus.publish(
        "finance.withdrawal_requested",
        {
          withdrawalId: withdrawal.id,
          referenceNumber: refNum,
          walletId,
          amount,
          method,
        },
        { source: "finance" },
      );

      logger.info("WithdrawalService: requested withdrawal payout logged", {
        withdrawalId: withdrawal.id,
        referenceNumber: refNum,
        walletId,
        amount,
      });

      return withdrawal;
    });
  }

  async reviewWithdrawal(
    withdrawalId: string,
    toStatus: "under_review" | "approved" | "hold",
    reviewerId: string,
  ): Promise<Withdrawal> {
    return runInTransaction(async (session) => {
      const withdrawal = await this.withdrawalRepository.findById(withdrawalId, { session });
      if (!withdrawal) {
        throw new Error("Withdrawal request not found");
      }

      const updated = await this.withdrawalRepository.update(withdrawalId, {
        status: toStatus as WithdrawalStatus,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      }, { session });

      if (toStatus === "approved") {
        await EventBus.publish(
          "finance.withdrawal_approved",
          { withdrawalId, referenceNumber: withdrawal.referenceNumber, walletId: withdrawal.walletId, amount: withdrawal.amount },
          { source: "finance" },
        );
      }

      logger.info(`WithdrawalService: transitioned to ${toStatus}`, { withdrawalId, reviewerId });
      return updated;
    });
  }

  async payWithdrawal(
    withdrawalId: string,
    transactionId: string, // external bank/MFS reference number
    fee: number, // payout fee
    actorId: string,
  ): Promise<Withdrawal> {
    return runInTransaction(async (session) => {
      const withdrawal = await this.withdrawalRepository.findById(withdrawalId, { session });
      if (!withdrawal) {
        throw new Error("Withdrawal request not found");
      }

      if (withdrawal.status !== "approved" && withdrawal.status !== "pending") {
        throw new Error(`Cannot pay withdrawal in status: ${withdrawal.status}`);
      }

      const updated = await this.withdrawalRepository.update(withdrawalId, {
        status: "completed",
        transactionId,
        fee,
        paidAt: new Date(),
        reviewedBy: actorId,
        reviewedAt: new Date(),
      }, { session });

      const balances = await this.walletService.getBalances(withdrawal.walletId);

      // Find original locked ledger entry and transition to cleared (final debit)
      const ledgerEntries = await this.ledgerRepository.find({
        walletId: withdrawal.walletId,
        referenceType: "withdrawal",
        referenceId: withdrawalId,
        status: "locked",
      }, { session });

      if (ledgerEntries.length > 0) {
        const entry = ledgerEntries[0];
        await this.ledgerRepository.update(entry.id, {
          status: "cleared",
          type: "withdrawal_paid",
          metadata: { ...entry.metadata, transactionId, fee },
        }, { session });
      }

      // Audit Log
      await this.financeAuditRepository.create({
        referenceNumber: withdrawal.referenceNumber,
        action: "withdrawal_paid",
        walletId: withdrawal.walletId,
        actorId,
        amount: -withdrawal.amount,
        oldBalance: balances.availableBalance,
        newBalance: balances.availableBalance,
        currency: withdrawal.currency ?? "BDT",
        reason: `Payout completed for ${withdrawal.referenceNumber}. Trx ID: ${transactionId}`,
      }, { session });

      await EventBus.publish(
        "finance.withdrawal_paid",
        {
          withdrawalId,
          referenceNumber: withdrawal.referenceNumber,
          walletId: withdrawal.walletId,
          amount: withdrawal.amount,
          transactionId,
          fee,
        },
        { source: "finance" },
      );

      logger.info("WithdrawalService: payout completed and cleared on ledger", {
        withdrawalId,
        transactionId,
        fee,
      });

      return updated;
    });
  }

  async rejectWithdrawal(
    withdrawalId: string,
    reviewerId: string,
    reason: string,
  ): Promise<Withdrawal> {
    return runInTransaction(async (session) => {
      const withdrawal = await this.withdrawalRepository.findById(withdrawalId, { session });
      if (!withdrawal) {
        throw new Error("Withdrawal request not found");
      }

      const updated = await this.withdrawalRepository.update(withdrawalId, {
        status: "rejected",
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        rejectReason: reason,
      }, { session });

      // Unlock original ledger entry by cancelling it (released back to withdrawable balance)
      const ledgerEntries = await this.ledgerRepository.find({
        walletId: withdrawal.walletId,
        referenceType: "withdrawal",
        referenceId: withdrawalId,
        status: "locked",
      }, { session });

      if (ledgerEntries.length > 0) {
        const entry = ledgerEntries[0];
        await this.ledgerRepository.update(entry.id, {
          status: "cancelled",
          type: "withdrawal_rejected",
          metadata: { ...entry.metadata, rejectReason: reason },
        }, { session });
      }

      const balances = await this.walletService.getBalances(withdrawal.walletId);

      // Audit Log
      await this.financeAuditRepository.create({
        referenceNumber: withdrawal.referenceNumber,
        action: "withdrawal_rejected",
        walletId: withdrawal.walletId,
        actorId: reviewerId,
        amount: withdrawal.amount,
        oldBalance: balances.availableBalance,
        newBalance: balances.availableBalance + withdrawal.amount,
        currency: withdrawal.currency ?? "BDT",
        reason: `Payout request ${withdrawal.referenceNumber} rejected. Reason: ${reason}`,
      }, { session });

      await EventBus.publish(
        "finance.withdrawal_rejected",
        { withdrawalId, referenceNumber: withdrawal.referenceNumber, walletId: withdrawal.walletId, amount: withdrawal.amount, reason },
        { source: "finance" },
      );

      logger.info("WithdrawalService: payout request rejected, locked balance released", {
        withdrawalId,
        reviewerId,
        reason,
      });

      return updated;
    });
  }

  async cancelWithdrawal(withdrawalId: string, actorId: string = "system"): Promise<Withdrawal> {
    return runInTransaction(async (session) => {
      const withdrawal = await this.withdrawalRepository.findById(withdrawalId, { session });
      if (!withdrawal) {
        throw new Error("Withdrawal request not found");
      }

      if (withdrawal.status !== "pending") {
        throw new Error(`Cannot cancel withdrawal in status: ${withdrawal.status}`);
      }

      const updated = await this.withdrawalRepository.update(withdrawalId, {
        status: "cancelled",
      }, { session });

      // Release locked ledger entry
      const ledgerEntries = await this.ledgerRepository.find({
        walletId: withdrawal.walletId,
        referenceType: "withdrawal",
        referenceId: withdrawalId,
        status: "locked",
      }, { session });

      if (ledgerEntries.length > 0) {
        const entry = ledgerEntries[0];
        await this.ledgerRepository.update(entry.id, {
          status: "cancelled",
        }, { session });
      }

      logger.info("WithdrawalService: payout request cancelled", { withdrawalId });
      return updated;
    });
  }
}

export default WithdrawalService;
