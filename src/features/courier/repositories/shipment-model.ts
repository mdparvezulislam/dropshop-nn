import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";
import { SHIPMENT_STATUSES } from "../domain/shipment-state-machine";

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
    trackingCode: { type: String, default: null, index: true },
    trackingUrl: { type: String, default: null },
    provider: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: SHIPMENT_STATUSES,
      default: "draft",
      index: true,
    },
    nativeStatus: { type: String, default: null },
    deliveryZone: { type: String, default: "inside_city" },
    parcelType: { type: String, default: "parcel" },

    // Package
    parcelWeight: { type: Number, default: 500, min: 0 },
    dimensions: {
      length: { type: Number, default: 10, min: 0 },
      width: { type: Number, default: 10, min: 0 },
      height: { type: Number, default: 10, min: 0 },
      // Legacy field: written before WEBSITE-009 renamed it to `length`.
      depth: { type: Number, default: null },
    },
    volumetricWeight: { type: Number, default: 0, min: 0 },
    chargeableWeight: { type: Number, default: 0, min: 0 },
    packageCount: { type: Number, default: 1, min: 1 },

    // Money (minor units)
    codAmount: { type: Number, required: true, min: 0 },
    declaredValue: { type: Number, default: 0, min: 0 },
    deliveryCharge: { type: Number, default: 0, min: 0 },
    codCharge: { type: Number, default: 0, min: 0 },
    returnCharge: { type: Number, default: 0, min: 0 },

    recipient: { type: recipientSchema, required: true },
    pickupAddressId: { type: String, default: null },

    // Milestones
    pickupDate: { type: Date, default: null },
    dispatchDate: { type: Date, default: null },
    estimatedDeliveryDate: { type: Date, default: null },
    deliveryDate: { type: Date, default: null },
    returnDate: { type: Date, default: null },

    // Notes
    deliveryNotes: { type: String, default: null },
    internalNotes: { type: String, default: null },

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
// Search by tracking code must not scan: it is the customer-facing lookup key.
shipmentSchema.index({ trackingCode: 1, isDeleted: 1 });

export const ShipmentModel = mongoose.models.Shipment || mongoose.model("Shipment", shipmentSchema);
export default ShipmentModel;
