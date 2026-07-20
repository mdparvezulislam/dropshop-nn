export { OrderService } from "./services/order-service";
export { OrderTimelineService } from "./services/order-timeline-service";

export { OrderRepository } from "./repositories/order-repository";
export { OrderModel } from "./repositories/order-model";

export type { Order, OrderType, CustomerSnapshot, ShippingSnapshot, OrderPricingSnapshot, OrderPricingItem, OrderProfitPreview, OrderShippingInfo, OrderItem, OrderTimelineEntry, SupplierReference } from "./domain/order-entity";
export type { OrderStatus, OrderCategory } from "./domain/state-machine";
export { ORDER_STATUSES, canTransition, isValidTransition, isTerminal, isCancellable, isRefundable, requiresInventoryRelease, getCategory, isActive, getAllowedTransitions, getHumanLabel, InvalidTransitionError, TerminalStateError } from "./domain/state-machine";
export type { OrderTimeline, TimelineAction, TimelineChange, TimelineActor } from "./domain/order-timeline";

export type {
  OrderEventType,
  OrderEventPayload,
  OrderCreatedPayload,
  OrderConfirmedPayload,
  OrderPackedPayload,
  OrderReadyForDispatchPayload,
  OrderCourierAssignedPayload,
  OrderShippedPayload,
  OrderOutForDeliveryPayload,
  OrderDeliveredPayload,
  OrderCompletedPayload,
  OrderCancelledPayload,
  OrderReturnRequestedPayload,
  OrderReturnInitiatedPayload,
  OrderReturnedPayload,
  OrderRefundedPayload,
  OrderFailedPayload,
  OrderInventoryReservedPayload,
  OrderTimelineEntryAddedPayload,
} from "./domain/order-events";

export {
  createOrderFromDraftSchema,
  updateOrderStatusSchema,
  assignCourierSchema,
  updateTrackingSchema,
  addOrderNoteSchema,
  cancelOrderSchema,
  requestReturnSchema,
  processReturnSchema,
  refundOrderSchema,
  orderListQuerySchema,
  getOrderSchema,
} from "./types/validation";

export type {
  CreateOrderFromDraftInput,
  UpdateOrderStatusInput,
  AssignCourierInput,
  UpdateTrackingInput,
  AddOrderNoteInput,
  CancelOrderInput,
  RequestReturnInput,
  ProcessReturnInput,
  RefundOrderInput,
  OrderListQuery,
  GetOrderInput,
} from "./types/validation";

export { registerOrderFeatureFlags } from "./init";

export {
  createOrderFromDraftAction,
  updateOrderStatusAction,
  cancelOrderAction,
  assignCourierAction,
  updateTrackingAction,
  requestReturnAction,
  processReturnAction,
  refundOrderAction,
  addOrderNoteAction,
  getOrderAction,
  getOrderByNumberAction,
  listOrdersAction,
} from "./actions/order-actions";
