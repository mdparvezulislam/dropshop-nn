import { BaseDBEntity } from "@/shared/lib/database/types";

export type DisputeType =
  | "courier_lost_package"
  | "damaged_parcel"
  | "customer_complaint"
  | "missing_item"
  | "wrong_delivery"
  | "cod_difference";

export type DisputeStatus = "created" | "under_investigation" | "resolved" | "closed";

export type EscalationLevel = "level_1" | "level_2" | "level_3" | "resolved" | "closed";

export interface DeliveryDispute extends BaseDBEntity {
  disputeNumber: string;
  shipmentId: string;
  orderId: string;
  disputeType: DisputeType;
  status: DisputeStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  evidenceUrls?: string[];
  internalNotes?: string[];
  resolutionSummary?: string;
  codDiscrepancyCents?: number;
  resolvedAt?: Date;
}

export interface LogisticsEscalation extends BaseDBEntity {
  escalationNumber: string;
  disputeId: string;
  shipmentId: string;
  level: EscalationLevel;
  assignedRole: string; // "Operator" | "Manager" | "Logistics Lead"
  reason: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  escalatedBy: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}
