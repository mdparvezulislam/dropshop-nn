import { BaseDBEntity } from "@/shared/lib/database/types";

export const WARRANTY_STATUSES = [
  "requested",
  "approved",
  "in_repair",
  "repaired",
  "replaced",
  "completed",
  "rejected",
] as const;

export type WarrantyStatus = (typeof WARRANTY_STATUSES)[number];

export interface WarrantyEntity extends BaseDBEntity {
  orderId: string;
  orderNumber: string;
  warrantyNumber: string;
  status: WarrantyStatus;
  previousStatuses: WarrantyStatus[];
  productId: string;
  productName: string;
  variantSku?: string;
  issue: string;
  customerNote?: string;
  internalNote?: string;
  resolution?: string;
  rejectionReason?: string;
  repairNotes?: string;
  replacementProductId?: string;
  requestedAt?: Date;
  approvedAt?: Date;
  completedAt?: Date;
  requestedBy?: string;
  approvedBy?: string;
}

export const WARRANTY_VALID_TRANSITIONS: Record<WarrantyStatus, WarrantyStatus[]> = {
  requested: ["approved", "rejected"],
  approved: ["in_repair", "replaced"],
  in_repair: ["repaired"],
  repaired: ["completed"],
  replaced: ["completed"],
  completed: [],
  rejected: ["completed"],
};

export const WARRANTY_TERMINAL_STATUSES: Set<WarrantyStatus> = new Set(["completed"]);

export function canTransitionWarranty(from: WarrantyStatus, to: WarrantyStatus): void {
  if (WARRANTY_TERMINAL_STATUSES.has(from)) {
    throw new Error(`Cannot transition from terminal warranty status: ${from}`);
  }
  const allowed = WARRANTY_VALID_TRANSITIONS[from];
  if (!allowed || !allowed.includes(to)) {
    throw new Error(`Invalid warranty transition: ${from} -> ${to}`);
  }
}

export function getWarrantyHumanLabel(status: WarrantyStatus): string {
  const labels: Record<WarrantyStatus, string> = {
    requested: "Warranty Requested",
    approved: "Warranty Approved",
    in_repair: "In Repair",
    repaired: "Repaired",
    replaced: "Replaced",
    completed: "Completed",
    rejected: "Warranty Rejected",
  };
  return labels[status] ?? status;
}

export default WarrantyEntity;
