import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/shared/lib/database/base-schema";
import { BaseDocument } from "@/shared/lib/database/types";

const supplierContactSchema = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  isPrimary: { type: Boolean, default: false },
  isEmergency: { type: Boolean, default: false },
});

const supplierBankAccountSchema = new Schema({
  bankName: { type: String, required: false },
  branch: { type: String, required: false },
  accountName: { type: String, required: false },
  accountNumber: { type: String, required: false },
  routingNumber: { type: String, required: false },
  mobileBankingType: { type: String, required: false },
  binanceWalletAddress: { type: String, required: false },
});

const supplierDocumentSchema = new Schema({
  type: { type: String, required: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
});

const supplierSettingsSchema = new Schema({
  autoAcceptOrders: { type: Boolean, default: false },
  autoRejectOutOfStock: { type: Boolean, default: true },
  allowBackorders: { type: Boolean, default: false },
  processingTimeDays: { type: Number, default: 3 },
  returnPolicy: { type: String, default: "No returns unless damaged" },
  warrantyPeriodDays: { type: Number, default: 0 },
  shippingTimeDays: { type: Number, default: 5 },
});

const supplierNoteSchema = new Schema(
  {
    content: { type: String, required: true },
    createdBy: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const supplierPerformanceSchema = new Schema(
  {
    completedOrders: { type: Number, default: 0 },
    cancelledOrders: { type: Number, default: 0 },
    averageDeliveryDays: { type: Number, default: 0 },
    returnRate: { type: Number, default: 0 },
    responseTimeHours: { type: Number, default: 0 },
    performanceScore: { type: Number, default: 0 },
  },
  { _id: false },
);

export interface SupplierAddress {
  country: string;
  division: string;
  district: string;
  upazila: string;
  area: string;
  postalCode: string;
  fullAddress: string;
  pickupAddress: string;
  returnAddress: string;
}

export interface SupplierDBFields {
  code: string;
  businessName: string;
  ownerName: string;
  contactPerson: string;
  email: string;
  phone: string;
  alternativePhone?: string;
  facebook?: string;
  whatsApp?: string;
  website?: string;
  logo?: string;
  coverImage?: string;
  description?: string;
  supplierCategory: string;
  businessType: string;
  tradeLicenseNumber: string;
  binNumber?: string;
  tinNumber?: string;
  nidVerified: boolean;
  businessVerificationStatus: "unverified" | "pending" | "verified" | "rejected";
  address: SupplierAddress;
  status: "pending" | "active" | "inactive" | "suspended" | "blocked";
  contacts: any[];
  banking?: any;
  documents: any[];
  settings?: any;
  performance?: any;
  tags?: string[];
  notes?: any[];
}

export type SupplierDocumentType = BaseDocument & SupplierDBFields;

// ─── Supplier Product Mapping ───────────────────────────────

export interface SupplierProductMappingDBFields {
  supplierId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  variantSku?: string;
  supplierSku: string;
  isPrimary: boolean;
  priority: number;
  notes?: string;
}

export type SupplierProductMappingDocumentType = BaseDocument & SupplierProductMappingDBFields;

const { status: _, ...supplierBaseFields } = baseFieldsDefinition;

const supplierSchema = new Schema<SupplierDocumentType>(
  {
    code: { type: String, required: true, unique: true, index: true },
    businessName: { type: String, required: true, index: true },
    ownerName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true, unique: true, index: true },
    alternativePhone: { type: String, required: false },
    facebook: { type: String, required: false },
    whatsApp: { type: String, required: false },
    website: { type: String, required: false },
    logo: { type: String, required: false },
    coverImage: { type: String, required: false },
    description: { type: String, required: false },
    supplierCategory: {
      type: String,
      enum: ["manufacturer", "importer", "wholesaler", "distributor", "local_vendor", "dropshipping_partner"],
      default: "local_vendor",
      index: true,
    },
    businessType: { type: String, required: true },
    tradeLicenseNumber: { type: String, required: true },
    binNumber: { type: String, required: false },
    tinNumber: { type: String, required: false },
    nidVerified: { type: Boolean, default: false },
    businessVerificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified",
    },
    address: {
      country: { type: String, required: true },
      division: { type: String, required: true },
      district: { type: String, required: true, index: true },
      upazila: { type: String, required: true },
      area: { type: String, required: true },
      postalCode: { type: String, required: true },
      fullAddress: { type: String, required: true },
      pickupAddress: { type: String, required: true },
      returnAddress: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "active", "inactive", "suspended", "blocked"],
      default: "pending",
      index: true,
    },
    contacts: [supplierContactSchema],
    banking: { type: supplierBankAccountSchema, required: false },
    documents: [supplierDocumentSchema],
    settings: { type: supplierSettingsSchema, default: () => ({}) },
    performance: { type: supplierPerformanceSchema, default: () => ({}) },
    tags: [{ type: String }],
    notes: [supplierNoteSchema],
    ...supplierBaseFields,
  },
  baseSchemaOptions,
);

supplierSchema.plugin(softDeletePlugin);

export const SupplierModel =
  mongoose.models.Supplier || mongoose.model<SupplierDocumentType>("Supplier", supplierSchema);

// ─── Supplier Product Mapping Model ─────────────────────────

const supplierProductMappingSchema = new Schema<SupplierProductMappingDocumentType>(
  {
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
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
    supplierSku: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
    priority: { type: Number, default: 0 },
    notes: { type: String, required: false },
    ...baseFieldsDefinition,
  },
  baseSchemaOptions,
);

supplierProductMappingSchema.index(
  { supplierId: 1, productId: 1, variantSku: 1 },
  { unique: true, sparse: true },
);
supplierProductMappingSchema.index({ productId: 1, supplierId: 1 });
supplierProductMappingSchema.plugin(softDeletePlugin);

export const SupplierProductMappingModel =
  mongoose.models.SupplierProductMapping ||
  mongoose.model<SupplierProductMappingDocumentType>(
    "SupplierProductMapping",
    supplierProductMappingSchema,
  );

export default SupplierModel;
