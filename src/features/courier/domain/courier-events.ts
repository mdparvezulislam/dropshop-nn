export const COURIER_EVENTS = {
  SHIPMENT_CREATED: "courier.shipment_created",
  PICKUP_REQUESTED: "courier.pickup_requested",
  SHIPMENT_ASSIGNED: "courier.shipment_assigned",
  SHIPMENT_PICKED_UP: "courier.shipment_picked_up",
  SHIPMENT_IN_TRANSIT: "courier.shipment_in_transit",
  SHIPMENT_DELIVERED: "courier.shipment_delivered",
  SHIPMENT_RETURNED: "courier.shipment_returned",
  SHIPMENT_CANCELLED: "courier.shipment_cancelled",
  TRACKING_UPDATED: "courier.tracking_updated",
} as const;

export type CourierEventType = (typeof COURIER_EVENTS)[keyof typeof COURIER_EVENTS];

export interface ShipmentCreatedPayload {
  shipmentId: string;
  shipmentNumber: string;
  orderId: string;
  orderNumber: string;
  provider: string;
  codAmount: number;
}

export interface PickupRequestedPayload {
  shipmentId: string;
  courierReference: string;
  pickupTime: string;
}

export interface ShipmentAssignedPayload {
  shipmentId: string;
  provider: string;
  trackingCode: string;
}

export interface ShipmentPickedUpPayload {
  shipmentId: string;
  pickedUpAt: string;
}

export interface ShipmentInTransitPayload {
  shipmentId: string;
  trackingCode: string;
}

export interface ShipmentDeliveredPayload {
  shipmentId: string;
  orderId: string;
  deliveredAt: string;
  codCollected: number;
}

export interface ShipmentReturnedPayload {
  shipmentId: string;
  orderId: string;
  returnedAt: string;
  reason?: string;
}

export interface ShipmentCancelledPayload {
  shipmentId: string;
  orderId: string;
  cancelledAt: string;
  reason?: string;
}

export interface TrackingUpdatedPayload {
  shipmentId: string;
  status: string;
  trackingCode: string;
  rawDetails?: Record<string, any>;
}
