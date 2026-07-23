import { BaseDBEntity } from "@/lib/database/types";

export const FOLLOW_UP_TYPES = [
  "call", "message", "delivery_reminder", "payment_reminder",
  "custom",
] as const;

export const FOLLOW_UP_STATUSES = ["pending", "completed", "skipped", "cancelled"] as const;
export const FOLLOW_UP_PRIORITIES = ["low", "normal", "high", "urgent"] as const;

export type FollowUpType = (typeof FOLLOW_UP_TYPES)[number];
export type FollowUpStatus = (typeof FOLLOW_UP_STATUSES)[number];
export type FollowUpPriority = (typeof FOLLOW_UP_PRIORITIES)[number];

export interface FollowUpReminder extends BaseDBEntity {
  orderId: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  type: FollowUpType;
  title: string;
  description?: string;
  status: FollowUpStatus;
  priority: FollowUpPriority;
  assignedTo?: string;
  assignedToName?: string;
  dueDate: Date;
  completedAt?: Date;
  completedBy?: string;
  notes?: string;
  isRecurring: boolean;
  recurringInterval?: "daily" | "weekly" | "monthly";
}
