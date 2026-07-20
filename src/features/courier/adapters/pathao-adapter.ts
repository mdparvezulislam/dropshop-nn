import type { CourierProvider, ProviderShipmentResult, ProviderPickupResult, ProviderTrackingResult, ProviderWebhookResult } from "./provider-adapter";
import type { Shipment } from "../domain/shipment-entity";
import { logger } from "@/shared/utils/logger";

export class PathaoAdapter implements CourierProvider {
  readonly name = "pathao";

  async createShipment(shipment: Shipment, order: any): Promise<ProviderShipmentResult> {
    logger.info("PathaoAdapter: creating shipment mock request", { shipmentNumber: shipment.shipmentNumber });
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      courierReference: `PT-REF-${Math.floor(100000 + Math.random() * 900000)}`,
      trackingCode: `PATHAO-${shipment.shipmentNumber}`,
    };
  }

  async requestPickup(shipment: Shipment, details: any): Promise<ProviderPickupResult> {
    logger.info("PathaoAdapter: requesting pickup request", { trackingCode: shipment.trackingCode });
    return {
      success: true,
      pickupReference: `PT-PK-${Math.floor(100000 + Math.random() * 900000)}`,
    };
  }

  async trackShipment(trackingCode: string): Promise<ProviderTrackingResult> {
    logger.info("PathaoAdapter: tracking shipment", { trackingCode });
    return {
      status: "out_for_delivery",
      message: "Delivery rider is out for delivery",
      rawDetails: { riderName: "Pathao Rider", riderPhone: "01700000000" },
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
      trackingCode: payload.consignment_id || "",
      status: statusMap[payload.status] || "in_transit",
      message: payload.reason || "Status synced via Pathao Webhook",
      rawPayload: payload,
    };
  }
}

export default PathaoAdapter;
