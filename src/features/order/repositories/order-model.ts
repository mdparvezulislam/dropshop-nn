import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";
import { ORDER_STATUSES } from "../domain/state-machine";

const timelineChangeSchema = new Schema(
  {
    field: { type: String, required: true },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
  },
  { _id: false },
);

const timelineActorSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String },
    role: { type: String },
  },
  { _id: false },
);

const timelineEntrySchema = new Schema({
  id: { type: String, required: true },
  eventType: { type: String, required: true },
  action: { type: String, required: true },
  summary: { type: String, required: true },
  actor: { type: timelineActorSchema, default: null },
  changes: [timelineChangeSchema],
  metadata: { type: Map, of: Schema.Types.Mixed, default: null },
  correlationId: { type: String, default: null },
  timestamp: { type: Date, required: true },
});

const customerSnapshotSchema = new Schema(
  {
    customerId: { type: String, default: null },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: null },
    alternativePhone: { type: String, default: null },
  },
  { _id: false },
);

const shippingSnapshotSchema = new Schema(
  {
    receiverName: { type: String, required: true },
    phone: { type: String, required: true },
    alternativePhone: { type: String, default: null },
    division: { type: String, required: true },
    district: { type: String, required: true },
    upazila: { type: String, required: true },
    area: { type: String, required: true },
    address: { type: String, required: true },
    deliveryNote: { type: String, default: null },
  },
  { _id: false },
);

const pricingItemSchema = new Schema({
  productId: { type: String, required: true },
  variantSku: { type: String, default: null },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitSellingPrice: { type: Number, required: true, min: 0 },
  unitWholesalePrice: { type: Number, default: null, min: 0 },
  unitCostBasis: { type: Number, required: true, min: 0 },
  totalSellingPrice: { type: Number, required: true, min: 0 },
  totalCostBasis: { type: Number, required: true, min: 0 },
  totalProfit: { type: Number, required: true },
  marginPercent: { type: Number, required: true },
  currency: { type: String, required: true },
  pricingSource: {
    type: String,
    enum: ["retail", "reseller", "wholesale", "campaign", "flash_sale"],
    required: true,
  },
  campaignId: { type: String, default: null },
  appliedRules: [{ type: String }],
});

const pricingSnapshotSchema = new Schema(
  {
    items: [pricingItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    discountTotal: { type: Number, required: true, min: 0 },
    taxTotal: { type: Number, required: true, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true },
  },
  { _id: false },
);

const profitPreviewSchema = new Schema(
  {
    totalCostBasis: { type: Number, required: true, min: 0 },
    totalRevenue: { type: Number, required: true, min: 0 },
    totalProfit: { type: Number, required: true },
    averageMargin: { type: Number, required: true },
  },
  { _id: false },
);

const shippingInfoSchema = new Schema(
  {
    courierId: { type: String, default: null },
    courierName: { type: String, default: null },
    trackingNumber: { type: String, default: null },
    trackingUrl: { type: String, default: null },
    estimatedDeliveryDate: { type: Date, default: null },
    actualDeliveryDate: { type: Date, default: null },
    shippingCost: { type: Number, default: null, min: 0 },
  },
  { _id: false },
);

const supplierItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    variantSku: { type: String, default: null },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const supplierReferenceSchema = new Schema(
  {
    supplierId: { type: String, required: true },
    supplierName: { type: String, required: true },
    items: [supplierItemSchema],
  },
  { _id: false },
);

const orderItemSchema = new Schema({
  productId: { type: String, required: true },
  variantSku: { type: String, default: null },
  productName: { type: String, default: null },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  unitCost: { type: Number, required: true, min: 0 },
  totalCost: { type: Number, required: true, min: 0 },
  unitProfit: { type: Number, required: true },
  totalProfit: { type: Number, required: true },
  ...baseFieldsDefinition,
});

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: ["guest", "customer", "reseller", "wholesaler"],
      required: true,
      index: true,
    },
    previousStatuses: [{ type: String }],
    priority: { type: String, enum: ["low", "normal", "high", "urgent", "vip"], default: "normal", index: true },
    checkoutDraftId: { type: String, required: true, index: true },
    checkoutId: { type: String, required: true, index: true },
    cartId: { type: String, required: true, index: true },
    customer: { type: customerSnapshotSchema, required: true },
    shipping: { type: shippingSnapshotSchema, required: true },
    pricing: { type: pricingSnapshotSchema, required: true },
    profitPreview: { type: profitPreviewSchema, default: null },
    shippingInfo: { type: shippingInfoSchema, default: null },
    timeline: [timelineEntrySchema],
    items: [orderItemSchema],
    note: { type: String, default: null },
    internalNote: { type: String, default: null },
    tags: [{ type: String }],
    supplierReferences: [supplierReferenceSchema],
    source: { type: String, default: null },
    autoConfirmed: { type: Boolean, default: false },
    resellerId: { type: String, default: null, index: true },
    wholesaleId: { type: String, default: null, index: true },
    confirmedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    returnedAt: { type: Date, default: null },
    refundedAt: { type: Date, default: null },
    failedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    ...baseFieldsDefinition,
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "draft",
      index: true,
    },
  },
  { ...baseSchemaOptions, collection: "orders" },
);

orderSchema.index({ status: 1, type: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ "customer.phone": 1 });
orderSchema.index({ "shipping.division": 1, "shipping.district": 1 });
orderSchema.index({ tags: 1 });

export const OrderModel =
  mongoose.models.Order || mongoose.model("Order", orderSchema);
export default OrderModel;
