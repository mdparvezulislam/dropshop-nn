import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/shared/lib/database/base-schema";
import { BaseDocument } from "@/shared/lib/database/types";

export interface ProductPricingDBFields {
  productId: mongoose.Types.ObjectId;
  variantSku?: string;
  baseCostPrice: number;
  purchasePrice: number;
  supplierPrice: number;
  sellingPrice: number;
  wholesalePrice: number;
  resellerPrice: number;
  comparePrice: number;
  promotionalPrice?: number;
  discountAmount: number;
  discountPercentage: number;
  profitMargin: number;
  profitAmount: number;
  currency: string;
  taxRate: number;
  taxInclusive: boolean;
  commissionRate: number;
  pricingRule:
    "fixed" | "percentage" | "supplier_based" | "category_based" | "brand_based" | "dynamic";
  ruleConfig?: {
    baseField?: string;
    percentage?: number;
    fixedAmount?: number;
    categoryId?: mongoose.Types.ObjectId;
    brandId?: mongoose.Types.ObjectId;
    supplierId?: mongoose.Types.ObjectId;
    minMargin?: number;
    maxDiscount?: number;
  };
  status: "active" | "inactive" | "scheduled" | "expired";
  effectiveFrom?: Date | null;
  effectiveTo?: Date | null;
}

export type ProductPricingDocumentType = BaseDocument & ProductPricingDBFields;

const pricingRuleConfigSchema = new Schema(
  {
    baseField: {
      type: String,
      enum: ["baseCostPrice", "purchasePrice", "supplierPrice", "sellingPrice"],
      required: false,
    },
    percentage: { type: Number, required: false },
    fixedAmount: { type: Number, required: false },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: false },
    brandId: { type: Schema.Types.ObjectId, ref: "Brand", required: false },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: false },
    minMargin: { type: Number, required: false },
    maxDiscount: { type: Number, required: false },
  },
  { _id: false },
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { status: _, ...pricingBaseFields } = baseFieldsDefinition;

const productPricingSchema = new Schema<ProductPricingDocumentType>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    variantSku: { type: String, required: false, index: true },
    baseCostPrice: { type: Number, required: true, default: 0, min: 0 },
    purchasePrice: { type: Number, required: true, default: 0, min: 0 },
    supplierPrice: { type: Number, required: true, default: 0, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    wholesalePrice: { type: Number, required: true, default: 0, min: 0 },
    resellerPrice: { type: Number, required: true, default: 0, min: 0 },
    comparePrice: { type: Number, required: true, default: 0, min: 0 },
    promotionalPrice: { type: Number, required: false, min: 0 },
    discountAmount: { type: Number, required: true, default: 0, min: 0 },
    discountPercentage: { type: Number, required: true, default: 0, min: 0, max: 100 },
    profitMargin: { type: Number, required: true, default: 0 },
    profitAmount: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, default: "USD", uppercase: true, trim: true },
    taxRate: { type: Number, required: true, default: 0, min: 0, max: 100 },
    taxInclusive: { type: Boolean, default: false },
    commissionRate: { type: Number, required: true, default: 0, min: 0, max: 100 },
    pricingRule: {
      type: String,
      enum: ["fixed", "percentage", "supplier_based", "category_based", "brand_based", "dynamic"],
      default: "fixed",
      index: true,
    },
    ruleConfig: { type: pricingRuleConfigSchema, required: false },
    status: {
      type: String,
      enum: ["active", "inactive", "scheduled", "expired"],
      default: "active",
      index: true,
    },
    effectiveFrom: { type: Date, required: false, default: null },
    effectiveTo: { type: Date, required: false, default: null },
    ...pricingBaseFields,
  },
  baseSchemaOptions,
);

productPricingSchema.index({ productId: 1, variantSku: 1 }, { unique: true, sparse: true });
productPricingSchema.index({ productId: 1, status: 1 });
productPricingSchema.index({ currency: 1, status: 1 });

productPricingSchema.plugin(softDeletePlugin);

export const ProductPricingModel =
  mongoose.models.ProductPricing ||
  mongoose.model<ProductPricingDocumentType>("ProductPricing", productPricingSchema);

export default ProductPricingModel;
