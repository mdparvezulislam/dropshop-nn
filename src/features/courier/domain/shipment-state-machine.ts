import type { ShipmentStatus } from "./shipment-entity";
import type { OrderStatus } from "@/features/order/domain/state-machine";

export const SHIPMENT_STATUSES = [
  "draft",
  "pending_booking",
  "booked",
  "pickup_requested",
  "picked_up",
  "in_transit",
  "hub_received",
  "out_for_delivery",
  "delivered",
  "partial_delivered",
  "cancelled",
  "returned",
  "failed",
  "lost",
  "damage_reported",
] as const;

/**
 * Shipment lifecycle. A shipment is created as a `draft`, is handed to a
 * courier (`booked` → `picked_up`), moves through the network, and ends
 * delivered, returned, cancelled or lost.
 *
 * Every edge is something that can physically happen to a parcel. Anything
 * missing is an invalid jump and `assertShipmentTransition` refuses it — the
 * point of this table is that a mis-click or a malformed courier webhook can
 * never teleport a parcel from `draft` to `delivered`.
 */
const VALID_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  draft: ["pending_booking", "booked", "cancelled"],
  pending_booking: ["booked", "failed", "cancelled"],
  booked: ["pickup_requested", "picked_up", "cancelled", "failed"],
  pickup_requested: ["picked_up", "cancelled", "failed"],
  picked_up: ["in_transit", "hub_received", "out_for_delivery", "lost", "damage_reported"],
  in_transit: [
    "hub_received",
    "out_for_delivery",
    "delivered",
    "failed",
    "lost",
    "damage_reported",
  ],
  hub_received: ["out_for_delivery", "in_transit", "failed", "lost", "damage_reported"],
  out_for_delivery: ["delivered", "partial_delivered", "failed", "damage_reported", "lost"],
  // A failed attempt is re-attempted, or the parcel is returned to sender.
  failed: ["out_for_delivery", "returned", "lost"],
  partial_delivered: ["returned", "delivered"],
  delivered: [],
  cancelled: [],
  returned: [],
  lost: [],
  damage_reported: ["returned", "lost", "delivered"],
};

const TERMINAL_STATUSES: ReadonlySet<ShipmentStatus> = new Set<ShipmentStatus>([
  "delivered",
  "cancelled",
  "returned",
  "lost",
]);

/** Statuses that mean the parcel is physically with the courier. */
const IN_COURIER_CUSTODY: ReadonlySet<ShipmentStatus> = new Set<ShipmentStatus>([
  "picked_up",
  "in_transit",
  "hub_received",
  "out_for_delivery",
  "failed",
]);

export class InvalidShipmentTransitionError extends Error {
  constructor(
    public readonly from: ShipmentStatus,
    public readonly to: ShipmentStatus,
  ) {
    super(
      `Invalid shipment transition: ${getShipmentStatusLabel(from)} → ${getShipmentStatusLabel(to)}`,
    );
    this.name = "InvalidShipmentTransitionError";
  }
}

export function isValidShipmentTransition(from: ShipmentStatus, to: ShipmentStatus): boolean {
  return (VALID_TRANSITIONS[from] ?? []).includes(to);
}

export function assertShipmentTransition(from: ShipmentStatus, to: ShipmentStatus): void {
  if (!isValidShipmentTransition(from, to)) {
    throw new InvalidShipmentTransitionError(from, to);
  }
}

export function getAllowedShipmentTransitions(from: ShipmentStatus): ShipmentStatus[] {
  return [...(VALID_TRANSITIONS[from] ?? [])];
}

export function isShipmentTerminal(status: ShipmentStatus): boolean {
  return TERMINAL_STATUSES.has(status);
}

export function isInCourierCustody(status: ShipmentStatus): boolean {
  return IN_COURIER_CUSTODY.has(status);
}

const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  draft: "Draft",
  pending_booking: "Pending Booking",
  booked: "Booked",
  pickup_requested: "Pickup Requested",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  hub_received: "At Hub",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  partial_delivered: "Partially Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
  failed: "Delivery Failed",
  lost: "Lost",
  damage_reported: "Damage Reported",
};

const SHIPMENT_STATUS_LABELS_BN: Record<ShipmentStatus, string> = {
  draft: "ড্রাফট",
  pending_booking: "বুকিং অপেক্ষমাণ",
  booked: "বুক হয়েছে",
  pickup_requested: "পিকআপ অনুরোধ",
  picked_up: "কুরিয়ার সংগ্রহ করেছে",
  in_transit: "পরিবহনে আছে",
  hub_received: "হাবে পৌঁছেছে",
  out_for_delivery: "ডেলিভারির পথে",
  delivered: "ডেলিভার হয়েছে",
  partial_delivered: "আংশিক ডেলিভার",
  cancelled: "বাতিল",
  returned: "ফেরত এসেছে",
  failed: "ডেলিভারি ব্যর্থ",
  lost: "হারিয়ে গেছে",
  damage_reported: "ক্ষতিগ্রস্ত",
};

export function getShipmentStatusLabel(status: ShipmentStatus): string {
  return SHIPMENT_STATUS_LABELS[status] ?? status;
}

export function getShipmentStatusLabelBn(status: ShipmentStatus): string {
  return SHIPMENT_STATUS_LABELS_BN[status] ?? status;
}

export type ShipmentStatusTone = "neutral" | "progress" | "success" | "danger";

export function getShipmentStatusTone(status: ShipmentStatus): ShipmentStatusTone {
  if (status === "delivered") return "success";
  if (status === "cancelled" || status === "returned" || status === "lost" || status === "failed") {
    return "danger";
  }
  if (status === "draft" || status === "pending_booking") return "neutral";
  return "progress";
}

/**
 * The order status a shipment event implies. Returning `null` means the
 * shipment moved but the order's own state is unaffected (e.g. a hub scan).
 *
 * The FulfillmentService only applies the mapping when the order's state
 * machine actually allows the edge — the shipment never forces an illegal
 * order transition.
 */
const SHIPMENT_TO_ORDER_STATUS: Record<ShipmentStatus, OrderStatus | null> = {
  draft: null,
  pending_booking: null,
  booked: "courier_assigned",
  pickup_requested: "courier_assigned",
  picked_up: "shipped",
  in_transit: "shipped",
  hub_received: "shipped",
  out_for_delivery: "out_for_delivery",
  delivered: "delivered",
  partial_delivered: "delivered",
  cancelled: null,
  returned: "returned",
  failed: "failed",
  lost: "failed",
  damage_reported: null,
};

export function orderStatusForShipmentStatus(status: ShipmentStatus): OrderStatus | null {
  return SHIPMENT_TO_ORDER_STATUS[status] ?? null;
}

/**
 * Shipment milestone dates are derived from status, not entered by hand — a
 * date field that disagrees with the status is worse than no date at all.
 */
export function milestoneFieldForStatus(
  status: ShipmentStatus,
): "pickupDate" | "dispatchDate" | "deliveryDate" | "returnDate" | null {
  switch (status) {
    case "picked_up":
      return "pickupDate";
    case "in_transit":
      return "dispatchDate";
    case "delivered":
    case "partial_delivered":
      return "deliveryDate";
    case "returned":
      return "returnDate";
    default:
      return null;
  }
}
