import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/shared/lib/database/base-schema";

const { status: baseStatus, ...otherBaseFields } = baseFieldsDefinition;

const dimensionsSchema = new Schema({
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  depth: { type: Number, required: true },
}, { _id: false });

const timelineSchema = new Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  message: { type: String, required: true },
  actorId: { type: String, default: null },
}, { _id: false });

const shipmentSchema = new Schema(
  {
    shipmentNumber: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true, index: true },
    courierReference: { type: String, required: true, index: true },
    trackingCode: { type: String, required: true, index: true },
    provider: {
      type: String,
      enum: ["steadfast", "pathao", "redx", "ecourier", "paperfly"],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "created",
        "pickup_requested",
        "picked_up",
        "in_transit",
        "hub_received",
        "out_for_delivery",
        "delivered",
        "failed",
        "returned",
        "cancelled",
      ],
      required: true,
      default: "created",
      index: true,
    },
    deliveryZone: {
      type: String,
      enum: ["inside_city", "outside_city", "sub_city", "remote_area"],
      required: true,
    },
    parcelType: {
      type: String,
      enum: ["document", "parcel", "liquid"],
      default: "parcel",
    },
    parcelWeight: { type: Number, required: true, default: 500 }, // grams
    dimensions: { type: dimensionsSchema, required: true },
    codAmount: { type: Number, required: true, min: 0 },
    declaredValue: { type: Number, required: true, min: 0 },
    deliveryCharge: { type: Number, required: true, default: 0 },
    codCharge: { type: Number, required: true, default: 0 },
    history: [timelineSchema],
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "shipments" },
);

export const ShipmentModel =
  mongoose.models.Shipment || mongoose.model("Shipment", shipmentSchema);
export default ShipmentModel;
