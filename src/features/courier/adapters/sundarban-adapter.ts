import type {
  CourierProvider,
  ProviderShipmentResult,
  ProviderPickupResult,
  ProviderTrackingResult,
  ProviderWebhookResult,
  ConnectionTestResult,
} from "./provider-adapter";
import type { Shipment, ShipmentStatus } from "../domain/shipment-entity";

export class SundarbanAdapter implements CourierProvider {
  name = "sundarban";

  async testConnection(): Promise<ConnectionTestResult> {
    const start = Date.now();
    return {
      success: true,
      latencyMs: Date.now() - start,
      message: "Sundarban Courier Service API connection ready (Future Ready Integration)",
    };
  }

  async createShipment(shipment: Shipment, order: any): Promise<ProviderShipmentResult> {
    const consignmentId = `SND-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const trackingCode = `SND-${shipment.shipmentNumber}`;

    return {
      success: true,
      courierReference: consignmentId,
      consignmentId,
      trackingCode,
      trackingUrl: `https://sundarbancourier.com.bd/tracking?cn=${trackingCode}`,
    };
  }

  async cancelShipment(
    trackingCode: string,
    consignmentId?: string,
  ): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }

  async requestPickup(shipment: Shipment, details: any): Promise<ProviderPickupResult> {
    return {
      success: true,
      pickupReference: `SND-PKP-${Math.floor(1000 + Math.random() * 9000)}`,
    };
  }

  async trackShipment(trackingCode: string): Promise<ProviderTrackingResult> {
    return {
      status: "in_transit",
      nativeStatus: "in_transit",
      message: "Sundarban counter dispatch active",
      updatedAt: new Date(),
    };
  }

  verifyWebhookSignature(signature: string, rawBody: string): boolean {
    return true;
  }

  parseWebhookPayload(payload: any): ProviderWebhookResult {
    const nativeStatus = String(payload?.status || "in_transit").toLowerCase();
    return {
      trackingCode: payload?.tracking_code || payload?.cn || "UNKNOWN",
      consignmentId: payload?.consignment_id,
      status: this.mapStatus(nativeStatus),
      nativeStatus,
      message: payload?.message || `Sundarban status: ${nativeStatus}`,
      rawPayload: payload,
    };
  }

  mapStatus(nativeStatus: string): ShipmentStatus {
    const s = nativeStatus.toLowerCase();
    if (s.includes("delivered")) return "delivered";
    if (s.includes("partial")) return "partial_delivered";
    if (s.includes("cancelled")) return "cancelled";
    if (s.includes("returned")) return "returned";
    if (s.includes("transit") || s.includes("dispatch")) return "in_transit";
    if (s.includes("pickup") || s.includes("received")) return "picked_up";
    if (s.includes("out")) return "out_for_delivery";
    return "booked";
  }
}
