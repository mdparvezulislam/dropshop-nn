import { WalletRepository } from "../repositories/wallet-repository";
import { LedgerRepository } from "../repositories/ledger-repository";
import { WalletService } from "./wallet-service";
import type { Order } from "@/features/order/domain/order-entity";
import { Settings } from "@/shared/core/feature-flags";
import { logger } from "@/shared/utils/logger";
import { EventBus } from "@/shared/lib/event-bus/event-bus";
import { runInTransaction } from "@/shared/lib/database/query-builder";

export class FinanceService {
  private readonly walletRepository: WalletRepository;
  private readonly ledgerRepository: LedgerRepository;
  private readonly walletService: WalletService;

  constructor() {
    this.walletRepository = new WalletRepository();
    this.ledgerRepository = new LedgerRepository();
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
      // 1. Resolve wallet owner workspace
      let workspaceId = "admin-platform";
      let role: "reseller" | "wholesaler" | "admin" | "supplier" = "admin";

      if (order.resellerId) {
        workspaceId = order.resellerId;
        role = "reseller";
      } else if (order.wholesaleId) {
        workspaceId = order.wholesaleId;
        role = "wholesaler";
      }

      // 2. Ensure wallet exists
      const wallet = await this.walletService.createWallet(workspaceId, role, { session });

      // 3. Resolve configurable profit clearance delay (in days)
      // Check feature-flags settings, default to 7 days
      const delayDays = Settings.get<number>("finance.profit-release-delay-days") ?? 7;
      const clearsAt = new Date();
      clearsAt.setDate(clearsAt.getDate() + delayDays);

      // 4. Create ledger entry (in holding state "pending")
      const entry = await this.ledgerRepository.create({
        walletId: wallet.id,
        amount: profit,
        type: "profit_credit",
        status: "pending",
        referenceType: "order",
        referenceId: order.id,
        clearsAt,
        metadata: {
          orderNumber: order.orderNumber,
          delayDays,
        },
      }, { session });

      await EventBus.publish(
        "finance.profit_released",
        {
          ledgerEntryId: entry.id,
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

  async reverseProfit(order: Order): Promise<void> {
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

      // Create a reverse ledger entry (immediate debit adjustment / refund type)
      // Status cleared immediately to deduct balances
      const entry = await this.ledgerRepository.create({
        walletId: wallet.id,
        amount: -profit,
        type: "refund",
        status: "cleared",
        referenceType: "order",
        referenceId: order.id,
        metadata: {
          info: "Reverse profit payout on order refund",
          orderNumber: order.orderNumber,
        },
      }, { session });

      await EventBus.publish(
        "finance.refund_processed",
        {
          ledgerEntryId: entry.id,
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
