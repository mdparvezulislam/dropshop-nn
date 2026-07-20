export interface OrderCreatedPayload {
  orderId: string;
  orderNumber: string;
  type: string;
  checkoutDraftId: string;
  checkoutId: string;
  cartId: string;
  grandTotal: number;
  itemCount: number;
  currency: string;
}

export interface OrderConfirmedPayload {
  orderId: string;
  orderNumber: string;
  confirmedBy: string;
}

export interface OrderPackedPayload {
  orderId: string;
  orderNumber: string;
}

export interface OrderReadyForDispatchPayload {
  orderId: string;
  orderNumber: string;
}

export interface OrderCourierAssignedPayload {
  orderId: string;
  orderNumber: string;
  courierId: string;
  courierName: string;
}

export interface OrderShippedPayload {
  orderId: string;
  orderNumber: string;
  trackingNumber: string;
  trackingUrl?: string;
}

export interface OrderOutForDeliveryPayload {
  orderId: string;
  orderNumber: string;
}

export interface OrderDeliveredPayload {
  orderId: string;
  orderNumber: string;
  deliveredAt: string;
}

export interface OrderCompletedPayload {
  orderId: string;
  orderNumber: string;
  totalCostBasis: number;
  totalRevenue: number;
  totalProfit: number;
}

export interface OrderCancelledPayload {
  orderId: string;
  orderNumber: string;
  reason?: string;
  cancelledBy: string;
  inventoryReleased: boolean;
}

export interface OrderReturnRequestedPayload {
  orderId: string;
  orderNumber: string;
  reason?: string;
  requestedBy?: string;
}

export interface OrderReturnInitiatedPayload {
  orderId: string;
  orderNumber: string;
  initiatedBy: string;
}

export interface OrderReturnedPayload {
  orderId: string;
  orderNumber: string;
}

export interface OrderRefundedPayload {
  orderId: string;
  orderNumber: string;
  refundAmount: number;
  refundedBy: string;
}

export interface OrderFailedPayload {
  orderId: string;
  orderNumber: string;
  reason: string;
  failedStep: string;
}

export interface OrderInventoryReservedPayload {
  orderId: string;
  orderNumber: string;
  action: "release" | "commit";
}

export interface OrderTimelineEntryAddedPayload {
  orderId: string;
  orderNumber: string;
  action: string;
  summary: string;
}

export type OrderEventPayload =
  | OrderCreatedPayload
  | OrderConfirmedPayload
  | OrderPackedPayload
  | OrderReadyForDispatchPayload
  | OrderCourierAssignedPayload
  | OrderShippedPayload
  | OrderOutForDeliveryPayload
  | OrderDeliveredPayload
  | OrderCompletedPayload
  | OrderCancelledPayload
  | OrderReturnRequestedPayload
  | OrderReturnInitiatedPayload
  | OrderReturnedPayload
  | OrderRefundedPayload
  | OrderFailedPayload
  | OrderInventoryReservedPayload
  | OrderTimelineEntryAddedPayload;

export type OrderEventType =
  | "order.created"
  | "order.confirmed"
  | "order.packed"
  | "order.ready_for_dispatch"
  | "order.courier_assigned"
  | "order.shipped"
  | "order.out_for_delivery"
  | "order.delivered"
  | "order.completed"
  | "order.cancelled"
  | "order.return_requested"
  | "order.return_initiated"
  | "order.returned"
  | "order.refunded"
  | "order.failed"
  | "order.inventory_reserved"
  | "order.timeline_entry_added";
