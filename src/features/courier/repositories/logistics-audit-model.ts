import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";

const { status: baseStatus, ...otherBaseFields } = baseFieldsDefinition;

const logisticsAuditSchema = new Schema(
  {
    referenceNumber: { type: String, required: true, index: true },
    shipmentId: { type: String, default: null, index: true },
    orderId: { type: String, default: null, index: true },
    provider: { type: String, default: null, index: true },
    action: { type: String, required: true, index: true },
    actorId: { type: String, required: true },
    oldStatus: { type: String, default: null },
    newStatus: { type: String, default: null },
    reason: { type: String, default: null },
    details: { type: Schema.Types.Mixed, default: null },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "logistics_audit_logs" },
);

logisticsAuditSchema.index({ createdAt: -1 });

export const LogisticsAuditModel =
  mongoose.models.LogisticsAudit || mongoose.model("LogisticsAudit", logisticsAuditSchema);
export default LogisticsAuditModel;
