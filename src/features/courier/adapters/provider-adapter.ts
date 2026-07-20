import type { Shipment, ShipmentStatus } from "../domain/shipment-entity";

export interface ProviderShipmentResult {
  success: boolean;
  courierReference: string;
  trackingCode: string;
  error?: string;
}

export interface ProviderPickupResult {
  success: boolean;
  pickupReference?: string;
  error?: string;
}

export interface ProviderTrackingResult {
  status: ShipmentStatus;
  message: string;
  rawDetails?: Record<string, any>;
}

export interface ProviderWebhookResult {
  trackingCode: string;
  status: ShipmentStatus;
  message: string;
  rawPayload: any;
}

export interface CourierProvider {
  name: string;
  createShipment(shipment: Shipment, order: any): Promise<ProviderShipmentResult>;
  requestPickup(shipment: Shipment, details: any): Promise<ProviderPickupResult>;
  trackShipment(trackingCode: string): Promise<ProviderTrackingResult>;
  verifyWebhookSignature(signature: string, rawBody: string): boolean;
  parseWebhookPayload(payload: any): ProviderWebhookResult;
}
