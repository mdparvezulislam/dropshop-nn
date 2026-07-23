import { BaseDBEntity } from "@/lib/database/types";
import type { ShipmentStatus } from "./shipment-entity";

export interface LogisticsAuditLog extends BaseDBEntity {
  referenceNumber: string;
  shipmentId?: string;
  orderId?: string;
  provider?: string;
  action:
    | "shipment_created"
    | "shipment_booked"
    | "shipment_cancelled"
    | "status_changed"
    | "webhook_processed"
    | "sync_executed"
    | "retry_executed"
    | "config_updated"
    | "courier_reassigned"
    | "manual_intervention";
  actorId: string;
  oldStatus?: ShipmentStatus;
  newStatus?: ShipmentStatus;
  reason?: string;
  details?: Record<string, unknown>;
}
