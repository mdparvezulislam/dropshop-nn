import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";

const returnItemSchema = new Schema({
  productId: { type: String, required: true },
  variantSku: { type: String, default: null },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  reason: { type: String, default: null },
});

const returnSchema = new Schema(
  {
    returnNumber: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true },
    previousStatuses: [{ type: String }],
    items: [returnItemSchema],
    reason: { type: String, required: true },
    customerNote: { type: String, default: null },
    internalNote: { type: String, default: null },
    inspectionNotes: { type: String, default: null },
    rejectionReason: { type: String, default: null },
    refundAmount: { type: Number, default: null, min: 0 },
    refundedAt: { type: Date, default: null },
    requestedAt: { type: Date, default: null },
    approvedAt: { type: Date, default: null },
    receivedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    requestedBy: { type: String, default: null },
    approvedBy: { type: String, default: null },
    ...baseFieldsDefinition,
  },
  { ...baseSchemaOptions, collection: "returns" },
);

returnSchema.index({ orderId: 1, status: 1 });
returnSchema.index({ createdAt: -1 });

export const ReturnModel = mongoose.models.Return || mongoose.model("Return", returnSchema);
export default ReturnModel;
