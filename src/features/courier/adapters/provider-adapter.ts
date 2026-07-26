import type { Shipment, ShipmentStatus } from "../domain/shipment-entity";

export interface ProviderShipmentResult {
  success: boolean;
  courierReference: string;
  consignmentId?: string;
  trackingCode: string;
  trackingUrl?: string;
  error?: string;
}

export interface ProviderPickupResult {
  success: boolean;
  pickupReference?: string;
  error?: string;
}

export interface ProviderTrackingResult {
  status: ShipmentStatus;
  nativeStatus: string;
  message: string;
  location?: string;
  updatedAt?: Date;
  rawDetails?: Record<string, unknown>;
}

export interface ProviderWebhookResult {
  trackingCode: string;
  consignmentId?: string;
  status: ShipmentStatus;
  nativeStatus: string;
  message: string;
  rawPayload: unknown;
}

export interface ConnectionTestResult {
  success: boolean;
  latencyMs: number;
  message: string;
}

export interface CourierProvider {
  name: string;
  testConnection(): Promise<ConnectionTestResult>;
  createShipment(shipment: Shipment, order: any): Promise<ProviderShipmentResult>;
  cancelShipment(
    trackingCode: string,
    consignmentId?: string,
  ): Promise<{ success: boolean; error?: string }>;
  requestPickup(shipment: Shipment, details: any): Promise<ProviderPickupResult>;
  trackShipment(trackingCode: string): Promise<ProviderTrackingResult>;
  verifyWebhookSignature(signature: string, rawBody: string): boolean;
  parseWebhookPayload(payload: any): ProviderWebhookResult;
  mapStatus(nativeStatus: string): ShipmentStatus;
}
