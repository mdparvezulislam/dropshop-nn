import { BaseDBEntity } from "@/shared/lib/database/types";

export const EXCHANGE_STATUSES = [
  "requested",
  "approved",
  "pickup_scheduled",
  "picked_up",
  "replacement_shipped",
  "delivered",
  "completed",
  "rejected",
] as const;

export type ExchangeStatus = (typeof EXCHANGE_STATUSES)[number];

export interface ExchangeItem {
  productId: string;
  variantSku?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ExchangeEntity extends BaseDBEntity {
  orderId: string;
  orderNumber: string;
  exchangeNumber: string;
  status: ExchangeStatus;
  previousStatuses: ExchangeStatus[];
  items: ExchangeItem[];
  reason: string;
  customerNote?: string;
  internalNote?: string;
  rejectionReason?: string;
  pickupAddress?: string;
  pickupDate?: Date;
  replacementProductId?: string;
  replacementVariantSku?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  requestedAt?: Date;
  approvedAt?: Date;
  completedAt?: Date;
  requestedBy?: string;
  approvedBy?: string;
}

export const EXCHANGE_VALID_TRANSITIONS: Record<ExchangeStatus, ExchangeStatus[]> = {
  requested: ["approved", "rejected"],
  approved: ["pickup_scheduled"],
  pickup_scheduled: ["picked_up"],
  picked_up: ["replacement_shipped"],
  replacement_shipped: ["delivered"],
  delivered: ["completed"],
  completed: [],
  rejected: ["completed"],
};

export const EXCHANGE_TERMINAL_STATUSES: Set<ExchangeStatus> = new Set(["completed"]);

export function canTransitionExchange(from: ExchangeStatus, to: ExchangeStatus): void {
  if (EXCHANGE_TERMINAL_STATUSES.has(from)) {
    throw new Error(`Cannot transition from terminal exchange status: ${from}`);
  }
  const allowed = EXCHANGE_VALID_TRANSITIONS[from];
  if (!allowed || !allowed.includes(to)) {
    throw new Error(`Invalid exchange transition: ${from} -> ${to}`);
  }
}

export function getExchangeHumanLabel(status: ExchangeStatus): string {
  const labels: Record<ExchangeStatus, string> = {
    requested: "Exchange Requested",
    approved: "Exchange Approved",
    pickup_scheduled: "Pickup Scheduled",
    picked_up: "Picked Up",
    replacement_shipped: "Replacement Shipped",
    delivered: "Replacement Delivered",
    completed: "Completed",
    rejected: "Exchange Rejected",
  };
  return labels[status] ?? status;
}

export default ExchangeEntity;
