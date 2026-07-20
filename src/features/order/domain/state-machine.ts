export const ORDER_STATUSES = [
  "draft",
  "pending",
  "confirmed",
  "packed",
  "ready_for_dispatch",
  "courier_assigned",
  "shipped",
  "out_for_delivery",
  "delivered",
  "completed",
  "cancelled",
  "return_requested",
  "return_initiated",
  "returned",
  "refunded",
  "failed",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderCategory =
  | "draft"
  | "active"
  | "fulfillment"
  | "delivery"
  | "completed"
  | "cancelled"
  | "return"
  | "failed";

const STATUS_CATEGORY: Record<OrderStatus, OrderCategory> = {
  draft: "draft",
  pending: "active",
  confirmed: "active",
  packed: "fulfillment",
  ready_for_dispatch: "fulfillment",
  courier_assigned: "delivery",
  shipped: "delivery",
  out_for_delivery: "delivery",
  delivered: "delivery",
  completed: "completed",
  cancelled: "cancelled",
  return_requested: "return",
  return_initiated: "return",
  returned: "return",
  refunded: "return",
  failed: "failed",
};

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ["pending", "cancelled"],
  pending: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["ready_for_dispatch", "cancelled"],
  ready_for_dispatch: ["courier_assigned"],
  courier_assigned: ["shipped", "failed"],
  shipped: ["out_for_delivery", "failed"],
  out_for_delivery: ["delivered", "failed"],
  delivered: ["completed", "return_requested"],
  completed: [],
  cancelled: [],
  return_requested: ["return_initiated", "delivered"],
  return_initiated: ["returned"],
  returned: ["refunded"],
  refunded: [],
  failed: ["cancelled"],
};

const TERMINAL_STATUSES: Set<OrderStatus> = new Set([
  "completed",
  "cancelled",
  "refunded",
]);

const CANCELLABLE_STATUSES: Set<OrderStatus> = new Set([
  "draft",
  "pending",
  "confirmed",
  "packed",
  "failed",
]);

const REFUNDABLE_STATUSES: Set<OrderStatus> = new Set([
  "returned",
]);

const REQUIRES_INVENTORY_RELEASE: Set<OrderStatus> = new Set([
  "confirmed",
  "packed",
  "ready_for_dispatch",
  "courier_assigned",
  "shipped",
  "out_for_delivery",
]);

export class StateMachineError extends Error {
  constructor(
    message: string,
    public readonly from: OrderStatus,
    public readonly to: OrderStatus,
  ) {
    super(message);
    this.name = "StateMachineError";
  }
}

export class InvalidTransitionError extends StateMachineError {
  constructor(from: OrderStatus, to: OrderStatus) {
    super(
      `Invalid transition: ${from} -> ${to}`,
      from,
      to,
    );
    this.name = "InvalidTransitionError";
  }
}

export class TerminalStateError extends StateMachineError {
  constructor(status: OrderStatus) {
    super(
      `Cannot transition from terminal state: ${status}`,
      status,
      status,
    );
    this.name = "TerminalStateError";
  }
}

export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(to);
}

export function canTransition(from: OrderStatus, to: OrderStatus): void {
  if (TERMINAL_STATUSES.has(from)) {
    throw new TerminalStateError(from);
  }
  if (!isValidTransition(from, to)) {
    throw new InvalidTransitionError(from, to);
  }
}

export function isTerminal(status: OrderStatus): boolean {
  return TERMINAL_STATUSES.has(status);
}

export function isCancellable(status: OrderStatus): boolean {
  return CANCELLABLE_STATUSES.has(status);
}

export function isRefundable(status: OrderStatus): boolean {
  return REFUNDABLE_STATUSES.has(status);
}

export function requiresInventoryRelease(status: OrderStatus): boolean {
  return REQUIRES_INVENTORY_RELEASE.has(status);
}

export function getCategory(status: OrderStatus): OrderCategory {
  return STATUS_CATEGORY[status];
}

export function isActive(status: OrderStatus): boolean {
  const cat = STATUS_CATEGORY[status];
  return cat === "active" || cat === "fulfillment" || cat === "delivery";
}

export function getAllowedTransitions(status: OrderStatus): OrderStatus[] {
  return VALID_TRANSITIONS[status] ?? [];
}

export function getHumanLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    draft: "Draft",
    pending: "Pending",
    confirmed: "Confirmed",
    packed: "Packed",
    ready_for_dispatch: "Ready for Dispatch",
    courier_assigned: "Courier Assigned",
    shipped: "Shipped",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    completed: "Completed",
    cancelled: "Cancelled",
    return_requested: "Return Requested",
    return_initiated: "Return Initiated",
    returned: "Returned",
    refunded: "Refunded",
    failed: "Failed",
  };
  return labels[status] ?? status;
}

export default {
  ORDER_STATUSES,
  VALID_TRANSITIONS,
  TERMINAL_STATUSES,
  canTransition,
  isValidTransition,
  isTerminal,
  isCancellable,
  isRefundable,
  requiresInventoryRelease,
  getCategory,
  isActive,
  getAllowedTransitions,
  getHumanLabel,
};
