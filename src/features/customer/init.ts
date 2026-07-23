import { FeatureFlags } from "@/lib/core/feature-flags";
import { EventRegistry } from "@/lib/event-bus/event-registry";
import { logger } from "@/lib/utils/logger";

let registered = false;

export function registerCustomerFeatureFlags(): void {
  if (registered) return;
  registered = true;

  logger.info("Initializing Customer Relationship Engine Feature Flags");

  try {
    FeatureFlags.register({
      key: "customer-management",
      name: "Customer Relationship Engine",
      description: "Enterprise Customer Profiles, Timeline auditing, Segment tagging, and Statistics",
      defaultState: "on",
    });
  } catch (err) {
    logger.warn("Customer feature flags already registered or minor bootstrapping error occurred", { error: err });
  }

  // Event Subscriptions
  try {
    // 1. Subscriber: order.created -> create/attach customer profile
    EventRegistry.registerSyncSubscriber("order.created", {
      eventType: "order.created",
      priority: 10,
      handle: async (event) => {
        const { orderId } = event.data;
        const { OrderRepository } = await import("@/features/order/repositories/order-repository");
        const orderRepo = new OrderRepository();
        const order = await orderRepo.findById(orderId as string);
        if (order) {
          const { CustomerService } = await import("./services/customer-service");
          const customerService = new CustomerService();
          await customerService.createOrAttachCustomer(order);
        }
      },
    });

    // 2. Subscriber: order.completed -> refresh metrics statistics
    EventRegistry.registerSyncSubscriber("order.completed", {
      eventType: "order.completed",
      priority: 10,
      handle: async (event) => {
        const { orderId } = event.data;
        const { CustomerService } = await import("./services/customer-service");
        const customerService = new CustomerService();
        await customerService.refreshStatistics(orderId as string);
      },
    });

    // 3. Subscriber: order.cancelled -> refresh metrics statistics
    EventRegistry.registerSyncSubscriber("order.cancelled", {
      eventType: "order.cancelled",
      priority: 10,
      handle: async (event) => {
        const { orderId } = event.data;
        const { CustomerService } = await import("./services/customer-service");
        const customerService = new CustomerService();
        await customerService.refreshStatistics(orderId as string);
      },
    });

    logger.info("Customer Event Listeners Registered Successfully");
  } catch (err) {
    logger.error("Failed to register customer event subscribers", err);
  }
}
