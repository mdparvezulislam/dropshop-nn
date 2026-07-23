import { BaseDBEntity } from "@/lib/database/types";

export type ReturnStatus =
  | "return_initiated"
  | "return_in_transit"
  | "return_received"
  | "return_completed"
  | "return_cancelled";

export type ReturnReason =
  | "customer_refused"
  | "damaged_product"
  | "wrong_product"
  | "duplicate_order"
  | "address_problem"
  | "courier_failure"
  | "delivery_failed";

export type RTSStatus =
  | "rts_created"
  | "rts_in_transit"
  | "rts_received"
  | "package_inspected"
  | "rts_completed";

export interface DeliveryReturn extends BaseDBEntity {
  returnNumber: string;
  shipmentId: string;
  orderId: string;
  trackingCode: string;
  reason: ReturnReason;
  status: ReturnStatus;
  returnChargeCents: number;
  initiatedBy: string;
  notes?: string;
  receivedAt?: Date;
  completedAt?: Date;
}

export interface RTSRecord extends BaseDBEntity {
  rtsNumber: string;
  shipmentId: string;
  orderId: string;
  reason: string;
  status: RTSStatus;
  inspectionCondition?: "intact" | "damaged" | "missing_items" | "opened";
  inspectorNotes?: string;
  receivedAt?: Date;
  completedAt?: Date;
}
