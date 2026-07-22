import { BaseDBEntity } from "@/shared/lib/database/types";

export type DeliveryAttemptStatus = "attempted" | "failed" | "delivered" | "rescheduled";

export type DeliveryFailureReason =
  | "customer_unavailable"
  | "phone_unreachable"
  | "address_incorrect"
  | "customer_refused"
  | "area_restricted"
  | "courier_issue"
  | "weather"
  | "damaged_parcel"
  | "other";

export interface DeliveryAttempt extends BaseDBEntity {
  shipmentId: string;
  orderId: string;
  attemptNumber: number;
  courier: string;
  deliveryAgent?: {
    name?: string;
    phone?: string;
    agentId?: string;
  };
  attemptTime: Date;
  status: DeliveryAttemptStatus;
  failureReason?: DeliveryFailureReason;
  customerResponse?: string;
  notes?: string;
}
