import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/lib/database/base-schema";
import { BaseDocument } from "@/lib/database/types";

export interface ResellerAddressDB {
  country: string;
  division: string;
  district: string;
  upazila: string;
  area: string;
  postalCode: string;
  fullAddress: string;
}

export interface ResellerDBFields {
  code: string;
  businessName: string;
  ownerName: string;
  contactPerson: string;
  email: string;
  phone: string;
  alternativePhone?: string;
  logo?: string;
  coverImage?: string;
  businessType: string;
  address: ResellerAddressDB;
  nidNumber?: string;
  nidVerified: boolean;
  tradeLicenseNumber?: string;
  tradeLicenseVerified: boolean;
  status: "pending" | "active" | "suspended" | "blocked" | "archived";
  userId?: mongoose.Types.ObjectId;
  collections: string[];
  tags: string[];
  notes?: string;
}

export type ResellerDocumentType = BaseDocument & ResellerDBFields;

export interface ResellerProductPricingDB {
  sellingPrice: number;
  discountAmount: number;
  discountPercentage: number;
  recommendedPrice: number;
  costBasis: number;
  profitAmount: number;
  profitMargin: number;
  currency: string;
  isCustomPrice: boolean;
}

export interface ResellerProductDBFields {
  resellerId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  variantSku?: string;
  customTitle?: string;
  customDescription?: string;
  personalNotes?: string;
  sellingStatus: "draft" | "active" | "hidden" | "out_of_catalog";
  isFavorite: boolean;
  isHidden: boolean;
  collectionIds: string[];
  groupIds: string[];
  tags: string[];
  pricing: ResellerProductPricingDB;
  assignedAt: Date;
}

export type ResellerProductDocumentType = BaseDocument & ResellerProductDBFields;

export interface ResellerCollectionDBFields {
  resellerId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  productIds: mongoose.Types.ObjectId[];
}

export type ResellerCollectionDocumentType = BaseDocument & ResellerCollectionDBFields;

export interface ResellerProductGroupDBFields {
  resellerId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  productIds: mongoose.Types.ObjectId[];
}

export type ResellerProductGroupDocumentType = BaseDocument & ResellerProductGroupDBFields;

const resellerAddressSchema = new Schema(
  {
    country: { type: String, required: true },
    division: { type: String, required: true },
    district: { type: String, required: true },
    upazila: { type: String, required: true },
    area: { type: String, required: true },
    postalCode: { type: String, required: true },
    fullAddress: { type: String, required: true },
  },
  { _id: false },
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { status: _resellerStatus, ...resellerBaseFields } = baseFieldsDefinition;

const resellerSchema = new Schema<ResellerDocumentType>(
  {
    code: { type: String, required: true, unique: true, index: true },
    businessName: { type: String, required: true, index: true },
    ownerName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true, unique: true, index: true },
    alternativePhone: { type: String, required: false },
    logo: { type: String, required: false },
    coverImage: { type: String, required: false },
    businessType: { type: String, required: true },
    address: { type: resellerAddressSchema, required: true },
    nidNumber: { type: String, required: false },
    nidVerified: { type: Boolean, default: false },
    tradeLicenseNumber: { type: String, required: false },
    tradeLicenseVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "active", "suspended", "blocked", "archived"],
      default: "pending",
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false, index: true },
    collections: [{ type: String }],
    tags: [{ type: String, index: true }],
    notes: { type: String, required: false },
    ...resellerBaseFields,
  },
  baseSchemaOptions,
);

resellerSchema.index({ businessName: 1, status: 1 });
resellerSchema.plugin(softDeletePlugin);

export const ResellerModel =
  mongoose.models.Reseller || mongoose.model<ResellerDocumentType>("Reseller", resellerSchema);

const resellerProductPricingSchema = new Schema(
  {
    sellingPrice: { type: Number, required: true, min: 0, default: 0 },
    discountAmount: { type: Number, required: true, min: 0, default: 0 },
    discountPercentage: { type: Number, required: true, min: 0, max: 100, default: 0 },
    recommendedPrice: { type: Number, required: true, min: 0, default: 0 },
    costBasis: { type: Number, required: true, min: 0, default: 0 },
    profitAmount: { type: Number, required: true, default: 0 },
    profitMargin: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, default: "USD", uppercase: true },
    isCustomPrice: { type: Boolean, default: false },
  },
  { _id: false },
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { status: _rpStatus, ...resellerProductBaseFields } = baseFieldsDefinition;

const resellerProductSchema = new Schema<ResellerProductDocumentType>(
  {
    resellerId: {
      type: Schema.Types.ObjectId,
      ref: "Reseller",
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
    customTitle: { type: String, required: false },
    customDescription: { type: String, required: false },
    personalNotes: { type: String, required: false },
    sellingStatus: {
      type: String,
      enum: ["draft", "active", "hidden", "out_of_catalog"],
      default: "draft",
      index: true,
    },
    isFavorite: { type: Boolean, default: false, index: true },
    isHidden: { type: Boolean, default: false, index: true },
    collectionIds: [{ type: String }],
    groupIds: [{ type: String }],
    tags: [{ type: String, index: true }],
    pricing: { type: resellerProductPricingSchema, required: true },
    assignedAt: { type: Date, default: Date.now },
    ...resellerProductBaseFields,
  },
  baseSchemaOptions,
);

resellerProductSchema.index(
  { resellerId: 1, productId: 1, variantSku: 1 },
  { unique: true, sparse: true },
);
resellerProductSchema.index({ resellerId: 1, sellingStatus: 1 });
resellerProductSchema.index({ resellerId: 1, isFavorite: 1 });
resellerProductSchema.plugin(softDeletePlugin);

export const ResellerProductModel =
  mongoose.models.ResellerProduct ||
  mongoose.model<ResellerProductDocumentType>("ResellerProduct", resellerProductSchema);

const resellerCollectionSchema = new Schema<ResellerCollectionDocumentType>(
  {
    resellerId: {
      type: Schema.Types.ObjectId,
      ref: "Reseller",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    slug: { type: String, required: true, index: true },
    description: { type: String, required: false },
    productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    ...baseFieldsDefinition,
  },
  baseSchemaOptions,
);

resellerCollectionSchema.index({ resellerId: 1, slug: 1 }, { unique: true });
resellerCollectionSchema.plugin(softDeletePlugin);

export const ResellerCollectionModel =
  mongoose.models.ResellerCollection ||
  mongoose.model<ResellerCollectionDocumentType>("ResellerCollection", resellerCollectionSchema);

const resellerProductGroupSchema = new Schema<ResellerProductGroupDocumentType>(
  {
    resellerId: {
      type: Schema.Types.ObjectId,
      ref: "Reseller",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    slug: { type: String, required: true, index: true },
    description: { type: String, required: false },
    productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    ...baseFieldsDefinition,
  },
  baseSchemaOptions,
);

resellerProductGroupSchema.index({ resellerId: 1, slug: 1 }, { unique: true });
resellerProductGroupSchema.plugin(softDeletePlugin);

export const ResellerProductGroupModel =
  mongoose.models.ResellerProductGroup ||
  mongoose.model<ResellerProductGroupDocumentType>(
    "ResellerProductGroup",
    resellerProductGroupSchema,
  );

export default ResellerModel;
