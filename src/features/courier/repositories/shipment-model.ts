import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";

const { status: baseStatus, ...otherBaseFields } = baseFieldsDefinition;

const recipientSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    alternativePhone: { type: String, default: null },
    address: { type: String, required: true },
    district: { type: String, required: true },
    area: { type: String, required: true },
  },
  { _id: false },
);

const timelineSchema = new Schema(
  {
    status: { type: String, required: true },
    nativeStatus: { type: String, default: null },
    timestamp: { type: Date, required: true },
    message: { type: String, required: true },
    location: { type: String, default: null },
    actorId: { type: String, default: null },
  },
  { _id: false },
);

const shipmentSchema = new Schema(
  {
    shipmentNumber: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true, index: true },
    consignmentId: { type: String, default: null, index: true },
    courierReference: { type: String, default: null },
    trackingCode: { type: String, required: true, index: true },
    trackingUrl: { type: String, default: null },
    provider: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: [
        "draft",
        "pending_booking",
        "booked",
        "pickup_requested",
        "picked_up",
        "in_transit",
        "hub_received",
        "out_for_delivery",
        "delivered",
        "partial_delivered",
        "cancelled",
        "returned",
        "failed",
        "lost",
        "damage_reported",
      ],
      default: "draft",
      index: true,
    },
    nativeStatus: { type: String, default: null },
    deliveryZone: { type: String, default: "inside_city" },
    parcelType: { type: String, default: "parcel" },
    parcelWeight: { type: Number, default: 500 },
    dimensions: {
      width: { type: Number, default: 10 },
      height: { type: Number, default: 10 },
      depth: { type: Number, default: 10 },
    },
    codAmount: { type: Number, required: true, min: 0 },
    declaredValue: { type: Number, default: 0, min: 0 },
    deliveryCharge: { type: Number, default: 0, min: 0 },
    codCharge: { type: Number, default: 0, min: 0 },
    returnCharge: { type: Number, default: 0, min: 0 },
    recipient: { type: recipientSchema, required: true },
    pickupAddressId: { type: String, default: null },
    retryCount: { type: Number, default: 0 },
    lastFailureReason: { type: String, default: null },
    lastSyncedAt: { type: Date, default: null },
    history: [timelineSchema],
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "shipments" },
);

shipmentSchema.index({ createdAt: -1 });
shipmentSchema.index({ status: 1, provider: 1 });
shipmentSchema.index({ "recipient.phone": 1 });

export const ShipmentModel =
  mongoose.models.Shipment || mongoose.model("Shipment", shipmentSchema);
export default ShipmentModel;
