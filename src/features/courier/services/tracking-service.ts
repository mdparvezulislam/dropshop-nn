import { ShipmentRepository } from "../repositories/shipment-repository";
import { LogisticsAuditRepository } from "../repositories/logistics-audit-repository";
import { WebhookEventRepository } from "../repositories/webhook-event-repository";
import { CourierProviderRegistry } from "../adapters/provider-registry";
import type { Shipment, ShipmentStatus } from "../domain/shipment-entity";
import { logger } from "@/shared/utils/logger";
import { EventBus } from "@/shared/lib/event-bus/event-bus";

export class TrackingService {
  private readonly shipmentRepository: ShipmentRepository;
  private readonly auditRepository: LogisticsAuditRepository;
  private readonly webhookEventRepository: WebhookEventRepository;

  constructor() {
    this.shipmentRepository = new ShipmentRepository();
    this.auditRepository = new LogisticsAuditRepository();
    this.webhookEventRepository = new WebhookEventRepository();
  }

  async syncShipmentTracking(shipmentId: string, actorId: string = "system"): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findById(shipmentId);
    if (!shipment) {
      throw new Error(`Shipment not found: ${shipmentId}`);
    }

    const adapter = CourierProviderRegistry.get(shipment.provider);
    const trackingResult = await adapter.trackShipment(shipment.trackingCode);

    const oldStatus = shipment.status;
    const newStatus = trackingResult.status;

    let updatedHistory = [...shipment.history];
    if (oldStatus !== newStatus || trackingResult.message) {
      updatedHistory.push({
        status: newStatus,
        nativeStatus: trackingResult.nativeStatus,
        timestamp: trackingResult.updatedAt || new Date(),
        message: trackingResult.message || `Status updated via live sync to ${newStatus}`,
        location: trackingResult.location,
        actorId,
      });
    }

    const updated = await this.shipmentRepository.update(shipmentId, {
      status: newStatus,
      nativeStatus: trackingResult.nativeStatus,
      lastSyncedAt: new Date(),
      history: updatedHistory,
    } as any);

    if (oldStatus !== newStatus) {
      await this.auditRepository.create({
        referenceNumber: shipment.shipmentNumber,
        shipmentId,
        orderId: shipment.orderId,
        provider: shipment.provider,
        action: "status_changed",
        actorId,
        oldStatus,
        newStatus,
        reason: trackingResult.message,
      });

      // Finance & Order Hooks
      if (newStatus === "delivered") {
        await EventBus.publish(
          "courier.delivered",
          { shipmentId, orderId: shipment.orderId, codAmount: shipment.codAmount },
          { source: "tracking-service" },
        );
      } else if (newStatus === "returned") {
        await EventBus.publish(
          "courier.returned",
          { shipmentId, orderId: shipment.orderId, returnCharge: shipment.returnCharge },
          { source: "tracking-service" },
        );
      } else if (newStatus === "out_for_delivery") {
        await EventBus.publish(
          "courier.out_for_delivery",
          { shipmentId, orderId: shipment.orderId },
          { source: "tracking-service" },
        );
      }
    }

    return updated;
  }

  async processWebhookEvent(provider: string, rawPayload: any, actorId: string = "system"): Promise<boolean> {
    const adapter = CourierProviderRegistry.get(provider);
    const parsed = adapter.parseWebhookPayload(rawPayload);

    await this.webhookEventRepository.create({
      provider,
      event: parsed.status,
      payload: rawPayload,
      processed: false,
      retryCount: 0,
    } as any);

    const shipment = await this.shipmentRepository.findByTrackingCode(parsed.trackingCode);
    if (!shipment) {
      logger.warn("TrackingService: webhook received for unknown tracking code", { trackingCode: parsed.trackingCode });
      return false;
    }

    await this.syncShipmentTracking(shipment.id, `webhook:${provider}`);
    return true;
  }
}

export default TrackingService;
