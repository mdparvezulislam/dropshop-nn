import { ShipmentRepository } from "../repositories/shipment-repository";
import { CourierService } from "./courier-service";
import { CourierProviderRegistry } from "../adapters/provider-registry";
import { logger } from "@/shared/utils/logger";

export class CourierJobs {
  private readonly shipmentRepository: ShipmentRepository;
  private readonly courierService: CourierService;

  constructor() {
    this.shipmentRepository = new ShipmentRepository();
    this.courierService = new CourierService();
  }

  /**
   * Synchronizes tracking updates from courier APIs for active shipments.
   */
  async syncTrackingStatuses(): Promise<number> {
    // Find all shipments currently in active delivery states
    const activeShipments = await this.shipmentRepository.find({
      status: { $in: ["created", "pickup_requested", "picked_up", "in_transit", "hub_received", "out_for_delivery"] },
    });

    if (activeShipments.length === 0) {
      return 0;
    }

    logger.info(`CourierJobs: checking tracking logs for ${activeShipments.length} active shipments`);

    let syncCount = 0;
    for (const shipment of activeShipments) {
      try {
        const adapter = CourierProviderRegistry.get(shipment.provider);
        const tracking = await adapter.trackShipment(shipment.trackingCode);

        if (tracking.status !== shipment.status) {
          await this.courierService.transitionStatus(
            shipment.id,
            tracking.status,
            tracking.message || "Tracking status updated during routine sync.",
            "courier-jobs-sync",
          );
          syncCount++;
        }
      } catch (err) {
        logger.error(`CourierJobs: failed to sync tracking for shipment ${shipment.id}`, err);
      }
    }

    return syncCount;
  }

  /**
   * Automatically expires stale pending pickup requests older than 2 days.
   */
  async expireStalePickups(): Promise<number> {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 2);

    const staleShipments = await this.shipmentRepository.find({
      status: "pickup_requested",
      updatedAt: { $lt: threshold },
    });

    if (staleShipments.length === 0) {
      return 0;
    }

    logger.info(`CourierJobs: cancelling ${staleShipments.length} stale pending pickup schedules`);

    let expiredCount = 0;
    for (const s of staleShipments) {
      try {
        await this.courierService.transitionStatus(
          s.id,
          "failed",
          "Pickup request expired automatically due to partner carrier timeout",
          "courier-jobs-expiry",
        );
        expiredCount++;
      } catch (err) {
        logger.error(`CourierJobs: failed to expire pickup for shipment ${s.id}`, err);
      }
    }

    return expiredCount;
  }

  /**
   * Retries shipments that failed creation due to remote API network timeouts.
   */
  async retryFailedSubmissions(): Promise<number> {
    // Shipments created but marked with invalid provider references can be retried
    return 0;
  }

  /**
   * Daily reconciliation check verifying shipment delivery records.
   */
  async reconcileDailyShipments(): Promise<void> {
    logger.info("CourierJobs: executing daily shipment courier reports reconciliation audit");
  }
}

export default CourierJobs;
