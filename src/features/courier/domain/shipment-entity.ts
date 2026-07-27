import { BaseDBEntity } from "@/lib/database/types";

export type ShipmentStatus =
  | "draft"
  | "pending_booking"
  | "booked"
  | "pickup_requested"
  | "picked_up"
  | "in_transit"
  | "hub_received"
  | "out_for_delivery"
  | "delivered"
  | "partial_delivered"
  | "cancelled"
  | "returned"
  | "failed"
  | "lost"
  | "damage_reported";

/**
 * Package dimensions in centimetres. `length` is authoritative; `depth` is the
 * legacy field name kept so documents written before WEBSITE-009 still map.
 */
export interface ParcelDimensions {
  length: number;
  width: number;
  height: number;
  /** @deprecated legacy alias for `length` — read-only, never written. */
  depth?: number;
}

export interface ShipmentTimelineEntry {
  status: ShipmentStatus;
  nativeStatus?: string;
  timestamp: Date;
  message: string;
  location?: string;
  actorId?: string;
}

export interface RecipientDetails {
  name: string;
  phone: string;
  alternativePhone?: string;
  address: string;
  district: string;
  area: string;
}

export interface Shipment extends BaseDBEntity {
  shipmentNumber: string;
  orderId: string;
  orderNumber: string;
  consignmentId?: string; // Courier external ID
  courierReference?: string;
  /**
   * The courier's tracking number. Absent until a courier actually issues one —
   * the platform never invents a placeholder code, because a fabricated number
   * reaches the customer as a real one.
   */
  trackingCode?: string;
  trackingUrl?: string;
  /** Courier provider id — see `COURIER_PROVIDERS` in `domain/courier-catalog.ts`. */
  provider: string;
  status: ShipmentStatus;
  nativeStatus?: string;
  deliveryZone: string; // inside_city, outside_city, sub_city, remote_area
  parcelType: string; // document, parcel, liquid

  // ── Package ────────────────────────────────────────────────────────────
  /** Weighed on the scale, in grams. */
  parcelWeight: number;
  dimensions?: ParcelDimensions;
  /** (L×W×H)/divisor, in grams. Derived — recomputed on every package write. */
  volumetricWeight?: number;
  /** max(actual, volumetric) in grams — what a courier actually bills. */
  chargeableWeight?: number;
  /** Number of physical parcels handed over under this shipment. */
  packageCount: number;

  // ── Money (minor units / poisha) ───────────────────────────────────────
  codAmount: number;
  declaredValue: number;
  deliveryCharge: number;
  codCharge: number;
  returnCharge?: number;

  recipient: RecipientDetails;
  pickupAddressId?: string;

  // ── Fulfillment milestones ─────────────────────────────────────────────
  pickupDate?: Date;
  dispatchDate?: Date;
  estimatedDeliveryDate?: Date;
  deliveryDate?: Date;
  returnDate?: Date;

  // ── Notes ──────────────────────────────────────────────────────────────
  /** Shown to the customer alongside the shipment. */
  deliveryNotes?: string;
  /** Staff-only. Never leaves the server in a customer DTO. */
  internalNotes?: string;

  retryCount?: number;
  lastFailureReason?: string;
  lastSyncedAt?: Date;
  history: ShipmentTimelineEntry[];
}

/** Courier billing divisor for volumetric weight (cm³ → grams). */
export const VOLUMETRIC_DIVISOR = 5;

/**
 * Volumetric weight in grams. BD couriers price on max(actual, volumetric)
 * using the industry (L×W×H)/5000 kg formula — expressed here in grams so it
 * stays in the same unit as `parcelWeight`.
 */
export function calculateVolumetricWeight(dimensions?: ParcelDimensions): number {
  if (!dimensions) return 0;
  const length = dimensions.length ?? dimensions.depth ?? 0;
  const { width = 0, height = 0 } = dimensions;
  if (length <= 0 || width <= 0 || height <= 0) return 0;
  return Math.round((length * width * height) / VOLUMETRIC_DIVISOR);
}

/** What the courier bills on: the heavier of actual and volumetric weight. */
export function calculateChargeableWeight(
  actualWeightGrams: number,
  dimensions?: ParcelDimensions,
): number {
  return Math.max(actualWeightGrams ?? 0, calculateVolumetricWeight(dimensions));
}
