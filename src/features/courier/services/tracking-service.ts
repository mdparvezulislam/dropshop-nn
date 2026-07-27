import { ShipmentRepository } from "../repositories/shipment-repository";
import { WebhookEventRepository } from "../repositories/webhook-event-repository";
import { CourierProviderRegistry } from "../adapters/provider-registry";
import { FulfillmentService } from "./fulfillment-service";
import { getCourierName } from "../domain/courier-catalog";
import type { Shipment } from "../domain/shipment-entity";
import { NotFoundError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";

export interface TrackingSyncResult {
  shipment: Shipment;
  /** True when the courier actually answered and the status moved. */
  changed: boolean;
  message: string;
}

/**
 * Reads shipment status from the courier. Status *writes* always go through
 * `FulfillmentService` so the shipment state machine and the order-side sync
 * apply identically whether the trigger was a human, a poll or a webhook.
 */
export class TrackingService {
  private readonly shipmentRepository: ShipmentRepository;
  private readonly webhookEventRepository: WebhookEventRepository;
  private readonly fulfillment: FulfillmentService;

  constructor() {
    this.shipmentRepository = new ShipmentRepository();
    this.webhookEventRepository = new WebhookEventRepository();
    this.fulfillment = new FulfillmentService();
  }

  async syncShipmentTracking(
    shipmentId: string,
    actorId: string = "system",
  ): Promise<TrackingSyncResult> {
    const shipment = await this.shipmentRepository.findById(shipmentId);
    if (!shipment) throw new NotFoundError(`Shipment not found: ${shipmentId}`);

    const courierName = getCourierName(shipment.provider);

    if (!shipment.trackingCode) {
      return {
        shipment,
        changed: false,
        message: `No tracking number recorded yet for this shipment.`,
      };
    }

    const adapter = CourierProviderRegistry.get(shipment.provider);
    const tracking = await adapter.trackShipment(shipment.trackingCode);

    // Manual-mode providers cannot answer. Say so rather than writing a
    // status the courier never reported.
    if (!tracking) {
      await this.shipmentRepository.update(shipmentId, { lastSyncedAt: new Date() });
      return {
        shipment,
        changed: false,
        message: `${courierName} has no live tracking integration. Update the status manually from the courier's panel.`,
      };
    }

    if (tracking.status === shipment.status) {
      const synced = await this.shipmentRepository.update(shipmentId, { lastSyncedAt: new Date() });
      return { shipment: synced, changed: false, message: "Already up to date." };
    }

    const updated = await this.fulfillment.updateShipmentStatus(
      shipmentId,
      tracking.status,
      { id: actorId, role: "system" },
      {
        message: tracking.message,
        location: tracking.location,
        nativeStatus: tracking.nativeStatus,
      },
    );

    return { shipment: updated, changed: true, message: tracking.message };
  }

  /**
   * Records a courier callback and applies it. The adapter authenticates the
   * payload first — an unsigned callback is logged and dropped.
   */
  async processWebhookEvent(
    provider: string,
    rawPayload: unknown,
    actorId: string = "system",
  ): Promise<boolean> {
    const adapter = CourierProviderRegistry.get(provider);
    const parsed = adapter.parseWebhookPayload(rawPayload);

    await this.webhookEventRepository.create({
      provider,
      event: parsed.nativeStatus,
      payload: rawPayload,
      processed: false,
      retryCount: 0,
    } as never);

    if (!parsed.trackingCode) {
      logger.warn("TrackingService: webhook has no tracking code", { provider });
      return false;
    }

    const shipment = await this.shipmentRepository.findByTrackingCode(parsed.trackingCode);
    if (!shipment) {
      logger.warn("TrackingService: webhook for unknown tracking code", {
        trackingCode: parsed.trackingCode,
      });
      return false;
    }

    if (shipment.status === parsed.status) return true;

    await this.fulfillment.updateShipmentStatus(
      shipment.id,
      parsed.status,
      { id: `${actorId}:${provider}`, role: "system" },
      { message: parsed.message, nativeStatus: parsed.nativeStatus },
    );
    return true;
  }
}

export default TrackingService;
