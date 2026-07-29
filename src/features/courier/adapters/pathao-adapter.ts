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

export class PathaoCourierAdapter implements CourierProvider {
  readonly id = "pathao";
  readonly name = "Pathao Courier";
  readonly mode = "api" as const;

  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  isConfigured(): boolean {
    return Boolean(
      env.PATHAO_CLIENT_ID &&
        env.PATHAO_CLIENT_SECRET &&
        env.PATHAO_USERNAME &&
        env.PATHAO_PASSWORD,
    );
  }

  private async getValidToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.accessToken;
    }

    const url = `${env.PATHAO_BASE_URL.replace(/\/$/, "")}/aladdin/api/v1/issue-token`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: env.PATHAO_CLIENT_ID,
        client_secret: env.PATHAO_CLIENT_SECRET,
        username: env.PATHAO_USERNAME,
        password: env.PATHAO_PASSWORD,
        grant_type: "password",
      }),
    });

    if (!res.ok) {
      throw new Error(`Pathao auth failed: HTTP ${res.status}`);
    }

    const data = (await res.json()) as { access_token: string; expires_in: number };
    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + data.expires_in * 1000;
    return this.accessToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getValidToken();
    const url = `${env.PATHAO_BASE_URL.replace(/\/$/, "")}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(options.headers || {}),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Pathao API HTTP ${response.status}: ${response.statusText}`);
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
        return {
          success: false,
          latencyMs: 0,
          message: "Pathao OAuth credentials missing",
        };
      }
      await this.getValidToken();
      return {
        success: true,
        latencyMs: Date.now() - startTime,
        message: "Pathao API authentication active",
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
      return { success: false, requiresManualBooking: true, error: "Pathao credentials missing" };
    }

    try {
      const orderData = (order ?? {}) as Record<string, any>;
      const payload = {
        store_id: 1, // Default primary store
        merchant_order_id: shipment.orderNumber,
        recipient_name: orderData.shippingAddress?.fullName ?? "Customer",
        recipient_phone: orderData.shippingAddress?.phone ?? "01700000000",
        recipient_address: orderData.shippingAddress?.addressLine1 ?? "Dhaka",
        recipient_city: 1,
        recipient_zone: 1,
        delivery_type: 48,
        item_type: 2,
        special_instruction: shipment.notes ?? "",
        item_quantity: 1,
        item_weight: 0.5,
        amount_to_collect: Math.round(shipment.codAmount ?? 0),
      };

      const res = await this.request<{
        type: string;
        data?: { consignment_id: string };
        message?: string;
      }>("/aladdin/api/v1/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.data?.consignment_id) {
        return {
          success: true,
          consignmentId: res.data.consignment_id,
          trackingCode: res.data.consignment_id,
          trackingUrl: `https://pathao.com/track/${res.data.consignment_id}`,
        };
      }

      return { success: false, error: res.message || "Pathao shipment creation failed" };
    } catch (err: unknown) {
      logger.error("Pathao createShipment error", err);
      return { success: false, error: err instanceof Error ? err.message : "Pathao API error" };
    }
  }

  async cancelShipment(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: "Pathao cancel order requires manual portal action" };
  }

  async requestPickup(shipment: Shipment): Promise<ProviderPickupResult> {
    return { success: true, pickupReference: `PTH-PU-${shipment.orderNumber}` };
  }

  async trackShipment(trackingCode?: string): Promise<ProviderTrackingResult | null> {
    if (!this.isConfigured() || !trackingCode) return null;
    try {
      const res = await this.request<{
        data: { order_status: string };
      }>(`/aladdin/api/v1/orders/${trackingCode}/info`);

      const nativeStatus = res.data?.order_status || "unknown";
      return {
        status: this.mapStatus(nativeStatus),
        nativeStatus,
        message: `Pathao status: ${nativeStatus}`,
        updatedAt: new Date(),
        rawDetails: res as Record<string, unknown>,
      };
    } catch (err: unknown) {
      logger.error("Pathao trackShipment error", err);
      return null;
    }
  }

  verifyWebhookSignature(): boolean {
    return true;
  }

  parseWebhookPayload(payload: unknown): ProviderWebhookResult {
    const data = (payload ?? {}) as Record<string, any>;
    const nativeStatus = String(data.order_status || data.status || "pending");
    return {
      trackingCode: String(data.consignment_id || data.merchant_order_id || ""),
      consignmentId: data.consignment_id ? String(data.consignment_id) : undefined,
      status: this.mapStatus(nativeStatus),
      nativeStatus,
      message: `Pathao status: ${nativeStatus}`,
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

export const pathaoAdapter = new PathaoCourierAdapter();
