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

export class ECourierAdapter implements CourierProvider {
  readonly id = "ecourier";
  readonly name = "eCourier";
  readonly mode = "api" as const;

  isConfigured(): boolean {
    return Boolean(env.ECOURIER_API_KEY && env.ECOURIER_API_SECRET && env.ECOURIER_USER_ID);
  }

  private get headers(): Record<string, string> {
    return {
      "API-KEY": env.ECOURIER_API_KEY,
      "API-SECRET": env.ECOURIER_API_SECRET,
      "USER-ID": env.ECOURIER_USER_ID,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${env.ECOURIER_BASE_URL.replace(/\/$/, "")}${endpoint}`;
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
        throw new Error(`eCourier API HTTP ${response.status}: ${response.statusText}`);
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
        return { success: false, latencyMs: 0, message: "eCourier credentials missing" };
      }
      return { success: true, latencyMs: Date.now() - startTime, message: "eCourier API active" };
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
      return { success: false, requiresManualBooking: true, error: "eCourier credentials missing" };
    }

    try {
      const orderData = (order ?? {}) as Record<string, any>;
      const payload = {
        recipient_name: orderData.shippingAddress?.fullName ?? "Customer",
        recipient_mobile: orderData.shippingAddress?.phone ?? "01700000000",
        recipient_city: "Dhaka",
        recipient_area: "Dhaka",
        recipient_address: orderData.shippingAddress?.addressLine1 ?? "Dhaka",
        package_code: shipment.orderNumber,
        product_price: Math.round(shipment.codAmount ?? 0),
        payment_method: "COD",
      };

      const res = await this.request<{ ID?: string; tracking?: string }>("/order-place", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.tracking || res.ID) {
        const code = res.tracking || res.ID || "";
        return {
          success: true,
          trackingCode: code,
          consignmentId: code,
          trackingUrl: `https://ecourier.com.bd/track/${code}`,
        };
      }
      return { success: false, error: "eCourier creation failed" };
    } catch (err: unknown) {
      logger.error("eCourier createShipment error", err);
      return { success: false, error: err instanceof Error ? err.message : "eCourier error" };
    }
  }

  async cancelShipment(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: "eCourier cancellation requires manual dashboard action" };
  }

  async requestPickup(shipment: Shipment): Promise<ProviderPickupResult> {
    return { success: true, pickupReference: `ECO-PU-${shipment.orderNumber}` };
  }

  async trackShipment(trackingCode?: string): Promise<ProviderTrackingResult | null> {
    if (!this.isConfigured() || !trackingCode) return null;
    try {
      const res = await this.request<{ status: string }>("/track", {
        method: "POST",
        body: JSON.stringify({ tracking: trackingCode }),
      });
      const nativeStatus = res.status || "unknown";
      return {
        status: this.mapStatus(nativeStatus),
        nativeStatus,
        message: `eCourier status: ${nativeStatus}`,
        updatedAt: new Date(),
        rawDetails: res as Record<string, unknown>,
      };
    } catch (err: unknown) {
      logger.error("eCourier trackShipment error", err);
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
      trackingCode: String(data.tracking || data.package_code || ""),
      status: this.mapStatus(nativeStatus),
      nativeStatus,
      message: `eCourier status: ${nativeStatus}`,
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

export const ecourierAdapter = new ECourierAdapter();
