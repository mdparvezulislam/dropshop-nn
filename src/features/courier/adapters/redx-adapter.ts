import { env } from "@/config/env";
import type {
  CourierProvider,
  ProviderShipmentResult,
  ProviderPickupResult,
  ProviderTrackingResult,
  ProviderWebhookResult,
  ConnectionTestResult,
} from "./provider-adapter";
import type { Shipment, ShipmentStatus } from "../domain/shipment-entity";
import { logger } from "@/lib/utils/logger";

export class RedXCourierAdapter implements CourierProvider {
  readonly id = "redx";
  readonly name = "RedX Logistics";
  readonly mode = "api" as const;

  isConfigured(): boolean {
    return Boolean(env.REDX_API_TOKEN);
  }

  private get headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${env.REDX_API_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${env.REDX_BASE_URL.replace(/\/$/, "")}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...this.headers, ...(options.headers || {}) },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`RedX API HTTP ${response.status}: ${response.statusText}`);
      }

      return (await response.json()) as T;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  async testConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    try {
      if (!this.isConfigured()) {
        return { success: false, latencyMs: 0, message: "RedX API Token missing" };
      }
      await this.request<{ status: string }>("/areas/dhaka/districts");
      return { success: true, latencyMs: Date.now() - startTime, message: "RedX API active" };
    } catch (err: unknown) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        message: err instanceof Error ? err.message : "Connection failed",
      };
    }
  }

  async createShipment(shipment: Shipment, order?: unknown): Promise<ProviderShipmentResult> {
    if (!this.isConfigured()) {
      return { success: false, requiresManualBooking: true, error: "RedX credentials missing" };
    }
    try {
      const orderData = (order ?? {}) as Record<string, any>;
      const payload = {
        customer_name: orderData.shippingAddress?.fullName ?? "Customer",
        customer_phone: orderData.shippingAddress?.phone ?? "01700000000",
        delivery_area: "Dhaka",
        customer_address: orderData.shippingAddress?.addressLine1 ?? "Dhaka",
        merchant_invoice_id: shipment.orderNumber,
        cash_collection_amount: Math.round(shipment.codAmount ?? 0),
        parcel_weight: 500,
        instruction: shipment.notes ?? "",
      };

      const res = await this.request<{ tracking_id: string }>("/parcels", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.tracking_id) {
        return {
          success: true,
          trackingCode: res.tracking_id,
          consignmentId: res.tracking_id,
          trackingUrl: `https://redx.com.bd/track-parcel?trackingId=${res.tracking_id}`,
        };
      }
      return { success: false, error: "RedX creation failed" };
    } catch (err: unknown) {
      logger.error("RedX createShipment error", err);
      return { success: false, error: err instanceof Error ? err.message : "RedX error" };
    }
  }

  async cancelShipment(trackingCode?: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured() || !trackingCode) {
      return { success: false, error: "Missing tracking code" };
    }
    try {
      await this.request(`/parcels/${trackingCode}/cancel`, { method: "POST" });
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : "Cancel failed" };
    }
  }

  async requestPickup(shipment: Shipment): Promise<ProviderPickupResult> {
    return { success: true, pickupReference: `REDX-PU-${shipment.orderNumber}` };
  }

  async trackShipment(trackingCode?: string): Promise<ProviderTrackingResult | null> {
    if (!this.isConfigured() || !trackingCode) return null;
    try {
      const res = await this.request<{ parcel: { status: string } }>(`/parcels/${trackingCode}`);
      const nativeStatus = res.parcel?.status || "unknown";
      return {
        status: this.mapStatus(nativeStatus),
        nativeStatus,
        message: `RedX status: ${nativeStatus}`,
        updatedAt: new Date(),
        rawDetails: res as Record<string, unknown>,
      };
    } catch (err: unknown) {
      logger.error("RedX trackShipment error", err);
      return null;
    }
  }

  verifyWebhookSignature(): boolean {
    return true;
  }

  parseWebhookPayload(payload: unknown): ProviderWebhookResult {
    const data = (payload ?? {}) as Record<string, any>;
    const nativeStatus = String(data.status || "pending");
    return {
      trackingCode: String(data.tracking_id || ""),
      status: this.mapStatus(nativeStatus),
      nativeStatus,
      message: `RedX status: ${nativeStatus}`,
      rawPayload: payload,
    };
  }

  mapStatus(nativeStatus: string): ShipmentStatus {
    const s = nativeStatus.toLowerCase();
    if (s.includes("delivered")) return "delivered";
    if (s.includes("cancelled")) return "cancelled";
    if (s.includes("returned")) return "returned";
    if (s.includes("transit") || s.includes("delivery")) return "in_transit";
    if (s.includes("pickup")) return "picked_up";
    return "pending_booking";
  }
}

export const redxAdapter = new RedXCourierAdapter();
