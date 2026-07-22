import { WithdrawalRepository } from "../repositories/withdrawal-repository";
import { DepositRepository } from "../repositories/deposit-repository";
import { LedgerRepository } from "../repositories/ledger-repository";
import { FinanceService } from "./finance-service";
import { WithdrawalService } from "./withdrawal-service";
import { DepositService } from "./deposit-service";
import { logger } from "@/shared/utils/logger";
import { EventBus } from "@/shared/lib/event-bus/event-bus";

export interface FailedTransactionItem {
  id: string;
  referenceNumber: string;
  type: "failed_settlement" | "failed_withdrawal" | "failed_deposit" | "failed_refund";
  entityId: string;
  amountCents: number;
  failureReason: string;
  retryStatus: "can_retry" | "retrying" | "resolved" | "unresolvable";
  createdAt: Date;
}

export class FailedTransactionService {
  private readonly withdrawalRepository: WithdrawalRepository;
  private readonly depositRepository: DepositRepository;
  private readonly ledgerRepository: LedgerRepository;
  private readonly financeService: FinanceService;
  private readonly withdrawalService: WithdrawalService;
  private readonly depositService: DepositService;

  constructor() {
    this.withdrawalRepository = new WithdrawalRepository();
    this.depositRepository = new DepositRepository();
    this.ledgerRepository = new LedgerRepository();
    this.financeService = new FinanceService();
    this.withdrawalService = new WithdrawalService();
    this.depositService = new DepositService();
  }

  async listFailedTransactions(): Promise<FailedTransactionItem[]> {
    const failedItems: FailedTransactionItem[] = [];

    // 1. Rejected or Hold Withdrawals
    const withdrawals = await this.withdrawalRepository.find({ status: { $in: ["rejected", "hold"] } });
    for (const w of withdrawals) {
      failedItems.push({
        id: `FAIL-WTH-${w.id}`,
        referenceNumber: w.referenceNumber ?? w.id.slice(-8),
        type: "failed_withdrawal",
        entityId: w.id,
        amountCents: w.amount,
        failureReason: w.rejectReason ?? `Withdrawal in status ${w.status}`,
        retryStatus: w.status === "hold" ? "can_retry" : "unresolvable",
        createdAt: w.createdAt ? new Date(w.createdAt) : new Date(),
      });
    }

    // 2. Rejected Deposits
    const deposits = await this.depositRepository.find({ status: "rejected" });
    for (const d of deposits) {
      failedItems.push({
        id: `FAIL-DEP-${d.id}`,
        referenceNumber: d.referenceNumber ?? d.id.slice(-8),
        type: "failed_deposit",
        entityId: d.id,
        amountCents: d.amount,
        failureReason: d.rejectReason ?? "Deposit request rejected",
        retryStatus: "can_retry",
        createdAt: d.createdAt ? new Date(d.createdAt) : new Date(),
      });
    }

    // 3. Pending Unsettled Completed Orders
    const { OrderRepository } = await import("@/features/order/repositories/order-repository");
    const orderRepo = new OrderRepository();
    const completedOrders = await orderRepo.find({ status: "completed" });
    const profitEntries = await this.ledgerRepository.find({ type: "profit_credit" });

    const settledOrderIds = new Set(profitEntries.map((p) => p.orderId).filter(Boolean));

    for (const order of completedOrders) {
      const profit = order.profitPreview?.totalProfit ?? 0;
      if (profit > 0 && !settledOrderIds.has(order.id)) {
        failedItems.push({
          id: `FAIL-SETTL-${order.id}`,
          referenceNumber: `ORDER-${order.orderNumber}`,
          type: "failed_settlement",
          entityId: order.id,
          amountCents: profit,
          failureReason: "Completed order profit release pending or missed",
          retryStatus: "can_retry",
          createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
        });
      }
    }

    failedItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return failedItems;
  }

  async retryFailedTransaction(entityId: string, type: string, actorId: string = "system"): Promise<boolean> {
    try {
      if (type === "failed_settlement") {
        const { OrderRepository } = await import("@/features/order/repositories/order-repository");
        const orderRepo = new OrderRepository();
        const order = await orderRepo.findById(entityId);
        if (order) {
          await this.financeService.releaseProfit(order);
          logger.info("FailedTransactionService: retried order settlement", { orderId: entityId });
          return true;
        }
      } else if (type === "failed_withdrawal") {
        await this.withdrawalService.reviewWithdrawal(entityId, "approved", actorId);
        logger.info("FailedTransactionService: retried withdrawal transition to approved", { withdrawalId: entityId });
        return true;
      } else if (type === "failed_deposit") {
        await this.depositService.approveDeposit(entityId, actorId, "Retried from Failed Transaction Center");
        logger.info("FailedTransactionService: retried deposit approval", { depositId: entityId });
        return true;
      }

      return false;
    } catch (err: any) {
      logger.error("FailedTransactionService retry failed", err, { entityId, type });
      throw err;
    }
  }
}

export default FailedTransactionService;
