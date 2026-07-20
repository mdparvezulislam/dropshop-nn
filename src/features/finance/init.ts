import { FeatureFlags } from "@/shared/core/feature-flags";
import { Settings } from "@/shared/core/feature-flags";
import { EventRegistry } from "@/shared/lib/event-bus/event-registry";
import { logger } from "@/shared/utils/logger";

let registered = false;

export function registerFinanceFeatureFlags(): void {
  if (registered) return;
  registered = true;

  logger.info("Initializing Finance, Wallet & Ledger Engine Feature Flags and Settings");

  try {
    // 1. Feature Flags
    FeatureFlags.register({
      key: "finance-management",
      name: "Finance & Wallet Engine",
      description: "Enterprise Ledger-First Payouts, Wallet and Withdrawals",
      defaultState: "on",
    });

    // 2. Settings
    Settings.register({
      key: "finance.profit-release-delay-days",
      name: "Profit Release Delay (Days)",
      description: "Configurable waiting clearance period before order profits become available",
      scope: "global",
      defaultValue: 7,
    });

    Settings.register({
      key: "finance.withdrawal-expiry-days",
      name: "Withdrawal Expiry Delay (Days)",
      description: "Auto-expire pending withdrawals after N days",
      scope: "global",
      defaultValue: 10,
    });
  } catch (err) {
    logger.warn("Finance feature flags / settings already registered or encountered minor error", { error: err });
  }

  // 3. Event Subscriptions
  try {
    // Subscriber: workspace.approved / identity.business_approved -> create wallet
    EventRegistry.registerSyncSubscriber("identity.business_approved", {
      eventType: "identity.business_approved",
      priority: 10,
      handle: async (event) => {
        const { userId, userType } = event.data;
        const { WalletService } = await import("./services/wallet-service");
        const walletService = new WalletService();
        const role = userType === "reseller" ? "reseller" : "admin";
        await walletService.createWallet(userId as string, role);
      },
    });

    // Subscriber: order.completed -> release profit & generate invoice
    EventRegistry.registerSyncSubscriber("order.completed", {
      eventType: "order.completed",
      priority: 10,
      handle: async (event) => {
        const { orderId } = event.data;
        const { OrderRepository } = await import("@/features/order/repositories/order-repository");
        const orderRepo = new OrderRepository();
        const order = await orderRepo.findById(orderId as string);
        if (order) {
          const { FinanceService } = await import("./services/finance-service");
          const financeService = new FinanceService();
          await financeService.releaseProfit(order);

          const { InvoiceService } = await import("./services/invoice-service");
          const invoiceService = new InvoiceService();
          await invoiceService.generateInvoice(order);
        }
      },
    });

    // Subscriber: order.refunded -> reverse profit credit
    EventRegistry.registerSyncSubscriber("order.refunded", {
      eventType: "order.refunded",
      priority: 10,
      handle: async (event) => {
        const { orderId } = event.data;
        const { OrderRepository } = await import("@/features/order/repositories/order-repository");
        const orderRepo = new OrderRepository();
        const order = await orderRepo.findById(orderId as string);
        if (order) {
          const { FinanceService } = await import("./services/finance-service");
          const financeService = new FinanceService();
          await financeService.reverseProfit(order);
        }
      },
    });

    logger.info("Finance Event Subscribers Registered Successfully");
  } catch (err) {
    logger.error("Failed to register finance event subscribers", err);
  }
}
