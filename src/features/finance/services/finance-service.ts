import { WalletRepository } from "../repositories/wallet-repository";
import { LedgerRepository } from "../repositories/ledger-repository";
import { FinanceAuditRepository } from "../repositories/finance-audit-repository";
import { WalletService } from "./wallet-service";
import type { Order } from "@/features/order/domain/order-entity";
import { Settings } from "@/shared/core/feature-flags";
import { logger } from "@/shared/utils/logger";
import { EventBus } from "@/shared/lib/event-bus/event-bus";
import { runInTransaction } from "@/shared/lib/database/query-builder";

export class FinanceService {
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

  async releaseProfit(order: Order): Promise<void> {
    if (order.status !== "completed") {
      logger.warn("FinanceService: bypass releaseProfit because order is not completed", {
        orderId: order.id,
        status: order.status,
      });
      return;
    }

    const profit = order.profitPreview?.totalProfit ?? 0;
    if (profit <= 0) {
      logger.info("FinanceService: zero or negative profit, bypass release", {
        orderId: order.id,
        profit,
      });
      return;
    }

    return runInTransaction(async (session) => {
      // 1. Prevent Duplicate Settlement
      const isDuplicate = await this.ledgerRepository.existsDuplicateEntry(
        "",
        "profit_credit",
        order.id,
      );
      if (isDuplicate) {
        logger.info("FinanceService: settlement already recorded for order, skipping duplicate", {
          orderId: order.id,
        });
        return;
      }

      // 2. Resolve wallet owner workspace
      let workspaceId = "admin-platform";
      let role: "reseller" | "wholesaler" | "admin" | "supplier" = "admin";

      if (order.resellerId) {
        workspaceId = order.resellerId;
        role = "reseller";
      } else if (order.wholesaleId) {
        workspaceId = order.wholesaleId;
        role = "wholesaler";
      }

      // 3. Ensure wallet exists
      const wallet = await this.walletService.createWallet(workspaceId, role, { session });

      // 4. Resolve configurable profit clearance delay (in days)
      const delayDays = Settings.get<number>("finance.profit-release-delay-days") ?? 7;
      const clearsAt = new Date();
      clearsAt.setDate(clearsAt.getDate() + delayDays);

      const refNum = `REF-LED-SETTL-${Math.floor(100000 + Math.random() * 900000)}`;

      // 5. Create ledger entry (in holding state "pending")
      const entry = await this.ledgerRepository.create({
        referenceNumber: refNum,
        walletId: wallet.id,
        workspaceId,
        amount: profit,
        currency: "BDT",
        type: "profit_credit",
        status: "pending",
        sourceModule: "order",
        referenceType: "order",
        referenceId: order.id,
        orderId: order.id,
        description: `Order completion profit release for order #${order.orderNumber}`,
        createdBy: "system",
        clearsAt,
        metadata: {
          orderNumber: order.orderNumber,
          delayDays,
        },
      }, { session });

      const balances = await this.walletService.getBalances(wallet.id);

      // Audit Log
      await this.financeAuditRepository.create({
        referenceNumber: refNum,
        action: "order_settled",
        walletId: wallet.id,
        actorId: "system",
        amount: profit,
        oldBalance: balances.availableBalance,
        newBalance: balances.availableBalance,
        currency: "BDT",
        reason: `Order #${order.orderNumber} settled with ৳${(profit / 100).toFixed(2)} profit pending clearance`,
      }, { session });

      await EventBus.publish(
        "finance.profit_released",
        {
          ledgerEntryId: entry.id,
          referenceNumber: refNum,
          walletId: wallet.id,
          amount: profit,
          orderId: order.id,
          clearsAt: clearsAt.toISOString(),
        },
        { source: "finance" },
      );

      logger.info("FinanceService: profit released in pending state", {
        orderId: order.id,
        walletId: wallet.id,
        amount: profit,
        clearsAt,
      });
    });
  }

  async reverseProfit(order: Order, refundReason?: string): Promise<void> {
    const profit = order.profitPreview?.totalProfit ?? 0;
    if (profit <= 0) {
      return;
    }

    return runInTransaction(async (session) => {
      let workspaceId = "admin-platform";
      let role: "reseller" | "wholesaler" | "admin" | "supplier" = "admin";

      if (order.resellerId) {
        workspaceId = order.resellerId;
        role = "reseller";
      } else if (order.wholesaleId) {
        workspaceId = order.wholesaleId;
        role = "wholesaler";
      }

      const wallet = await this.walletRepository.findOne({ workspaceId }, { session });
      if (!wallet) {
        return;
      }

      const refNum = `REF-LED-REFUND-${Math.floor(100000 + Math.random() * 900000)}`;

      // Create a reverse ledger entry (immediate debit adjustment / refund type)
      const entry = await this.ledgerRepository.create({
        referenceNumber: refNum,
        walletId: wallet.id,
        workspaceId,
        amount: -profit,
        currency: "BDT",
        type: "refund",
        status: "cleared",
        sourceModule: "refund",
        referenceType: "order",
        referenceId: order.id,
        orderId: order.id,
        description: `Reverse profit payout on order refund #${order.orderNumber}`,
        createdBy: "system",
        metadata: {
          info: "Reverse profit payout on order refund",
          orderNumber: order.orderNumber,
          reason: refundReason,
        },
      }, { session });

      const balances = await this.walletService.getBalances(wallet.id);

      // Audit Log
      await this.financeAuditRepository.create({
        referenceNumber: refNum,
        action: "refund_processed",
        walletId: wallet.id,
        actorId: "system",
        amount: -profit,
        oldBalance: balances.availableBalance,
        newBalance: balances.availableBalance - profit,
        currency: "BDT",
        reason: `Order #${order.orderNumber} refund processed. Deducted ৳${(profit / 100).toFixed(2)}`,
      }, { session });

      await EventBus.publish(
        "finance.refund_processed",
        {
          ledgerEntryId: entry.id,
          referenceNumber: refNum,
          walletId: wallet.id,
          amount: -profit,
          orderId: order.id,
        },
        { source: "finance" },
      );

      logger.info("FinanceService: profit payout reversed on refund", {
        orderId: order.id,
        walletId: wallet.id,
        amount: -profit,
      });
    });
  }
}

export default FinanceService;
