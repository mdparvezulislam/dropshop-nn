import { FeatureFlags } from "@/lib/core/feature-flags";
import { EventRegistry } from "@/lib/event-bus/event-registry";
import { logger } from "@/lib/utils/logger";

let registered = false;

export function registerCourierFeatureFlags(): void {
  if (registered) return;
  registered = true;

  logger.info("Initializing Courier & Fulfillment Engine");

  try {
    FeatureFlags.register({
      key: "courier-management",
      name: "Courier & Fulfillment",
      description: "Shipments, courier assignment, package data and fulfillment status tracking",
      defaultState: "on",
    });
  } catch (err) {
    logger.warn("Courier feature flags already registered", { error: err });
  }

  /**
   * Note on what is deliberately NOT registered here: there is no
   * `order.confirmed → auto-create shipment` subscriber any more.
   *
   * The previous one created a shipment for every confirmed order against a
   * hardcoded courier with a guessed 500g / 15cm parcel — numbers nobody had
   * weighed or chosen. It also wrote `status: "created"`, which the shipment
   * schema does not allow, so every write it attempted was rejected.
   *
   * Shipment creation is now an explicit operator step, taken once the parcel
   * is actually packed and the courier is actually chosen.
   */
  try {
    EventRegistry.registerSyncSubscriber("courier.shipment_status_changed", {
      eventType: "courier.shipment_status_changed",
      priority: 10,
      handle: async (event) => {
        // Order-side status sync happens inside FulfillmentService, where the
        // order state machine can veto an illegal edge. This subscriber exists
        // for downstream listeners (finance, notifications) to hang off.
        logger.info("Courier: shipment status changed", {
          shipmentId: event.data.shipmentId,
          orderId: event.data.orderId,
          toStatus: event.data.toStatus,
        });
      },
    });

    logger.info("Courier event listeners registered");
  } catch (err) {
    logger.error("Failed to register courier event subscribers", err);
  }
}
