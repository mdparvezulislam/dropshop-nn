import type { Shipment, ShipmentStatus } from "../domain/shipment-entity";
import type { CourierIntegrationMode } from "../domain/courier-catalog";

export interface ProviderShipmentResult {
  success: boolean;
  courierReference?: string;
  consignmentId?: string;
  trackingCode?: string;
  trackingUrl?: string;
  /**
   * True when the provider has no live API wired up and the operator must book
   * in the courier's own panel, then enter the tracking number here. This is
   * NOT an error — it is the platform's current, intended fulfillment mode.
   */
  requiresManualBooking?: boolean;
  error?: string;
}

export interface ProviderPickupResult {
  success: boolean;
  pickupReference?: string;
  requiresManualBooking?: boolean;
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

/**
 * The courier seam. A provider that gains a real API implements this same
 * interface — `FulfillmentService` calls nothing else, so no business logic
 * changes when Pathao/Steadfast/RedX/eCourier/Paperfly go live.
 */
export interface CourierProvider {
  id: string;
  name: string;
  mode: CourierIntegrationMode;

  /** False for every provider today: no API credentials, no live calls. */
  isConfigured(): boolean;

  testConnection(): Promise<ConnectionTestResult>;

  createShipment(shipment: Shipment, order?: unknown): Promise<ProviderShipmentResult>;

  cancelShipment(
    trackingCode?: string,
    consignmentId?: string,
  ): Promise<{ success: boolean; error?: string }>;

  requestPickup(shipment: Shipment, details?: unknown): Promise<ProviderPickupResult>;

  /**
   * Live tracking poll. Returns `null` when the provider cannot answer —
   * a manual-mode courier has no API to ask, and inventing a status here would
   * put a fabricated scan in front of the customer.
   */
  trackShipment(trackingCode?: string): Promise<ProviderTrackingResult | null>;

  verifyWebhookSignature(signature: string, rawBody: string): boolean;

  parseWebhookPayload(payload: unknown): ProviderWebhookResult;

  mapStatus(nativeStatus: string): ShipmentStatus;
}
