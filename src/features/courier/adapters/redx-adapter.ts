import type { CourierProvider, ProviderShipmentResult, ProviderPickupResult, ProviderTrackingResult, ProviderWebhookResult } from "./provider-adapter";
import type { Shipment } from "../domain/shipment-entity";
import { logger } from "@/shared/utils/logger";

export class RedxAdapter implements CourierProvider {
  readonly name = "redx";

  async createShipment(shipment: Shipment, order: any): Promise<ProviderShipmentResult> {
    logger.info("RedxAdapter: creating shipment mock request", { shipmentNumber: shipment.shipmentNumber });
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      courierReference: `RX-REF-${Math.floor(100000 + Math.random() * 900000)}`,
      trackingCode: `REDX-${shipment.shipmentNumber}`,
    };
  }

  async requestPickup(shipment: Shipment, details: any): Promise<ProviderPickupResult> {
    logger.info("RedxAdapter: requesting pickup request", { trackingCode: shipment.trackingCode });
    return {
      success: true,
      pickupReference: `RX-PK-${Math.floor(100000 + Math.random() * 900000)}`,
    };
  }

  async trackShipment(trackingCode: string): Promise<ProviderTrackingResult> {
    logger.info("RedxAdapter: tracking shipment", { trackingCode });
    return {
      status: "picked_up",
      message: "Parcel is successfully received by RedX rider",
      rawDetails: { location: "Mirpur Hub" },
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
      trackingCode: payload.tracking_id || "",
      status: statusMap[payload.status] || "in_transit",
      message: payload.message || "Status synced via RedX Webhook",
      rawPayload: payload,
    };
  }
}

export default RedxAdapter;
