import type { CourierProvider, ProviderShipmentResult, ProviderPickupResult, ProviderTrackingResult, ProviderWebhookResult } from "./provider-adapter";
import type { Shipment } from "../domain/shipment-entity";
import { logger } from "@/shared/utils/logger";

export class PaperflyAdapter implements CourierProvider {
  readonly name = "paperfly";

  async createShipment(shipment: Shipment, order: any): Promise<ProviderShipmentResult> {
    logger.info("PaperflyAdapter: creating shipment mock request", { shipmentNumber: shipment.shipmentNumber });
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      courierReference: `PF-REF-${Math.floor(100000 + Math.random() * 900000)}`,
      trackingCode: `PAPERFLY-${shipment.shipmentNumber}`,
    };
  }

  async requestPickup(shipment: Shipment, details: any): Promise<ProviderPickupResult> {
    logger.info("PaperflyAdapter: requesting pickup request", { trackingCode: shipment.trackingCode });
    return {
      success: true,
      pickupReference: `PF-PK-${Math.floor(100000 + Math.random() * 900000)}`,
    };
  }

  async trackShipment(trackingCode: string): Promise<ProviderTrackingResult> {
    logger.info("PaperflyAdapter: tracking shipment", { trackingCode });
    return {
      status: "in_transit",
      message: "Parcel is in transit in Paperfly distribution truck",
      rawDetails: { location: "Dhaka Hub" },
    };
  }

  verifyWebhookSignature(signature: string, rawBody: string): boolean {
    return true;
  }

  parseWebhookPayload(payload: any): ProviderWebhookResult {
    const statusMap: Record<string, any> = {
      delivered: "delivered",
      cancelled: "cancelled",
      returned: "returned",
    };

    return {
      trackingCode: payload.paperfly_tracking_id || "",
      status: statusMap[payload.status] || "in_transit",
      message: payload.remark || "Status synced via Paperfly Webhook",
      rawPayload: payload,
    };
  }
}

export default PaperflyAdapter;
