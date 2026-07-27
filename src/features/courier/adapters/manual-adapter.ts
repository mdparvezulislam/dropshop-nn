import type {
  CourierProvider,
  ProviderShipmentResult,
  ProviderPickupResult,
  ProviderTrackingResult,
  ProviderWebhookResult,
  ConnectionTestResult,
} from "./provider-adapter";
import type { ShipmentStatus } from "../domain/shipment-entity";
import type { CourierProviderInfo } from "../domain/courier-catalog";

/**
 * The manual-mode courier adapter.
 *
 * Every provider runs through this one implementation until a real API adapter
 * replaces it. It deliberately does the *opposite* of the previous per-provider
 * stubs: instead of returning invented consignment ids, tracking codes and a
 * permanent "in transit" scan, it says plainly that there is no integration and
 * lets the operator supply the real courier data.
 *
 * The webhook parsing and status mapping below are real and shared — the
 * vocabulary BD couriers use in their callbacks is near-identical across
 * providers, so one mapper serves them all and stays testable.
 */

/**
 * Maps a courier's own status wording onto the platform's shipment status.
 * Order matters: the more specific phrases are checked first ("out for
 * delivery" contains "delivery", "returned" contains "turn").
 */
export function mapNativeCourierStatus(nativeStatus: string): ShipmentStatus {
  const s = nativeStatus.toLowerCase().replace(/[\s-]+/g, "_");

  if (s.includes("partial")) return "partial_delivered";
  if (s.includes("deliver") && !s.includes("out_for") && !s.includes("undeliver")) {
    return "delivered";
  }
  if (s.includes("out_for") || s.includes("on_the_way") || s.includes("rider")) {
    return "out_for_delivery";
  }
  if (s.includes("return") || s.includes("rts")) return "returned";
  if (s.includes("cancel")) return "cancelled";
  if (s.includes("lost")) return "lost";
  if (s.includes("damage")) return "damage_reported";
  if (s.includes("fail") || s.includes("unreachable") || s.includes("undeliver")) return "failed";
  if (s.includes("hub") || s.includes("sorting") || s.includes("warehouse")) return "hub_received";
  if (s.includes("transit") || s.includes("dispatch") || s.includes("shipped")) return "in_transit";
  if (s.includes("pickup_request") || s.includes("pickup_pending")) return "pickup_requested";
  if (s.includes("pick") || s.includes("collected") || s.includes("received")) return "picked_up";
  return "booked";
}

function readString(payload: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return undefined;
}

export function createManualCourierAdapter(info: CourierProviderInfo): CourierProvider {
  const notConfiguredMessage =
    `${info.name} has no API integration configured. ` +
    `Book the parcel in the ${info.name} merchant panel, then record the tracking number here.`;

  return {
    id: info.id,
    name: info.name,
    mode: info.integration,

    isConfigured(): boolean {
      // No provider ships credentials in WEBSITE-009. When an API adapter
      // lands it replaces this object entirely.
      return false;
    },

    async testConnection(): Promise<ConnectionTestResult> {
      return {
        success: false,
        latencyMs: 0,
        message: notConfiguredMessage,
      };
    },

    async createShipment(): Promise<ProviderShipmentResult> {
      return {
        success: false,
        requiresManualBooking: true,
        error: notConfiguredMessage,
      };
    },

    async cancelShipment(): Promise<{ success: boolean; error?: string }> {
      // Cancelling locally always succeeds; the courier-side cancellation is
      // the operator's job while the provider runs in manual mode.
      return { success: true };
    },

    async requestPickup(): Promise<ProviderPickupResult> {
      return {
        success: false,
        requiresManualBooking: true,
        error: notConfiguredMessage,
      };
    },

    async trackShipment(): Promise<ProviderTrackingResult | null> {
      // No API to ask. Returning null keeps the shipment's real, last
      // operator-recorded status instead of inventing a scan.
      return null;
    },

    verifyWebhookSignature(): boolean {
      // Without a shared secret a signature cannot be verified, so no payload
      // is trusted. Reject rather than wave it through.
      return false;
    },

    parseWebhookPayload(payload: unknown): ProviderWebhookResult {
      const data = (payload ?? {}) as Record<string, unknown>;
      const nativeStatus =
        readString(data, "status", "delivery_status", "current_status", "event") ?? "unknown";
      return {
        trackingCode:
          readString(
            data,
            "tracking_code",
            "tracking_id",
            "trackingCode",
            "consignment_id",
            "parcel_id",
            "invoice",
          ) ?? "",
        consignmentId: readString(data, "consignment_id", "parcel_id", "consignmentId"),
        status: mapNativeCourierStatus(nativeStatus),
        nativeStatus,
        message: readString(data, "message", "note", "reason") ?? `${info.name}: ${nativeStatus}`,
        rawPayload: payload,
      };
    },

    mapStatus(nativeStatus: string): ShipmentStatus {
      return mapNativeCourierStatus(nativeStatus);
    },
  };
}
