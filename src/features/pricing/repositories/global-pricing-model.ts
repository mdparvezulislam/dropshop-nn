import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/lib/database/base-schema";
import { BaseDocument } from "@/lib/database/types";

export interface GlobalPricingRuleDBFields {
  name: string;
  channel: "retail" | "wholesale" | "reseller" | "distributor" | "vip_reseller" | "marketplace";
  markupType: "percentage" | "fixed_amount";
  markupValue: number;
  roundPriceTo?: number;
  minProfit?: number;
  maxDiscount?: number;
  minMarginPercent?: number;
  isActive: boolean;
  priority: number;
}

export type GlobalPricingRuleDocument = BaseDocument & GlobalPricingRuleDBFields;

const { status: _, ...baseFields } = baseFieldsDefinition;

const globalPricingRuleSchema = new Schema<GlobalPricingRuleDocument>(
  {
    name: { type: String, required: true, maxlength: 200 },
    channel: {
      type: String,
      enum: ["retail", "wholesale", "reseller", "distributor", "vip_reseller", "marketplace"],
      required: true,
      index: true,
    },
    markupType: { type: String, enum: ["percentage", "fixed_amount"], required: true },
    markupValue: { type: Number, required: true, min: 0 },
    roundPriceTo: { type: Number, enum: [1, 5, 10, 50, 100, 500, 1000], required: false },
    minProfit: { type: Number, required: false, min: 0 },
    maxDiscount: { type: Number, required: false, min: 0, max: 100 },
    minMarginPercent: { type: Number, required: false, min: 0, max: 100 },
    isActive: { type: Boolean, default: true, index: true },
    priority: { type: Number, default: 100, min: 0, max: 1000 },
    ...baseFields,
  },
  baseSchemaOptions,
);

globalPricingRuleSchema.index({ channel: 1, isActive: 1, priority: -1 });
globalPricingRuleSchema.plugin(softDeletePlugin);

export const GlobalPricingRuleModel =
  mongoose.models.GlobalPricingRule ||
  mongoose.model<GlobalPricingRuleDocument>("GlobalPricingRule", globalPricingRuleSchema);

export interface CategoryPricingOverrideDBFields {
  categoryId: mongoose.Types.ObjectId;
  categoryName: string;
  markupType: "percentage" | "fixed_amount";
  markupValue: number;
  minMarginPercent?: number;
  maxDiscountPercent?: number;
  isActive: boolean;
  priority: number;
}

export type CategoryPricingOverrideDocument = BaseDocument & CategoryPricingOverrideDBFields;

const categoryPricingSchema = new Schema<CategoryPricingOverrideDocument>(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    categoryName: { type: String, required: true, maxlength: 200 },
    markupType: { type: String, enum: ["percentage", "fixed_amount"], required: true },
    markupValue: { type: Number, required: true, min: 0 },
    minMarginPercent: { type: Number, required: false, min: 0, max: 100 },
    maxDiscountPercent: { type: Number, required: false, min: 0, max: 100 },
    isActive: { type: Boolean, default: true, index: true },
    priority: { type: Number, default: 100, min: 0, max: 1000 },
    ...baseFields,
  },
  baseSchemaOptions,
);

categoryPricingSchema.plugin(softDeletePlugin);

export const CategoryPricingOverrideModel =
  mongoose.models.CategoryPricingOverride ||
  mongoose.model<CategoryPricingOverrideDocument>("CategoryPricingOverride", categoryPricingSchema);

export interface BrandPricingOverrideDBFields {
  brandId: mongoose.Types.ObjectId;
  brandName: string;
  channel: "retail" | "wholesale" | "reseller" | "distributor";
  markupType: "percentage" | "fixed_amount";
  markupValue: number;
  minProfitPercent?: number;
  maxDiscountPercent?: number;
  isActive: boolean;
  priority: number;
}

export type BrandPricingOverrideDocument = BaseDocument & BrandPricingOverrideDBFields;

const brandPricingSchema = new Schema<BrandPricingOverrideDocument>(
  {
    brandId: { type: Schema.Types.ObjectId, ref: "Brand", required: true, index: true },
    brandName: { type: String, required: true, maxlength: 200 },
    channel: {
      type: String,
      enum: ["retail", "wholesale", "reseller", "distributor"],
      required: true,
    },
    markupType: { type: String, enum: ["percentage", "fixed_amount"], required: true },
    markupValue: { type: Number, required: true, min: 0 },
    minProfitPercent: { type: Number, required: false, min: 0, max: 100 },
    maxDiscountPercent: { type: Number, required: false, min: 0, max: 100 },
    isActive: { type: Boolean, default: true, index: true },
    priority: { type: Number, default: 100, min: 0, max: 1000 },
    ...baseFields,
  },
  baseSchemaOptions,
);

brandPricingSchema.plugin(softDeletePlugin);

export const BrandPricingOverrideModel =
  mongoose.models.BrandPricingOverride ||
  mongoose.model<BrandPricingOverrideDocument>("BrandPricingOverride", brandPricingSchema);

export interface SupplierPricingRuleDBFields {
  supplierId: mongoose.Types.ObjectId;
  supplierName: string;
  markupType: "percentage" | "fixed_amount";
  markupValue: number;
  minMarginPercent?: number;
  priority: number;
  leadCost?: number;
  handlingFee?: number;
  isActive: boolean;
}

export type SupplierPricingRuleDocument = BaseDocument & SupplierPricingRuleDBFields;

const supplierPricingSchema = new Schema<SupplierPricingRuleDocument>(
  {
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: true, index: true },
    supplierName: { type: String, required: true, maxlength: 200 },
    markupType: { type: String, enum: ["percentage", "fixed_amount"], required: true },
    markupValue: { type: Number, required: true, min: 0 },
    minMarginPercent: { type: Number, required: false, min: 0, max: 100 },
    priority: { type: Number, default: 100, min: 0, max: 1000 },
    leadCost: { type: Number, required: false, min: 0 },
    handlingFee: { type: Number, required: false, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
    ...baseFields,
  },
  baseSchemaOptions,
);

supplierPricingSchema.plugin(softDeletePlugin);

export const SupplierPricingRuleModel =
  mongoose.models.SupplierPricingRule ||
  mongoose.model<SupplierPricingRuleDocument>("SupplierPricingRule", supplierPricingSchema);
