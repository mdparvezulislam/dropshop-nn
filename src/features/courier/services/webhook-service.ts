import { ShipmentRepository } from "../repositories/shipment-repository";
import { CourierService } from "./courier-service";
import { CourierProviderRegistry } from "../adapters/provider-registry";
import { logger } from "@/shared/utils/logger";

export class WebhookService {
  private readonly shipmentRepository: ShipmentRepository;
  private readonly courierService: CourierService;

  constructor() {
    this.shipmentRepository = new ShipmentRepository();
    this.courierService = new CourierService();
  }

  async processProviderWebhook(
    providerName: string,
    signature: string,
    rawBody: string,
    payload: any,
  ): Promise<{ success: boolean; error?: string }> {
    logger.info("WebhookService: received external courier webhook callback log", {
      providerName,
      payload,
    });

    try {
      const adapter = CourierProviderRegistry.get(providerName);
      
      // 1. Authenticate Signature
      const isValid = adapter.verifyWebhookSignature(signature, rawBody);
      if (!isValid) {
        logger.error("WebhookService: signature verification failed", { providerName });
        return { success: false, error: "Invalid signature verification" };
      }

      // 2. Parse Webhook Payload to unified properties
      const parsed = adapter.parseWebhookPayload(payload);
      if (!parsed.trackingCode) {
        return { success: false, error: "Missing tracking code in payload" };
      }

      // 3. Retrieve Shipment
      const shipment = await this.shipmentRepository.findByTrackingCode(parsed.trackingCode);
      if (!shipment) {
        logger.warn("WebhookService: shipment not found for tracking code", { trackingCode: parsed.trackingCode });
        return { success: false, error: "Shipment not found" };
      }

      // 4. Duplicate Check (State Idempotency Guard)
      if (shipment.status === parsed.status) {
        logger.info("WebhookService: status already updated, skipping duplicate callback processing", {
          shipmentId: shipment.id,
          status: parsed.status,
        });
        return { success: true };
      }

      // 5. Update Status
      await this.courierService.transitionStatus(
        shipment.id,
        parsed.status,
        parsed.message || `Status updated via ${providerName} webhook integration`,
        "webhook-service",
      );

      return { success: true };
    } catch (err: any) {
      logger.error("WebhookService: processing failure", err);
      return { success: false, error: err.message };
    }
  }
}

export default WebhookService;
