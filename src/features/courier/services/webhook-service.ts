import { ShipmentRepository } from "../repositories/shipment-repository";
import { FulfillmentService } from "./fulfillment-service";
import { CourierProviderRegistry } from "../adapters/provider-registry";
import { logger } from "@/lib/utils/logger";

export class WebhookService {
  private readonly shipmentRepository: ShipmentRepository;
  private readonly fulfillment: FulfillmentService;

  constructor() {
    this.shipmentRepository = new ShipmentRepository();
    this.fulfillment = new FulfillmentService();
  }

  /**
   * Handles a courier status callback.
   *
   * Manual-mode providers have no shared secret, so `verifyWebhookSignature`
   * returns false and every payload is rejected. That is the correct posture:
   * an unauthenticated endpoint that writes shipment statuses would let anyone
   * who knows a tracking number mark an order delivered.
   */
  async processProviderWebhook(
    providerName: string,
    signature: string,
    rawBody: string,
    payload: unknown,
  ): Promise<{ success: boolean; error?: string }> {
    logger.info("WebhookService: courier webhook received", { providerName });

    try {
      const adapter = CourierProviderRegistry.get(providerName);

      if (!adapter.verifyWebhookSignature(signature, rawBody)) {
        logger.warn("WebhookService: signature rejected", { providerName });
        return { success: false, error: "Invalid webhook signature" };
      }

      const parsed = adapter.parseWebhookPayload(payload);
      if (!parsed.trackingCode) {
        return { success: false, error: "Missing tracking code in payload" };
      }

      const shipment = await this.shipmentRepository.findByTrackingCode(parsed.trackingCode);
      if (!shipment) {
        logger.warn("WebhookService: no shipment for tracking code", {
          trackingCode: parsed.trackingCode,
        });
        return { success: false, error: "Shipment not found" };
      }

      // Idempotency: couriers retry callbacks, often several times.
      if (shipment.status === parsed.status) {
        return { success: true };
      }

      await this.fulfillment.updateShipmentStatus(
        shipment.id,
        parsed.status,
        { id: `webhook:${providerName}`, role: "system" },
        { message: parsed.message, nativeStatus: parsed.nativeStatus },
      );

      return { success: true };
    } catch (err) {
      logger.error("WebhookService: processing failure", err);
      return { success: false, error: "Webhook could not be processed" };
    }
  }
}

export default WebhookService;
