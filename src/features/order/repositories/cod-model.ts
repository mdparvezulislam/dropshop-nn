import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";
import { COD_SETTLEMENT_STATUSES } from "../domain/cod-entity";

const codReconciliationSchema = new Schema(
  {
    orderId: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true },
    courierName: { type: String, required: true },
    trackingNumber: { type: String, required: true },
    expectedAmount: { type: Number, required: true, min: 0 },
    receivedAmount: { type: Number, required: true, min: 0, default: 0 },
    difference: { type: Number, required: true, default: 0 },
    settlementStatus: { type: String, enum: [...COD_SETTLEMENT_STATUSES], default: "pending" },
    settlementDate: { type: Date, default: null },
    notes: { type: String, default: null },
    reconciledAt: { type: Date, default: null },
    reconciledBy: { type: String, default: null },
    ...baseFieldsDefinition,
  },
  { ...baseSchemaOptions, collection: "cod_reconciliations" },
);

codReconciliationSchema.index({ orderId: 1 });
codReconciliationSchema.index({ settlementStatus: 1, createdAt: -1 });
codReconciliationSchema.index({ createdAt: -1 });

export const CodReconciliationModel =
  mongoose.models.CodReconciliation || mongoose.model("CodReconciliation", codReconciliationSchema);
export default CodReconciliationModel;
