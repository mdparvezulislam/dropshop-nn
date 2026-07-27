import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { getShipmentStatusTone } from "@/features/courier/domain/shipment-state-machine";
import type { ShipmentStatus } from "@/features/courier/domain/shipment-entity";
import { getHumanLabel, type OrderStatus } from "@/features/order/domain/state-machine";

const SHIPMENT_TONE_VARIANT = {
  success: "success",
  danger: "destructive",
  progress: "info",
  neutral: "muted",
} as const;

export function ShipmentStatusBadge({
  status,
  label,
}: {
  status: ShipmentStatus;
  label: string;
}): React.ReactElement {
  return <Badge variant={SHIPMENT_TONE_VARIANT[getShipmentStatusTone(status)]}>{label}</Badge>;
}

const ORDER_STATUS_VARIANT: Record<OrderStatus, "success" | "destructive" | "info" | "warning" | "muted"> = {
  draft: "muted",
  pending: "warning",
  confirmed: "info",
  picking: "info",
  packed: "info",
  ready_for_dispatch: "info",
  courier_assigned: "info",
  shipped: "info",
  out_for_delivery: "info",
  delivered: "success",
  completed: "success",
  cancelled: "destructive",
  return_requested: "warning",
  return_initiated: "warning",
  returned: "destructive",
  refunded: "destructive",
  failed: "destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }): React.ReactElement {
  return <Badge variant={ORDER_STATUS_VARIANT[status] ?? "muted"}>{getHumanLabel(status)}</Badge>;
}
