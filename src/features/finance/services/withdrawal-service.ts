import { WalletRepository } from "../repositories/wallet-repository";
import { LedgerRepository } from "../repositories/ledger-repository";
import { WithdrawalRepository } from "../repositories/withdrawal-repository";
import { WalletService } from "./wallet-service";
import type { Withdrawal, WithdrawalStatus, PayoutMethod } from "../domain/withdrawal-entity";
import { logger } from "@/shared/utils/logger";
import { EventBus } from "@/shared/lib/event-bus/event-bus";
import { runInTransaction } from "@/shared/lib/database/query-builder";

export class WithdrawalService {
  private readonly walletRepository: WalletRepository;
  private readonly ledgerRepository: LedgerRepository;
  private readonly withdrawalRepository: WithdrawalRepository;
  private readonly walletService: WalletService;

  constructor() {
    this.walletRepository = new WalletRepository();
    this.ledgerRepository = new LedgerRepository();
    this.withdrawalRepository = new WithdrawalRepository();
    this.walletService = new WalletService();
  }

  async requestWithdrawal(
    walletId: string,
    amount: number, // in cents
    method: PayoutMethod,
    payoutDetails: Withdrawal["payoutDetails"],
  ): Promise<Withdrawal> {
    return runInTransaction(async (session) => {
      // 1. Verify wallet balances
      const balances = await this.walletService.getBalances(walletId);
      if (balances.withdrawableBalance < amount) {
        throw new Error(`Insufficient withdrawable balance. Requested: ${amount}, Available: ${balances.withdrawableBalance}`);
      }

      // 2. Create withdrawal request document
      const withdrawal = await this.withdrawalRepository.create({
        walletId,
        amount,
        status: "pending",
        method,
        payoutDetails,
        fee: 0,
      }, { session });

      // 3. Create locked ledger debit entry
      await this.ledgerRepository.create({
        walletId,
        amount: -amount,
        type: "withdrawal_request",
        status: "locked",
        referenceType: "withdrawal",
        referenceId: withdrawal.id,
        metadata: { method, accountNumber: payoutDetails.accountNumber },
      }, { session });

      await EventBus.publish(
        "finance.withdrawal_requested",
        {
          withdrawalId: withdrawal.id,
          walletId,
          amount,
          method,
        },
        { source: "finance" },
      );

      logger.info("WithdrawalService: requested withdrawal payout logged", {
        withdrawalId: withdrawal.id,
        walletId,
        amount,
      });

      return withdrawal;
    });
  }

  async reviewWithdrawal(
    withdrawalId: string,
    toStatus: "under_review" | "approved",
    reviewerId: string,
  ): Promise<Withdrawal> {
    return runInTransaction(async (session) => {
      const withdrawal = await this.withdrawalRepository.findById(withdrawalId, { session });
      if (!withdrawal) {
        throw new Error("Withdrawal request not found");
      }

      if (withdrawal.status !== "pending" && withdrawal.status !== "under_review") {
        throw new Error(`Invalid status transition from ${withdrawal.status} to ${toStatus}`);
      }

      const updated = await this.withdrawalRepository.update(withdrawalId, {
        status: toStatus as WithdrawalStatus,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      }, { session });

      if (toStatus === "approved") {
        await EventBus.publish(
          "finance.withdrawal_approved",
          { withdrawalId, walletId: withdrawal.walletId, amount: withdrawal.amount },
          { source: "finance" },
        );
      }

      logger.info(`WithdrawalService: transitioned to ${toStatus}`, { withdrawalId, reviewerId });
      return updated;
    });
  }

  async payWithdrawal(
    withdrawalId: string,
    referenceNumber: string, // txn ID reference
    fee: number, // payout fee
    actorId: string,
  ): Promise<Withdrawal> {
    return runInTransaction(async (session) => {
      const withdrawal = await this.withdrawalRepository.findById(withdrawalId, { session });
      if (!withdrawal) {
        throw new Error("Withdrawal request not found");
      }

      if (withdrawal.status !== "approved") {
        throw new Error(`Cannot pay withdrawal in status: ${withdrawal.status}`);
      }

      const updated = await this.withdrawalRepository.update(withdrawalId, {
        status: "completed",
        referenceNumber,
        fee,
        paidAt: new Date(),
      }, { session });

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
          metadata: { ...entry.metadata, referenceNumber, fee },
        }, { session });
      }

      await EventBus.publish(
        "finance.withdrawal_paid",
        {
          withdrawalId,
          walletId: withdrawal.walletId,
          amount: withdrawal.amount,
          referenceNumber,
          fee,
        },
        { source: "finance" },
      );

      logger.info("WithdrawalService: payout completed and cleared on ledger", {
        withdrawalId,
        referenceNumber,
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

      if (!["pending", "under_review", "approved"].includes(withdrawal.status)) {
        throw new Error(`Cannot reject withdrawal in status: ${withdrawal.status}`);
      }

      const updated = await this.withdrawalRepository.update(withdrawalId, {
        status: "rejected",
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        metadata: { ...withdrawal.metadata, rejectReason: reason },
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

      await EventBus.publish(
        "finance.withdrawal_rejected",
        { withdrawalId, walletId: withdrawal.walletId, amount: withdrawal.amount, reason },
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

  async cancelWithdrawal(withdrawalId: string): Promise<Withdrawal> {
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

      logger.info("WithdrawalService: payout request cancelled by reseller", { withdrawalId });
      return updated;
    });
  }
}

export default WithdrawalService;
