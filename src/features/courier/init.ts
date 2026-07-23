import { FeatureFlags } from "@/lib/core/feature-flags";
import { EventRegistry } from "@/lib/event-bus/event-registry";
import { logger } from "@/lib/utils/logger";

let registered = false;

export function registerCourierFeatureFlags(): void {
  if (registered) return;
  registered = true;

  logger.info("Initializing Courier & Fulfillment Engine Feature Flags");

  try {
    FeatureFlags.register({
      key: "courier-management",
      name: "Courier & Fulfillment",
      description: "Enterprise Logistics, Shipments, Pickups and Status Webhooks Sync",
      defaultState: "on",
    });
  } catch (err) {
    logger.warn("Courier feature flags already registered or minor bootstrapping error occurred", { error: err });
  }

  // Event Subscriptions
  try {
    // 1. Subscriber: order.confirmed -> auto-generate shipment
    EventRegistry.registerSyncSubscriber("order.confirmed", {
      eventType: "order.confirmed",
      priority: 10,
      handle: async (event) => {
        const { orderId } = event.data;
        const { OrderRepository } = await import("@/features/order/repositories/order-repository");
        const orderRepo = new OrderRepository();
        const order = await orderRepo.findById(orderId as string);
        if (order) {
          const { CourierService } = await import("./services/courier-service");
          const courierService = new CourierService();

          // Auto-detect zone
          const isInsideDhaka = order.shipping.division?.toLowerCase().includes("dhaka");
          const deliveryZone = isInsideDhaka ? "inside_city" as const : "outside_city" as const;

          await courierService.createShipment({
            orderId: order.id,
            provider: "steadfast",
            deliveryZone,
            parcelType: "parcel",
            parcelWeight: 500,
            dimensions: { width: 15, height: 15, depth: 15 },
          });
        }
      },
    });

    // 2. Subscriber: courier.shipment_delivered -> order.delivered
    EventRegistry.registerSyncSubscriber("courier.shipment_delivered", {
      eventType: "courier.shipment_delivered",
      priority: 10,
      handle: async (event) => {
        const { orderId } = event.data;
        const { OrderService } = await import("@/features/order/services/order-service");
        const orderService = new OrderService();
        
        // Transition order status to delivered
        await orderService.transitionStatus(
          orderId as string,
          "delivered",
          { id: "courier-agent", role: "system" },
          "Delivered via courier partner logistics",
        );

        // Also transition order status to completed to trigger finance profit releases!
        await orderService.transitionStatus(
          orderId as string,
          "completed",
          { id: "courier-agent", role: "system" },
          "Auto-completed on delivery verification",
        );
      },
    });

    // 3. Subscriber: courier.shipment_returned -> order.returned
    EventRegistry.registerSyncSubscriber("courier.shipment_returned", {
      eventType: "courier.shipment_returned",
      priority: 10,
      handle: async (event) => {
        const { orderId } = event.data;
        const { OrderService } = await import("@/features/order/services/order-service");
        const orderService = new OrderService();

        await orderService.transitionStatus(
          orderId as string,
          "returned",
          { id: "courier-agent", role: "system" },
          "Returned via courier partner logistics",
        );
      },
    });

    logger.info("Courier Event Listeners Registered Successfully");
  } catch (err) {
    logger.error("Failed to register courier event subscribers", err);
  }
}
