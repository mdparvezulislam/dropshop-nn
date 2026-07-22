import { BaseDBEntity } from "@/shared/lib/database/types";

export const COMPLAINT_TYPES = [
  "wrong_product", "damaged_product", "missing_item",
  "courier_delay", "late_delivery", "refund_issue",
  "warranty_issue", "exchange_issue", "payment_issue",
  "other",
] as const;

export const COMPLAINT_STATUSES = [
  "open", "in_progress", "resolved", "closed", "escalated",
] as const;

export type ComplaintType = (typeof COMPLAINT_TYPES)[number];
export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];

export interface CustomerComplaint extends BaseDBEntity {
  complaintNumber: string;
  orderId: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  type: ComplaintType;
  description: string;
  status: ComplaintStatus;
  priority: "low" | "normal" | "high" | "urgent";
  assignedTo?: string;
  assignedToName?: string;
  resolution?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  internalNote?: string;
  timeline: ComplaintTimelineEntry[];
}

export interface ComplaintTimelineEntry {
  id: string;
  eventType: string;
  summary: string;
  actorId?: string;
  actorName?: string;
  timestamp: Date;
}

export const COMPLAINT_VALID_TRANSITIONS: Record<string, string[]> = {
  open: ["in_progress", "resolved", "closed"],
  in_progress: ["resolved", "escalated", "closed"],
  resolved: ["closed"],
  escalated: ["in_progress", "resolved", "closed"],
  closed: [],
};
