import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";

const { status: baseStatus, ...otherBaseFields } = baseFieldsDefinition;

const deliveryDisputeSchema = new Schema(
  {
    disputeNumber: { type: String, required: true, unique: true, index: true },
    shipmentId: { type: String, required: true, index: true },
    orderId: { type: String, required: true, index: true },
    disputeType: { type: String, required: true },
    status: { type: String, required: true, default: "created" },
    assignedStaffId: { type: String },
    assignedStaffName: { type: String },
    evidenceUrls: [{ type: String }],
    internalNotes: [{ type: String }],
    resolutionSummary: { type: String },
    codDiscrepancyCents: { type: Number, default: 0 },
    resolvedAt: { type: Date },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "delivery_disputes" },
);

const logisticsEscalationSchema = new Schema(
  {
    escalationNumber: { type: String, required: true, unique: true, index: true },
    disputeId: { type: String, required: true, index: true },
    shipmentId: { type: String, required: true, index: true },
    level: { type: String, required: true, default: "level_1" },
    assignedRole: { type: String, required: true },
    reason: { type: String, required: true },
    status: { type: String, required: true, default: "open" },
    escalatedBy: { type: String, required: true },
    resolvedBy: { type: String },
    resolutionNotes: { type: String },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "logistics_escalations" },
);

export const DeliveryDisputeModel =
  mongoose.models.DeliveryDispute || mongoose.model("DeliveryDispute", deliveryDisputeSchema);

export const LogisticsEscalationModel =
  mongoose.models.LogisticsEscalation ||
  mongoose.model("LogisticsEscalation", logisticsEscalationSchema);
