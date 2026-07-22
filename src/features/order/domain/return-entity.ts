import { BaseDBEntity } from "@/shared/lib/database/types";

export const RETURN_STATUSES = [
  "requested",
  "approved",
  "received",
  "inspecting",
  "approved_for_refund",
  "rejected",
  "refunded",
  "completed",
] as const;

export type ReturnStatus = (typeof RETURN_STATUSES)[number];

export interface ReturnItem {
  productId: string;
  variantSku?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  reason?: string;
}

export interface ReturnEntity extends BaseDBEntity {
  orderId: string;
  orderNumber: string;
  returnNumber: string;
  status: ReturnStatus;
  previousStatuses: ReturnStatus[];
  items: ReturnItem[];
  reason: string;
  customerNote?: string;
  internalNote?: string;
  inspectionNotes?: string;
  rejectionReason?: string;
  refundAmount?: number;
  refundedAt?: Date;
  requestedAt?: Date;
  approvedAt?: Date;
  receivedAt?: Date;
  completedAt?: Date;
  requestedBy?: string;
  approvedBy?: string;
}

export const RETURN_STATUS_CATEGORY: Record<ReturnStatus, string> = {
  requested: "requested",
  approved: "approved",
  received: "received",
  inspecting: "inspecting",
  approved_for_refund: "approved_for_refund",
  rejected: "rejected",
  refunded: "refunded",
  completed: "completed",
};

export const RETURN_VALID_TRANSITIONS: Record<ReturnStatus, ReturnStatus[]> = {
  requested: ["approved", "rejected"],
  approved: ["received"],
  received: ["inspecting"],
  inspecting: ["approved_for_refund", "rejected"],
  approved_for_refund: ["refunded"],
  rejected: ["completed"],
  refunded: ["completed"],
  completed: [],
};

export const RETURN_TERMINAL_STATUSES: Set<ReturnStatus> = new Set(["completed"]);

export function canTransitionReturn(from: ReturnStatus, to: ReturnStatus): void {
  if (RETURN_TERMINAL_STATUSES.has(from)) {
    throw new Error(`Cannot transition from terminal return status: ${from}`);
  }
  const allowed = RETURN_VALID_TRANSITIONS[from];
  if (!allowed || !allowed.includes(to)) {
    throw new Error(`Invalid return transition: ${from} -> ${to}`);
  }
}

export function getReturnHumanLabel(status: ReturnStatus): string {
  const labels: Record<ReturnStatus, string> = {
    requested: "Return Requested",
    approved: "Return Approved",
    received: "Return Received",
    inspecting: "Under Inspection",
    approved_for_refund: "Approved for Refund",
    rejected: "Return Rejected",
    refunded: "Refunded",
    completed: "Completed",
  };
  return labels[status] ?? status;
}

export default ReturnEntity;
