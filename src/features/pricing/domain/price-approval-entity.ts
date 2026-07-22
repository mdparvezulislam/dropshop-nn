import { BaseDBEntity } from "@/shared/lib/database/types";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "cancelled";

export type ApprovalEntityType = "product_pricing" | "global_rule" | "profile" | "campaign" | "bulk_update";

export interface PriceChange {
  field: string;
  oldValue: number | string | null;
  newValue: number | string | null;
}

export interface PriceApproval extends BaseDBEntity {
  entityType: ApprovalEntityType;
  entityId: string;
  requestedBy: string;
  requestedByName?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  status: ApprovalStatus;
  changes: PriceChange[];
  reason: string;
  reviewNote?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
}
