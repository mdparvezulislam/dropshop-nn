import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/shared/lib/database/base-schema";
import { BaseDocument } from "@/shared/lib/database/types";

export interface ProductInventoryDBFields {
  productId: mongoose.Types.ObjectId;
  variantSku?: string;
  warehouseId?: mongoose.Types.ObjectId | null;
  availableStock: number;
  reservedStock: number;
  incomingStock: number;
  damagedStock: number;
  returnedStock: number;
  soldStock: number;
  virtualStock: number;
  safetyStock: number;
  reorderLevel: number;
  lowStockThreshold: number;
  availability: "in_stock" | "low_stock" | "out_of_stock" | "pre_order" | "backorder" | "discontinued";
  allowPreOrder: boolean;
  allowBackorder: boolean;
  status: "active" | "inactive" | "frozen";
}

export type ProductInventoryDocumentType = BaseDocument & ProductInventoryDBFields;

export interface InventoryHistoryDBFields {
  inventoryId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  variantSku?: string;
  warehouseId?: mongoose.Types.ObjectId | null;
  operation: "stock_in" | "stock_out" | "adjustment" | "reservation" | "release" | "transfer" | "damage" | "return" | "sold";
  quantity: number;
  previousAvailable: number;
  newAvailable: number;
  previousReserved: number;
  newReserved: number;
  reason?: string;
  referenceId?: string;
  notes?: string;
  performedBy?: string;
}

export type InventoryHistoryDocumentType = BaseDocument & InventoryHistoryDBFields;

export interface SupplierInventoryDBFields {
  productId: mongoose.Types.ObjectId;
  supplierId: mongoose.Types.ObjectId;
  variantSku?: string;
  supplierSku: string;
  supplierCost: number;
  supplierStock: number;
  leadTimeDays: number;
  minimumOrderQuantity: number;
  isPreferred: boolean;
  currency: string;
  status: "active" | "inactive" | "discontinued";
}

export type SupplierInventoryDocumentType = BaseDocument & SupplierInventoryDBFields;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { status: _invStatus, ...inventoryBaseFields } = baseFieldsDefinition;

const productInventorySchema = new Schema<ProductInventoryDocumentType>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    variantSku: { type: String, required: false, index: true },
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
      required: false,
      default: null,
      index: true,
    },
    availableStock: { type: Number, required: true, default: 0, min: 0 },
    reservedStock: { type: Number, required: true, default: 0, min: 0 },
    incomingStock: { type: Number, required: true, default: 0, min: 0 },
    damagedStock: { type: Number, required: true, default: 0, min: 0 },
    returnedStock: { type: Number, required: true, default: 0, min: 0 },
    soldStock: { type: Number, required: true, default: 0, min: 0 },
    virtualStock: { type: Number, required: true, default: 0, min: 0 },
    safetyStock: { type: Number, required: true, default: 0, min: 0 },
    reorderLevel: { type: Number, required: true, default: 0, min: 0 },
    lowStockThreshold: { type: Number, required: true, default: 5, min: 0 },
    availability: {
      type: String,
      enum: ["in_stock", "low_stock", "out_of_stock", "pre_order", "backorder", "discontinued"],
      default: "out_of_stock",
      index: true,
    },
    allowPreOrder: { type: Boolean, default: false },
    allowBackorder: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "inactive", "frozen"],
      default: "active",
      index: true,
    },
    ...inventoryBaseFields,
  },
  baseSchemaOptions,
);

productInventorySchema.index(
  { productId: 1, variantSku: 1, warehouseId: 1 },
  { unique: true, sparse: true },
);
productInventorySchema.index({ availability: 1, status: 1 });
productInventorySchema.index({ availableStock: 1, reorderLevel: 1 });

productInventorySchema.plugin(softDeletePlugin);

export const ProductInventoryModel =
  mongoose.models.ProductInventory ||
  mongoose.model<ProductInventoryDocumentType>("ProductInventory", productInventorySchema);

const inventoryHistorySchema = new Schema<InventoryHistoryDocumentType>(
  {
    inventoryId: {
      type: Schema.Types.ObjectId,
      ref: "ProductInventory",
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    variantSku: { type: String, required: false, index: true },
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
      required: false,
      default: null,
    },
    operation: {
      type: String,
      enum: ["stock_in", "stock_out", "adjustment", "reservation", "release", "transfer", "damage", "return", "sold"],
      required: true,
      index: true,
    },
    quantity: { type: Number, required: true },
    previousAvailable: { type: Number, required: true },
    newAvailable: { type: Number, required: true },
    previousReserved: { type: Number, required: true },
    newReserved: { type: Number, required: true },
    reason: { type: String, required: false },
    referenceId: { type: String, required: false, index: true },
    notes: { type: String, required: false },
    performedBy: { type: String, required: false },
    ...baseFieldsDefinition,
  },
  baseSchemaOptions,
);

inventoryHistorySchema.index({ inventoryId: 1, createdAt: -1 });
inventoryHistorySchema.index({ productId: 1, createdAt: -1 });
inventoryHistorySchema.index({ operation: 1, createdAt: -1 });

inventoryHistorySchema.plugin(softDeletePlugin);

export const InventoryHistoryModel =
  mongoose.models.InventoryHistory ||
  mongoose.model<InventoryHistoryDocumentType>("InventoryHistory", inventoryHistorySchema);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { status: _supStatus, ...supplierInventoryBaseFields } = baseFieldsDefinition;

const supplierInventorySchema = new Schema<SupplierInventoryDocumentType>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
      index: true,
    },
    variantSku: { type: String, required: false, index: true },
    supplierSku: { type: String, required: true, index: true },
    supplierCost: { type: Number, required: true, default: 0, min: 0 },
    supplierStock: { type: Number, required: true, default: 0, min: 0 },
    leadTimeDays: { type: Number, required: true, default: 0, min: 0 },
    minimumOrderQuantity: { type: Number, required: true, default: 1, min: 1 },
    isPreferred: { type: Boolean, default: false },
    currency: { type: String, required: true, default: "USD", uppercase: true, trim: true },
    status: {
      type: String,
      enum: ["active", "inactive", "discontinued"],
      default: "active",
      index: true,
    },
    ...supplierInventoryBaseFields,
  },
  baseSchemaOptions,
);

supplierInventorySchema.index(
  { productId: 1, supplierId: 1, variantSku: 1 },
  { unique: true, sparse: true },
);
supplierInventorySchema.index({ supplierId: 1, status: 1 });
supplierInventorySchema.index({ supplierSku: 1, supplierId: 1 });

supplierInventorySchema.plugin(softDeletePlugin);

export const SupplierInventoryModel =
  mongoose.models.SupplierInventory ||
  mongoose.model<SupplierInventoryDocumentType>("SupplierInventory", supplierInventorySchema);

export default ProductInventoryModel;
