import type { CourierProvider, ProviderShipmentResult, ProviderPickupResult, ProviderTrackingResult, ProviderWebhookResult } from "./provider-adapter";
import type { Shipment } from "../domain/shipment-entity";
import { logger } from "@/shared/utils/logger";

export class EcourierAdapter implements CourierProvider {
  readonly name = "ecourier";

  async createShipment(shipment: Shipment, order: any): Promise<ProviderShipmentResult> {
    logger.info("EcourierAdapter: creating shipment mock request", { shipmentNumber: shipment.shipmentNumber });
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      courierReference: `EC-REF-${Math.floor(100000 + Math.random() * 900000)}`,
      trackingCode: `ECOURIER-${shipment.shipmentNumber}`,
    };
  }

  async requestPickup(shipment: Shipment, details: any): Promise<ProviderPickupResult> {
    logger.info("EcourierAdapter: requesting pickup request", { trackingCode: shipment.trackingCode });
    return {
      success: true,
      pickupReference: `EC-PK-${Math.floor(100000 + Math.random() * 900000)}`,
    };
  }

  async trackShipment(trackingCode: string): Promise<ProviderTrackingResult> {
    logger.info("EcourierAdapter: tracking shipment", { trackingCode });
    return {
      status: "hub_received",
      message: "Parcel is received at eCourier central sorting facility",
      rawDetails: { location: "Tejgaon Sorting Hub" },
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
      trackingCode: payload.ec_tracking_code || "",
      status: statusMap[payload.status] || "in_transit",
      message: payload.comment || "Status synced via eCourier Webhook",
      rawPayload: payload,
    };
  }
}

export default EcourierAdapter;
