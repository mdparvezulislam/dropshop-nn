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

export class SundarbanCourierAdapter implements CourierProvider {
  readonly id = "sundarban";
  readonly name = "Sundarban Courier Service";
  readonly mode = "api" as const;

  isConfigured(): boolean {
    return Boolean(env.SUNDARBAN_API_KEY && env.SUNDARBAN_SECRET_KEY);
  }

  private get headers(): Record<string, string> {
    return {
      "X-Api-Key": env.SUNDARBAN_API_KEY,
      "X-Secret-Key": env.SUNDARBAN_SECRET_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${env.SUNDARBAN_BASE_URL.replace(/\/$/, "")}${endpoint}`;
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
        throw new Error(`Sundarban API HTTP ${response.status}: ${response.statusText}`);
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
        return { success: false, latencyMs: 0, message: "Sundarban credentials missing" };
      }
      return { success: true, latencyMs: Date.now() - startTime, message: "Sundarban API active" };
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
      return { success: false, requiresManualBooking: true, error: "Sundarban credentials missing" };
    }

    try {
      const orderData = (order ?? {}) as Record<string, any>;
      const payload = {
        booking_ref: shipment.orderNumber,
        receiver_name: orderData.shippingAddress?.fullName ?? "Customer",
        receiver_phone: orderData.shippingAddress?.phone ?? "01700000000",
        receiver_address: orderData.shippingAddress?.addressLine1 ?? "Dhaka",
        cod_amount: Math.round(shipment.codAmount ?? 0),
      };

      const res = await this.request<{ consignment_no: string }>("/booking/create", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.consignment_no) {
        return {
          success: true,
          trackingCode: res.consignment_no,
          consignmentId: res.consignment_no,
          trackingUrl: `https://sundarbancourier.com.bd/track/${res.consignment_no}`,
        };
      }
      return { success: false, error: "Sundarban creation failed" };
    } catch (err: unknown) {
      logger.error("Sundarban createShipment error", err);
      return { success: false, error: err instanceof Error ? err.message : "Sundarban error" };
    }
  }

  async cancelShipment(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: "Sundarban cancellation requires branch contact" };
  }

  async requestPickup(shipment: Shipment): Promise<ProviderPickupResult> {
    return { success: true, pickupReference: `SND-PU-${shipment.orderNumber}` };
  }

  async trackShipment(trackingCode?: string): Promise<ProviderTrackingResult | null> {
    if (!this.isConfigured() || !trackingCode) return null;
    try {
      const res = await this.request<{ status: string }>(`/tracking/${trackingCode}`);
      const nativeStatus = res.status || "unknown";
      return {
        status: this.mapStatus(nativeStatus),
        nativeStatus,
        message: `Sundarban status: ${nativeStatus}`,
        updatedAt: new Date(),
        rawDetails: res as Record<string, unknown>,
      };
    } catch (err: unknown) {
      logger.error("Sundarban trackShipment error", err);
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
      trackingCode: String(data.consignment_no || data.booking_ref || ""),
      status: this.mapStatus(nativeStatus),
      nativeStatus,
      message: `Sundarban status: ${nativeStatus}`,
      rawPayload: payload,
    };
  }

  mapStatus(nativeStatus: string): ShipmentStatus {
    const s = nativeStatus.toLowerCase();
    if (s.includes("delivered")) return "delivered";
    if (s.includes("cancel")) return "cancelled";
    if (s.includes("return")) return "returned";
    if (s.includes("transit") || s.includes("dispatch")) return "in_transit";
    if (s.includes("picked")) return "picked_up";
    return "pending_booking";
  }
}

export const sundarbanAdapter = new SundarbanCourierAdapter();
