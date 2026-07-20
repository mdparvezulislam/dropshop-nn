import { BaseDBEntity } from "@/shared/lib/database/types";

export type ShipmentStatus =
  | "created"
  | "pickup_requested"
  | "picked_up"
  | "in_transit"
  | "hub_received"
  | "out_for_delivery"
  | "delivered"
  | "failed"
  | "returned"
  | "cancelled";

export interface ParcelDimensions {
  width: number; // cm
  height: number; // cm
  depth: number; // cm
}

export interface ShipmentTimelineEntry {
  status: ShipmentStatus;
  timestamp: Date;
  message: string;
  actorId?: string;
}

export interface Shipment extends BaseDBEntity {
  shipmentNumber: string;
  orderId: string;
  orderNumber: string;
  courierReference: string; // provider external ID / reference
  trackingCode: string; // tracking code / number
  provider: string; // steadfast, pathao, redx, ecourier, paperfly
  status: ShipmentStatus;
  deliveryZone: string; // inside_city, outside_city, sub_city, remote_area
  parcelType: string; // document, parcel, liquid
  parcelWeight: number; // in grams
  dimensions: ParcelDimensions;
  codAmount: number; // in cents
  declaredValue: number; // in cents
  deliveryCharge: number; // in cents
  codCharge: number; // in cents
  history: ShipmentTimelineEntry[];
}
