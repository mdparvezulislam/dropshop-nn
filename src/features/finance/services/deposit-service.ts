import { WalletRepository } from "../repositories/wallet-repository";
import { LedgerRepository } from "../repositories/ledger-repository";
import { DepositRepository } from "../repositories/deposit-repository";
import { FinanceAuditRepository } from "../repositories/finance-audit-repository";
import { WalletService } from "./wallet-service";
import type { Deposit, DepositStatus, DepositMethod } from "../domain/deposit-entity";
import { logger } from "@/shared/utils/logger";
import { EventBus } from "@/shared/lib/event-bus/event-bus";
import { runInTransaction } from "@/shared/lib/database/query-builder";

export class DepositService {
  private readonly walletRepository: WalletRepository;
  private readonly ledgerRepository: LedgerRepository;
  private readonly depositRepository: DepositRepository;
  private readonly financeAuditRepository: FinanceAuditRepository;
  private readonly walletService: WalletService;

  constructor() {
    this.walletRepository = new WalletRepository();
    this.ledgerRepository = new LedgerRepository();
    this.depositRepository = new DepositRepository();
    this.financeAuditRepository = new FinanceAuditRepository();
    this.walletService = new WalletService();
  }

  async createDepositRequest(
    walletId: string,
    amount: number, // in cents
    method: DepositMethod,
    paymentReference?: string,
    receiptUrl?: string,
    notes?: string,
    actorId: string = "system",
  ): Promise<Deposit> {
    return runInTransaction(async (session) => {
      const wallet = await this.walletRepository.findById(walletId, { session });
      if (!wallet) {
        throw new Error(`Wallet not found: ${walletId}`);
      }

      const refNum = `DEP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      const deposit = await this.depositRepository.create({
        referenceNumber: refNum,
        walletId,
        amount,
        currency: wallet.currency ?? "BDT",
        status: "pending",
        method,
        paymentReference,
        receiptUrl,
        notes,
        createdBy: actorId,
      }, { session });

      await EventBus.publish(
        "finance.deposit_requested",
        {
          depositId: deposit.id,
          referenceNumber: refNum,
          walletId,
          amount,
          method,
        },
        { source: "finance" },
      );

      logger.info("DepositService: deposit request created", {
        depositId: deposit.id,
        referenceNumber: refNum,
        walletId,
        amount,
      });

      return deposit;
    });
  }

  async approveDeposit(
    depositId: string,
    approverId: string,
    notes?: string,
  ): Promise<Deposit> {
    return runInTransaction(async (session) => {
      const deposit = await this.depositRepository.findById(depositId, { session });
      if (!deposit) {
        throw new Error("Deposit request not found");
      }

      if (deposit.status !== "pending") {
        throw new Error(`Cannot approve deposit in status: ${deposit.status}`);
      }

      const updated = await this.depositRepository.update(depositId, {
        status: "approved",
        approvedBy: approverId,
        approvedAt: new Date(),
        notes: notes ?? deposit.notes,
      }, { session });

      const balancesBefore = await this.walletService.getBalances(deposit.walletId);
      const ledgerRef = `REF-LED-DEP-${Math.floor(100000 + Math.random() * 900000)}`;

      // Create cleared deposit ledger entry (increases available balance)
      const ledgerEntry = await this.ledgerRepository.create({
        referenceNumber: ledgerRef,
        walletId: deposit.walletId,
        workspaceId: balancesBefore.workspaceId,
        amount: deposit.amount,
        currency: deposit.currency ?? "BDT",
        type: "deposit",
        status: "cleared",
        sourceModule: "deposit",
        referenceType: "deposit",
        referenceId: deposit.id,
        description: `Deposit credit approved (${deposit.method}). Ref: ${deposit.paymentReference ?? deposit.referenceNumber}`,
        createdBy: approverId,
        metadata: {
          depositReference: deposit.referenceNumber,
          method: deposit.method,
          paymentReference: deposit.paymentReference,
        },
      }, { session });

      // Audit Log
      await this.financeAuditRepository.create({
        referenceNumber: deposit.referenceNumber,
        action: "deposit_approved",
        walletId: deposit.walletId,
        actorId: approverId,
        amount: deposit.amount,
        oldBalance: balancesBefore.availableBalance,
        newBalance: balancesBefore.availableBalance + deposit.amount,
        currency: deposit.currency ?? "BDT",
        reason: `Deposit ${deposit.referenceNumber} approved by admin. Method: ${deposit.method}`,
      }, { session });

      await EventBus.publish(
        "finance.deposit_approved",
        {
          depositId: deposit.id,
          referenceNumber: deposit.referenceNumber,
          ledgerEntryId: ledgerEntry.id,
          walletId: deposit.walletId,
          amount: deposit.amount,
        },
        { source: "finance" },
      );

      await EventBus.publish(
        "finance.wallet_credited",
        {
          walletId: deposit.walletId,
          amount: deposit.amount,
          type: "deposit",
          referenceNumber: deposit.referenceNumber,
        },
        { source: "finance" },
      );

      logger.info("DepositService: deposit approved and credited to wallet ledger", {
        depositId,
        walletId: deposit.walletId,
        amount: deposit.amount,
      });

      return updated;
    });
  }

  async rejectDeposit(
    depositId: string,
    rejecterId: string,
    reason: string,
  ): Promise<Deposit> {
    return runInTransaction(async (session) => {
      const deposit = await this.depositRepository.findById(depositId, { session });
      if (!deposit) {
        throw new Error("Deposit request not found");
      }

      if (deposit.status !== "pending") {
        throw new Error(`Cannot reject deposit in status: ${deposit.status}`);
      }

      const updated = await this.depositRepository.update(depositId, {
        status: "rejected",
        rejectedBy: rejecterId,
        rejectedAt: new Date(),
        rejectReason: reason,
      }, { session });

      const balances = await this.walletService.getBalances(deposit.walletId);

      await this.financeAuditRepository.create({
        referenceNumber: deposit.referenceNumber,
        action: "deposit_rejected",
        walletId: deposit.walletId,
        actorId: rejecterId,
        amount: 0,
        oldBalance: balances.availableBalance,
        newBalance: balances.availableBalance,
        currency: deposit.currency ?? "BDT",
        reason: `Deposit ${deposit.referenceNumber} rejected. Reason: ${reason}`,
      }, { session });

      logger.info("DepositService: deposit request rejected", { depositId, rejecterId, reason });
      return updated;
    });
  }
}

export default DepositService;
