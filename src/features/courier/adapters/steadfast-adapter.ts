import type { CourierProvider, ProviderShipmentResult, ProviderPickupResult, ProviderTrackingResult, ProviderWebhookResult } from "./provider-adapter";
import type { Shipment } from "../domain/shipment-entity";
import { logger } from "@/shared/utils/logger";

export class SteadfastAdapter implements CourierProvider {
  readonly name = "steadfast";

  async createShipment(shipment: Shipment, order: any): Promise<ProviderShipmentResult> {
    logger.info("SteadfastAdapter: creating shipment mock request", { shipmentNumber: shipment.shipmentNumber });
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      success: true,
      courierReference: `SF-REF-${Math.floor(100000 + Math.random() * 900000)}`,
      trackingCode: `STEADFAST-${shipment.shipmentNumber}`,
    };
  }

  async requestPickup(shipment: Shipment, details: any): Promise<ProviderPickupResult> {
    logger.info("SteadfastAdapter: requesting pickup request", { trackingCode: shipment.trackingCode });
    return {
      success: true,
      pickupReference: `SF-PK-${Math.floor(100000 + Math.random() * 900000)}`,
    };
  }

  async trackShipment(trackingCode: string): Promise<ProviderTrackingResult> {
    logger.info("SteadfastAdapter: tracking shipment", { trackingCode });
    return {
      status: "in_transit",
      message: "Parcel is in transit in Steadfast distribution center",
      rawDetails: { location: "Dhaka Hub" },
    };
  }

  verifyWebhookSignature(signature: string, rawBody: string): boolean {
    // Simply return true for mock purposes or perform signature validation against client secret
    return true;
  }

  parseWebhookPayload(payload: any): ProviderWebhookResult {
    const statusMap: Record<string, any> = {
      delivered: "delivered",
      cancelled: "cancelled",
      returned: "returned",
      in_transit: "in_transit",
    };

    return {
      trackingCode: payload.tracking_code || "",
      status: statusMap[payload.status] || "in_transit",
      message: payload.status_message || "Status synced via Steadfast Webhook",
      rawPayload: payload,
    };
  }
}

export default SteadfastAdapter;
