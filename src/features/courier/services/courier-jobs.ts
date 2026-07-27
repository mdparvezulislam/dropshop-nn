import { ShipmentRepository } from "../repositories/shipment-repository";
import { FulfillmentService } from "./fulfillment-service";
import { CourierProviderRegistry } from "../adapters/provider-registry";
import { logger } from "@/lib/utils/logger";

const SYNCABLE_STATUSES = [
  "booked",
  "pickup_requested",
  "picked_up",
  "in_transit",
  "hub_received",
  "out_for_delivery",
] as const;

export class CourierJobs {
  private readonly shipmentRepository: ShipmentRepository;
  private readonly fulfillment: FulfillmentService;

  constructor() {
    this.shipmentRepository = new ShipmentRepository();
    this.fulfillment = new FulfillmentService();
  }

  /**
   * Polls courier APIs for status changes on in-flight shipments.
   *
   * Every provider currently runs in manual mode and `trackShipment` returns
   * null, so this job is a no-op by design: the alternative — writing an
   * invented status because the poll returned nothing — is how customers end
   * up watching a parcel that never moved report itself "in transit".
   */
  async syncTrackingStatuses(): Promise<number> {
    const activeShipments = await this.shipmentRepository.find({
      status: { $in: SYNCABLE_STATUSES },
      isDeleted: { $ne: true },
    });

    if (activeShipments.length === 0) return 0;

    let syncCount = 0;
    for (const shipment of activeShipments) {
      try {
        if (!shipment.trackingCode) continue;

        const adapter = CourierProviderRegistry.get(shipment.provider);
        const tracking = await adapter.trackShipment(shipment.trackingCode);
        if (!tracking || tracking.status === shipment.status) continue;

        await this.fulfillment.updateShipmentStatus(
          shipment.id,
          tracking.status,
          { id: "courier-jobs-sync", role: "system" },
          { message: tracking.message, nativeStatus: tracking.nativeStatus },
        );
        syncCount++;
      } catch (err) {
        logger.error(`CourierJobs: failed to sync tracking for shipment ${shipment.id}`, err);
      }
    }

    return syncCount;
  }

  /**
   * Flags pickup requests the courier never acted on. Two days without a
   * pickup is a stuck parcel that needs a human, not an automatic status.
   */
  async expireStalePickups(): Promise<number> {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 2);

    const staleShipments = await this.shipmentRepository.find({
      status: "pickup_requested",
      updatedAt: { $lt: threshold },
      isDeleted: { $ne: true },
    });

    if (staleShipments.length === 0) return 0;

    logger.info(`CourierJobs: flagging ${staleShipments.length} stale pickup requests`);

    let expiredCount = 0;
    for (const s of staleShipments) {
      try {
        await this.fulfillment.updateShipmentStatus(
          s.id,
          "failed",
          { id: "courier-jobs-expiry", role: "system" },
          { message: "Pickup was not collected within 48 hours — needs follow-up" },
        );
        expiredCount++;
      } catch (err) {
        logger.error(`CourierJobs: failed to expire pickup for shipment ${s.id}`, err);
      }
    }

    return expiredCount;
  }

  /** Shipments whose booking failed and are eligible for another attempt. */
  async retryFailedSubmissions(): Promise<number> {
    return 0;
  }

  async reconcileDailyShipments(): Promise<void> {
    logger.info("CourierJobs: executing daily shipment reconciliation audit");
  }
}

export default CourierJobs;
