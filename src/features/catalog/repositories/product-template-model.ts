import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/lib/database/base-schema";
import { BaseDocument } from "@/lib/database/types";

const templateSpecFieldSchema = new Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "number", "boolean", "select", "multiselect", "color"],
      default: "text",
    },
    defaultValue: { type: Schema.Types.Mixed, required: true },
    options: [{ type: String }],
    required: { type: Boolean, default: false },
    group: { type: String, enum: ["specification", "technical", "general"], default: "general" },
  },
  { _id: false },
);

const templateAttributeSchema = new Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ["text", "select", "color", "size", "number"], default: "text" },
    options: [{ type: String }],
    required: { type: Boolean, default: false },
  },
  { _id: false },
);

const templatePricingProfileSchema = new Schema(
  {
    retailMultiplier: { type: Number, default: 1.4 },
    wholesaleMultiplier: { type: Number, default: 1.3 },
    resellerMultiplier: { type: Number, default: 1.22 },
    campaignMultiplier: { type: Number, default: 1.15 },
    minMarginPercent: { type: Number, default: 15 },
  },
  { _id: false },
);

const templateShippingProfileSchema = new Schema(
  {
    weight: { type: Number, default: 0.5 },
    weightUnit: { type: String, default: "kg" },
    length: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    dimensionUnit: { type: String, default: "cm" },
    shippingClass: { type: String, default: "standard" },
  },
  { _id: false },
);

const templateWarrantyProfileSchema = new Schema(
  {
    period: { type: String, default: "1 Year" },
    periodDays: { type: Number, default: 365 },
    type: { type: String, enum: ["manufacturer", "seller", "none"], default: "seller" },
    description: { type: String, default: "" },
  },
  { _id: false },
);

const templateSEOProfileSchema = new Schema(
  {
    metaTitleTemplate: { type: String, default: "" },
    metaDescriptionTemplate: { type: String, default: "" },
    focusKeywordSuggestions: [{ type: String }],
  },
  { _id: false },
);

const templateGoogleMerchantSchema = new Schema(
  {
    googleProductCategory: { type: String, default: "" },
    ageGroup: { type: String, default: "adult" },
    gender: { type: String, default: "unisex" },
    condition: { type: String, default: "new" },
  },
  { _id: false },
);

export interface ProductTemplateDBFields {
  name: string;
  slug: string;
  nameBangla: string;
  description: string;
  iconName: string;
  categoryId?: mongoose.Types.ObjectId;
  categoryName: string;
  isActive: boolean;
  sortOrder: number;
  specs: any[];
  attributes: any[];
  suggestedTags: string[];
  suggestedCollections: string[];
  pricingProfile: any;
  shippingProfile: any;
  warrantyProfile: any;
  returnPolicy: string;
  packageIncludes: string[];
  seoProfile: any;
  googleMerchant: any;
  suggestedBulletFeatures: string[];
}

export type ProductTemplateDocument = BaseDocument & ProductTemplateDBFields;

const { status: _, ...templateBaseFields } = baseFieldsDefinition;

const productTemplateSchema = new Schema<ProductTemplateDocument>(
  {
    name: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    nameBangla: { type: String, required: true },
    description: { type: String, default: "" },
    iconName: { type: String, default: "Package" },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "CatalogCategory",
      required: false,
      index: true,
    },
    categoryName: { type: String, required: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
    specs: [templateSpecFieldSchema],
    attributes: [templateAttributeSchema],
    suggestedTags: [{ type: String }],
    suggestedCollections: [{ type: String }],
    pricingProfile: { type: templatePricingProfileSchema, default: () => ({}) },
    shippingProfile: { type: templateShippingProfileSchema, default: () => ({}) },
    warrantyProfile: { type: templateWarrantyProfileSchema, default: () => ({}) },
    returnPolicy: { type: String, default: "" },
    packageIncludes: [{ type: String }],
    seoProfile: { type: templateSEOProfileSchema, default: () => ({}) },
    googleMerchant: { type: templateGoogleMerchantSchema, default: () => ({}) },
    suggestedBulletFeatures: [{ type: String }],
    ...templateBaseFields,
  },
  baseSchemaOptions,
);

productTemplateSchema.plugin(softDeletePlugin);

productTemplateSchema.index({ categoryName: 1, isActive: 1 });
productTemplateSchema.index({ name: "text", nameBangla: "text", categoryName: "text" });

export const ProductTemplateModel =
  mongoose.models.CatalogProductTemplate ||
  mongoose.model<ProductTemplateDocument>("CatalogProductTemplate", productTemplateSchema);

export default ProductTemplateModel;
