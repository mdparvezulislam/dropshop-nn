import { BaseDBEntity } from "@/lib/database/types";

export const FAILED_DELIVERY_REASONS = [
  "customer_not_home", "wrong_address", "wrong_phone",
  "refused_to_accept", "delayed_by_courier", "damaged",
  "lost_in_transit", "other",
] as const;

export const FAILED_DELIVERY_ACTIONS = [
  "redelivery", "cancel", "change_address", "change_phone",
  "assign_courier", "customer_confirmation", "return_to_warehouse",
] as const;

export type FailedDeliveryReason = (typeof FAILED_DELIVERY_REASONS)[number];
export type FailedDeliveryAction = (typeof FAILED_DELIVERY_ACTIONS)[number];

export interface FailedDelivery extends BaseDBEntity {
  orderId: string;
  orderNumber: string;
  courierName: string;
  trackingNumber: string;
  reason: FailedDeliveryReason;
  attemptCount: number;
  customerResponse?: string;
  nextAction: FailedDeliveryAction;
  notes?: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}
