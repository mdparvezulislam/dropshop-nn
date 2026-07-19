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
  website?: string;
  logo?: string;
  coverImage?: string;
  description?: string;
  businessType: string;
  tradeLicenseNumber: string;
  binNumber?: string;
  tinNumber?: string;
  nidVerified: boolean;
  businessVerificationStatus: "unverified" | "pending" | "verified" | "rejected";
  address: SupplierAddress;
  status: "pending" | "active" | "suspended" | "blocked" | "archived";
  contacts: any[];
  banking?: any;
  documents: any[];
  settings?: any;
}

export type SupplierDocumentType = BaseDocument & SupplierDBFields;

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
    website: { type: String, required: false },
    logo: { type: String, required: false },
    coverImage: { type: String, required: false },
    description: { type: String, required: false },
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
      enum: ["pending", "active", "suspended", "blocked", "archived"],
      default: "pending",
      index: true,
    },
    contacts: [supplierContactSchema],
    banking: { type: supplierBankAccountSchema, required: false },
    documents: [supplierDocumentSchema],
    settings: { type: supplierSettingsSchema, default: () => ({}) },
    ...supplierBaseFields,
  },
  baseSchemaOptions,
);

supplierSchema.plugin(softDeletePlugin);

export const SupplierModel =
  mongoose.models.Supplier || mongoose.model<SupplierDocumentType>("Supplier", supplierSchema);
export default SupplierModel;
