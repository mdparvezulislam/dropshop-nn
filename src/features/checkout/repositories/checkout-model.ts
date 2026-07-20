import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/shared/lib/database/base-schema";

const checkoutPriceItemSchema = new Schema({
  productId: { type: String, required: true },
  variantSku: { type: String, default: null },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, default: "USD" },
  pricingSource: {
    type: String,
    enum: ["retail", "reseller", "wholesale", "campaign", "flash_sale"],
    required: true,
  },
  campaignId: { type: String, default: null },
  appliedRules: [{ type: String }],
});

const checkoutInventoryItemSchema = new Schema({
  productId: { type: String, required: true },
  variantSku: { type: String, default: null },
  quantity: { type: Number, required: true, min: 0 },
  available: { type: Number, required: true, min: 0 },
  isValid: { type: Boolean, required: true },
  message: { type: String, default: null },
  reservationId: { type: String, default: null },
});

const shippingInfoSchema = new Schema({
  receiverName: { type: String, required: true },
  phone: { type: String, required: true },
  alternativePhone: { type: String, default: null },
  division: { type: String, required: true },
  district: { type: String, required: true },
  upazila: { type: String, required: true },
  area: { type: String, required: true },
  address: { type: String, required: true },
  deliveryNote: { type: String, default: null },
});

const totalsSchema = new Schema({
  subtotal: { type: Number, required: true, min: 0 },
  discountTotal: { type: Number, required: true, min: 0 },
  taxTotal: { type: Number, required: true, min: 0 },
  grandTotal: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, default: "USD" },
});

const profitPreviewSchema = new Schema({
  totalCostBasis: { type: Number, required: true, min: 0 },
  totalRevenue: { type: Number, required: true, min: 0 },
  totalProfit: { type: Number, required: true },
  averageMargin: { type: Number, required: true },
});

const checkoutSessionSchema = new Schema(
  {
    cartId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["guest", "customer", "reseller", "wholesaler"],
      required: true,
    },
    step: {
      type: String,
      enum: [
        "cart_review",
        "price_resolved",
        "inventory_validated",
        "inventory_reserved",
        "draft_created",
        "completed",
        "expired",
        "failed",
      ],
      default: "cart_review",
    },
    resolvedPrices: [checkoutPriceItemSchema],
    inventoryValidations: [checkoutInventoryItemSchema],
    inventoryReservations: [checkoutInventoryItemSchema],
    shipping: { type: shippingInfoSchema, default: null },
    shippingCompleted: { type: Boolean, default: false },
    totals: { type: totalsSchema, default: null },
    profitPreview: { type: profitPreviewSchema, default: null },
    draftId: { type: String, default: null },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    ...baseFieldsDefinition,
  },
  { ...baseSchemaOptions, collection: "checkout_sessions" },
);

checkoutSessionSchema.index({ cartId: 1, status: 1 });

const orderDraftSchema = new Schema(
  {
    checkoutId: { type: String, required: true, index: true },
    cartId: { type: String, required: true },
    type: {
      type: String,
      enum: ["guest", "customer", "reseller", "wholesaler"],
      required: true,
    },
    resolvedPrices: [checkoutPriceItemSchema],
    inventoryReservations: [checkoutInventoryItemSchema],
    shipping: { type: shippingInfoSchema, required: true },
    totals: { type: totalsSchema, required: true },
    profitPreview: { type: profitPreviewSchema, default: null },
    ...baseFieldsDefinition,
  },
  { ...baseSchemaOptions, collection: "order_drafts" },
);

export const CheckoutSessionModel = mongoose.model("CheckoutSession", checkoutSessionSchema);
export const OrderDraftModel = mongoose.model("OrderDraft", orderDraftSchema);
