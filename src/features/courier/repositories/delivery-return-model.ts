import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/shared/lib/database/base-schema";

const { status: baseStatus, ...otherBaseFields } = baseFieldsDefinition;

const deliveryReturnSchema = new Schema(
  {
    returnNumber: { type: String, required: true, unique: true, index: true },
    shipmentId: { type: String, required: true, index: true },
    orderId: { type: String, required: true, index: true },
    trackingCode: { type: String, required: true },
    reason: { type: String, required: true },
    status: { type: String, required: true, default: "return_initiated" },
    returnChargeCents: { type: Number, default: 0 },
    initiatedBy: { type: String, required: true },
    notes: { type: String },
    receivedAt: { type: Date },
    completedAt: { type: Date },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "delivery_returns" },
);

const rtsRecordSchema = new Schema(
  {
    rtsNumber: { type: String, required: true, unique: true, index: true },
    shipmentId: { type: String, required: true, index: true },
    orderId: { type: String, required: true, index: true },
    reason: { type: String, required: true },
    status: { type: String, required: true, default: "rts_created" },
    inspectionCondition: { type: String },
    inspectorNotes: { type: String },
    receivedAt: { type: Date },
    completedAt: { type: Date },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "rts_records" },
);

export const DeliveryReturnModel =
  mongoose.models.DeliveryReturn || mongoose.model("DeliveryReturn", deliveryReturnSchema);

export const RTSRecordModel =
  mongoose.models.RTSRecord || mongoose.model("RTSRecord", rtsRecordSchema);
