import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/shared/lib/database/base-schema";

const riskSchema = new Schema(
  {
    orderId: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "frequent_returns",
        "cod_refusal",
        "fake_order",
        "multiple_cancellations",
        "duplicate_order",
        "suspicious_activity",
      ],
      required: true,
    },
    reason: { type: String, required: true },
    confidence: { type: Number, required: true },
    detectedBy: {
      type: String,
      enum: ["system", "manual"],
      default: "system",
    },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date, default: null },
    resolvedBy: { type: String, default: null },
    resolution: { type: String, default: null },
    ...baseFieldsDefinition,
  },
  { ...baseSchemaOptions, collection: "order_risk_flags" },
);

riskSchema.index({ category: 1, createdAt: -1 });
riskSchema.index({ riskLevel: 1, resolved: 1 });

export const RiskModel = mongoose.model("RiskFlag", riskSchema);
export default RiskModel;
