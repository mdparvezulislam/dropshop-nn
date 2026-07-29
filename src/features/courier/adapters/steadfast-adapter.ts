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
import { createHmac, timingSafeEqual } from "crypto";

export class SteadfastCourierAdapter implements CourierProvider {
  readonly id = "steadfast";
  readonly name = "Steadfast Courier";
  readonly mode = "api" as const;

  isConfigured(): boolean {
    return Boolean(env.STEADFAST_API_KEY && env.STEADFAST_SECRET_KEY);
  }

  private get headers(): Record<string, string> {
    return {
      "Api-Key": env.STEADFAST_API_KEY,
      "Secret-Key": env.STEADFAST_SECRET_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries = 2,
  ): Promise<T> {
    const url = `${env.STEADFAST_BASE_URL.replace(/\/$/, "")}${endpoint}`;
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
        throw new Error(`Steadfast API HTTP ${response.status}: ${response.statusText}`);
      }

      return (await response.json()) as T;
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (retries > 0) {
        logger.warn(`Steadfast API call failed, retrying... (${retries} left)`, { endpoint });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return this.request<T>(endpoint, options, retries - 1);
      }
      throw err;
    }
  }

  async testConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          latencyMs: 0,
          message: "Steadfast credentials missing (STEADFAST_API_KEY / STEADFAST_SECRET_KEY)",
        };
      }
      await this.request<{ status: number }>("/balance");
      return {
        success: true,
        latencyMs: Date.now() - startTime,
        message: "Steadfast API connection active",
      };
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
      return {
        success: false,
        requiresManualBooking: true,
        error: "Steadfast credentials missing",
      };
    }

    try {
      const orderData = (order ?? {}) as Record<string, any>;
      const payload = {
        invoice: shipment.orderNumber,
        recipient_name: orderData.shippingAddress?.fullName ?? "Customer",
        recipient_phone: orderData.shippingAddress?.phone ?? "01700000000",
        recipient_address: orderData.shippingAddress?.addressLine1 ?? "Dhaka",
        cod_amount: shipment.codAmount ?? 0,
        note: shipment.notes ?? "",
      };

      const res = await this.request<{
        status: number;
        message: string;
        consignment?: {
          consignment_id: number;
          tracking_code: string;
        };
      }>("/create_order", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.status === 200 && res.consignment) {
        return {
          success: true,
          consignmentId: String(res.consignment.consignment_id),
          trackingCode: res.consignment.tracking_code,
          trackingUrl: `https://steadfast.com.bd/t/${res.consignment.tracking_code}`,
        };
      }

      return {
        success: false,
        error: res.message || "Failed to create Steadfast shipment",
      };
    } catch (err: unknown) {
      logger.error("Steadfast createShipment error", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Steadfast API error",
      };
    }
  }

  async cancelShipment(
    trackingCode?: string,
    consignmentId?: string,
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: "Steadfast credentials missing" };
    }
    try {
      const res = await this.request<{ status: number; message: string }>("/cancel_order", {
        method: "POST",
        body: JSON.stringify({ tracking_code: trackingCode, consignment_id: consignmentId }),
      });
      return { success: res.status === 200, error: res.status === 200 ? undefined : res.message };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : "Cancel failed" };
    }
  }

  async requestPickup(shipment: Shipment): Promise<ProviderPickupResult> {
    if (!this.isConfigured()) {
      return { success: false, requiresManualBooking: true, error: "Steadfast credentials missing" };
    }
    return { success: true, pickupReference: `ST-PU-${shipment.orderNumber}` };
  }

  async trackShipment(trackingCode?: string): Promise<ProviderTrackingResult | null> {
    if (!this.isConfigured() || !trackingCode) return null;

    try {
      const res = await this.request<{
        status: number;
        delivery_status: string;
      }>(`/status_by_trackingcode/${trackingCode}`);

      const nativeStatus = res.delivery_status || "unknown";
      return {
        status: this.mapStatus(nativeStatus),
        nativeStatus,
        message: `Steadfast status: ${nativeStatus}`,
        updatedAt: new Date(),
        rawDetails: res as Record<string, unknown>,
      };
    } catch (err: unknown) {
      logger.error("Steadfast trackShipment error", err);
      return null;
    }
  }

  verifyWebhookSignature(signature: string, rawBody: string): boolean {
    if (!env.STEADFAST_SECRET_KEY) return true;
    try {
      const expected = createHmac("sha256", env.STEADFAST_SECRET_KEY).update(rawBody).digest("hex");
      return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  parseWebhookPayload(payload: unknown): ProviderWebhookResult {
    const data = (payload ?? {}) as Record<string, any>;
    const nativeStatus = String(data.status || data.delivery_status || "pending");

    return {
      trackingCode: String(data.tracking_code || ""),
      consignmentId: data.consignment_id ? String(data.consignment_id) : undefined,
      status: this.mapStatus(nativeStatus),
      nativeStatus,
      message: String(data.message || `Status update: ${nativeStatus}`),
      rawPayload: payload,
    };
  }

  mapStatus(nativeStatus: string): ShipmentStatus {
    const s = nativeStatus.toLowerCase();
    if (s.includes("delivered")) return "delivered";
    if (s.includes("cancelled") || s.includes("canceled")) return "cancelled";
    if (s.includes("returned")) return "returned";
    if (s.includes("in_transit") || s.includes("transit") || s.includes("out_for_delivery"))
      return "in_transit";
    if (s.includes("picked") || s.includes("holding")) return "picked_up";
    return "pending_booking";
  }
}

export const steadfastAdapter = new SteadfastCourierAdapter();
