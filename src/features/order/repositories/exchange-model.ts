import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/shared/lib/database/base-schema";

const exchangeItemSchema = new Schema({
  productId: { type: String, required: true },
  variantSku: { type: String, default: null },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
});

const exchangeSchema = new Schema(
  {
    exchangeNumber: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true },
    previousStatuses: [{ type: String }],
    items: [exchangeItemSchema],
    reason: { type: String, required: true },
    customerNote: { type: String, default: null },
    internalNote: { type: String, default: null },
    rejectionReason: { type: String, default: null },
    pickupAddress: { type: String, default: null },
    pickupDate: { type: Date, default: null },
    replacementProductId: { type: String, default: null },
    replacementVariantSku: { type: String, default: null },
    trackingNumber: { type: String, default: null },
    trackingUrl: { type: String, default: null },
    requestedAt: { type: Date, default: null },
    approvedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    requestedBy: { type: String, default: null },
    approvedBy: { type: String, default: null },
    ...baseFieldsDefinition,
  },
  { ...baseSchemaOptions, collection: "exchanges" },
);

exchangeSchema.index({ orderId: 1, status: 1 });
exchangeSchema.index({ createdAt: -1 });

export const ExchangeModel = mongoose.model("Exchange", exchangeSchema);
export default ExchangeModel;
