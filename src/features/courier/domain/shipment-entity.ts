import { BaseDBEntity } from "@/lib/database/types";

export type ShipmentStatus =
  | "draft"
  | "pending_booking"
  | "booked"
  | "pickup_requested"
  | "picked_up"
  | "in_transit"
  | "hub_received"
  | "out_for_delivery"
  | "delivered"
  | "partial_delivered"
  | "cancelled"
  | "returned"
  | "failed"
  | "lost"
  | "damage_reported";

export interface ParcelDimensions {
  width: number; // cm
  height: number; // cm
  depth: number; // cm
}

export interface ShipmentTimelineEntry {
  status: ShipmentStatus;
  nativeStatus?: string;
  timestamp: Date;
  message: string;
  location?: string;
  actorId?: string;
}

export interface RecipientDetails {
  name: string;
  phone: string;
  alternativePhone?: string;
  address: string;
  district: string;
  area: string;
}

export interface Shipment extends BaseDBEntity {
  shipmentNumber: string;
  orderId: string;
  orderNumber: string;
  consignmentId?: string; // Courier external ID
  courierReference?: string;
  trackingCode: string;
  trackingUrl?: string;
  provider: string; // steadfast, pathao, redx, ecourier, paperfly, sundarban, custom
  status: ShipmentStatus;
  nativeStatus?: string;
  deliveryZone: string; // inside_city, outside_city, sub_city, remote_area
  parcelType: string; // document, parcel, liquid
  parcelWeight: number; // in grams
  dimensions?: ParcelDimensions;
  codAmount: number; // in cents
  declaredValue: number; // in cents
  deliveryCharge: number; // in cents
  codCharge: number; // in cents
  returnCharge?: number; // in cents
  recipient: RecipientDetails;
  pickupAddressId?: string;
  retryCount?: number;
  lastFailureReason?: string;
  lastSyncedAt?: Date;
  history: ShipmentTimelineEntry[];
}
