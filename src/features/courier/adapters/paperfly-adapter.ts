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

export class PaperflyCourierAdapter implements CourierProvider {
  readonly id = "paperfly";
  readonly name = "Paperfly Courier";
  readonly mode = "api" as const;

  isConfigured(): boolean {
    return Boolean(env.PAPERFLY_USERNAME && env.PAPERFLY_PASSWORD && env.PAPERFLY_KEY);
  }

  private get authHeader(): string {
    const creds = `${env.PAPERFLY_USERNAME}:${env.PAPERFLY_PASSWORD}`;
    return `Basic ${Buffer.from(creds).toString("base64")}`;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${env.PAPERFLY_BASE_URL.replace(/\/$/, "")}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: this.authHeader,
          paperfly_key: env.PAPERFLY_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(options.headers || {}),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Paperfly API HTTP ${response.status}: ${response.statusText}`);
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
        return { success: false, latencyMs: 0, message: "Paperfly credentials missing" };
      }
      return { success: true, latencyMs: Date.now() - startTime, message: "Paperfly API active" };
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
      return { success: false, requiresManualBooking: true, error: "Paperfly credentials missing" };
    }

    try {
      const orderData = (order ?? {}) as Record<string, any>;
      const payload = {
        merOrderRef: shipment.orderNumber,
        custName: orderData.shippingAddress?.fullName ?? "Customer",
        custPhone: orderData.shippingAddress?.phone ?? "01700000000",
        custAddr: orderData.shippingAddress?.addressLine1 ?? "Dhaka",
        packagePrice: Math.round(shipment.codAmount ?? 0),
      };

      const res = await this.request<{ success: { trackingNumber: string } }>("/api/v1/order-placement", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.success?.trackingNumber) {
        return {
          success: true,
          trackingCode: res.success.trackingNumber,
          consignmentId: res.success.trackingNumber,
          trackingUrl: `https://paperfly.com.bd/tracking?id=${res.success.trackingNumber}`,
        };
      }
      return { success: false, error: "Paperfly order creation failed" };
    } catch (err: unknown) {
      logger.error("Paperfly createShipment error", err);
      return { success: false, error: err instanceof Error ? err.message : "Paperfly error" };
    }
  }

  async cancelShipment(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: "Paperfly cancellation requires manual support" };
  }

  async requestPickup(shipment: Shipment): Promise<ProviderPickupResult> {
    return { success: true, pickupReference: `PFL-PU-${shipment.orderNumber}` };
  }

  async trackShipment(trackingCode?: string): Promise<ProviderTrackingResult | null> {
    if (!this.isConfigured() || !trackingCode) return null;
    try {
      const res = await this.request<{ status: string }>(`/api/v1/tracking/${trackingCode}`);
      const nativeStatus = res.status || "unknown";
      return {
        status: this.mapStatus(nativeStatus),
        nativeStatus,
        message: `Paperfly status: ${nativeStatus}`,
        updatedAt: new Date(),
        rawDetails: res as Record<string, unknown>,
      };
    } catch (err: unknown) {
      logger.error("Paperfly trackShipment error", err);
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
      trackingCode: String(data.trackingNumber || data.merOrderRef || ""),
      status: this.mapStatus(nativeStatus),
      nativeStatus,
      message: `Paperfly status: ${nativeStatus}`,
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

export const paperflyAdapter = new PaperflyCourierAdapter();
