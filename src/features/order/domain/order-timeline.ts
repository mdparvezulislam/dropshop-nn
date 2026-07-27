import { BaseDBEntity } from "@/lib/database/types";

export type TimelineEntityType = "order" | "order_item";

export type TimelineAction =
  | "order.created"
  | "order.status_changed"
  | "order.updated"
  | "order.note_added"
  | "order.cancelled"
  | "order.return_requested"
  | "order.return_processed"
  | "order.refunded"
  | "order.picking_started"
  | "order.packed"
  | "order.ready_for_dispatch"
  | "order.shipment_created"
  | "order.courier_assigned"
  | "order.tracking_updated"
  | "order.shipping_cost_updated"
  | "order.dispatched"
  | "order.out_for_delivery"
  | "order.delivery_failed"
  | "order.returned"
  | "order.delivered"
  | "order.completed"
  | "order.failed"
  | "order.inventory_released"
  | "order.inventory_committed"
  | "order.payment_received"
  | "order.flagged"
  | "order.system_action"
  | "order.automation_triggered";

export interface TimelineChange {
  field: string;
  oldValue?: unknown;
  newValue?: unknown;
}

export interface TimelineActor {
  id: string;
  name?: string;
  role?: string;
}

export interface OrderTimeline extends BaseDBEntity {
  entityType: TimelineEntityType;
  entityId: string;
  eventType: string;
  action: TimelineAction;
  summary: string;
  fromStatus?: string;
  toStatus?: string;
  actor?: TimelineActor;
  changes?: TimelineChange[];
  metadata?: Record<string, string | number | boolean | null | undefined>;
  correlationId?: string;
}

export default OrderTimeline;
