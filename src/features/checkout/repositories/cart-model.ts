import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";

const cartItemSchema = new Schema({
  productId: { type: String, required: true },
  variantSku: { type: String, default: null },
  quantity: { type: Number, required: true, min: 1 },
  resolvedPrice: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, default: "USD" },
  appliedRule: { type: String, default: null },
  campaignId: { type: String, default: null },
  profitPreview: {
    costBasis: { type: Number, min: 0 },
    profitAmount: { type: Number },
    profitMargin: { type: Number },
  },
});

const cartSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["guest", "customer", "reseller", "wholesaler"],
      required: true,
    },
    sessionId: { type: String, default: null, index: true },
    userId: { type: String, default: null, index: true },
    resellerId: { type: String, default: null, index: true },
    wholesaleId: { type: String, default: null, index: true },
    items: [cartItemSchema],
    itemCount: { type: Number, default: 0, min: 0 },
    subtotal: { type: Number, default: 0, min: 0 },
    currency: { type: String, required: true, default: "USD" },
    notes: { type: String, default: null },
    expiresAt: { type: Date, default: null, index: { expireAfterSeconds: 0 } },
    lastActivityAt: { type: Date, default: Date.now },
    ...baseFieldsDefinition,
  },
  { ...baseSchemaOptions, collection: "carts" },
);

cartSchema.index({ status: 1, lastActivityAt: -1 });
cartSchema.index({ sessionId: 1, status: 1 });
cartSchema.index({ userId: 1, status: 1 });
cartSchema.index({ resellerId: 1, status: 1 });
cartSchema.index({ wholesaleId: 1, status: 1 });

export const CartModel = mongoose.model("Cart", cartSchema);
