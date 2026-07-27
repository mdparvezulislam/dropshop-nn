import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";

const warrantySchema = new Schema(
  {
    warrantyNumber: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true },
    previousStatuses: [{ type: String }],
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    variantSku: { type: String, default: null },
    issue: { type: String, required: true },
    customerNote: { type: String, default: null },
    internalNote: { type: String, default: null },
    resolution: { type: String, default: null },
    rejectionReason: { type: String, default: null },
    repairNotes: { type: String, default: null },
    replacementProductId: { type: String, default: null },
    requestedAt: { type: Date, default: null },
    approvedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    requestedBy: { type: String, default: null },
    approvedBy: { type: String, default: null },
    ...baseFieldsDefinition,
  },
  { ...baseSchemaOptions, collection: "warranties" },
);

warrantySchema.index({ orderId: 1, status: 1 });
warrantySchema.index({ createdAt: -1 });

export const WarrantyModel = mongoose.models.Warranty || mongoose.model("Warranty", warrantySchema);
export default WarrantyModel;
