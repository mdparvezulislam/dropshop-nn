import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/shared/lib/database/base-schema";
import { BaseDocument } from "@/shared/lib/database/types";

export interface BusinessAddressDB {
  division: string;
  district: string;
  upazila: string;
  area?: string;
  postalCode?: string;
  fullAddress: string;
}

export interface BusinessDocumentsDB {
  nidNumber?: string;
  tradeLicenseNumber?: string;
  tinNumber?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankBranch?: string;
  bkashNumber?: string;
  nagadNumber?: string;
}

export interface BusinessSocialLinksDB {
  website?: string;
  facebookPage?: string;
  instagram?: string;
  youtube?: string;
  whatsapp?: string;
  telegram?: string;
}

export interface BusinessProfileDBFields {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  ownerName: string;
  primaryPhone: string;
  secondaryPhone?: string;
  email: string;
  businessType: string;
  role: string;
  description?: string;
  logo?: string;
  banner?: string;
  address: BusinessAddressDB;
  socialLinks?: BusinessSocialLinksDB;
  documents?: BusinessDocumentsDB;
  verificationStatus: string;
  verificationNotes?: string;
  verifiedAt?: Date | null;
  verifiedBy?: string;
  status: string;
  statusReason?: string;
  suspendedAt?: Date | null;
}

export type BusinessProfileDocument = BaseDocument & BusinessProfileDBFields;

const businessAddressSchema = new Schema<BusinessAddressDB>(
  {
    division: { type: String, required: true },
    district: { type: String, required: true, index: true },
    upazila: { type: String, required: true },
    area: { type: String, required: false },
    postalCode: { type: String, required: false },
    fullAddress: { type: String, required: true },
  },
  { _id: false },
);

const businessDocumentsSchema = new Schema<BusinessDocumentsDB>(
  {
    nidNumber: { type: String, required: false },
    tradeLicenseNumber: { type: String, required: false },
    tinNumber: { type: String, required: false },
    bankAccountName: { type: String, required: false },
    bankAccountNumber: { type: String, required: false },
    bankName: { type: String, required: false },
    bankBranch: { type: String, required: false },
    bkashNumber: { type: String, required: false },
    nagadNumber: { type: String, required: false },
  },
  { _id: false },
);

const businessSocialLinksSchema = new Schema<BusinessSocialLinksDB>(
  {
    website: { type: String, required: false },
    facebookPage: { type: String, required: false },
    instagram: { type: String, required: false },
    youtube: { type: String, required: false },
    whatsapp: { type: String, required: false },
    telegram: { type: String, required: false },
  },
  { _id: false },
);

const { status: _, ...profileBaseFields } = baseFieldsDefinition;

const businessProfileSchema = new Schema<BusinessProfileDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    businessName: { type: String, required: true, index: true },
    ownerName: { type: String, required: true },
    primaryPhone: { type: String, required: true, index: true },
    secondaryPhone: { type: String, required: false },
    email: { type: String, required: true, index: true },
    businessType: {
      type: String,
      enum: ["sole_proprietorship", "partnership", "limited_company", "individual"],
      required: true,
    },
    role: {
      type: String,
      enum: ["reseller", "wholesaler", "supplier"],
      required: true,
      index: true,
    },
    description: { type: String, required: false },
    logo: { type: String, required: false },
    banner: { type: String, required: false },
    address: { type: businessAddressSchema, required: true },
    socialLinks: { type: businessSocialLinksSchema, required: false },
    documents: { type: businessDocumentsSchema, required: false },
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified",
      index: true,
    },
    verificationNotes: { type: String, required: false },
    verifiedAt: { type: Date, default: null, required: false },
    verifiedBy: { type: String, required: false },
    status: {
      type: String,
      enum: ["pending", "active", "suspended", "blocked", "archived"],
      default: "pending",
      index: true,
    },
    statusReason: { type: String, required: false },
    suspendedAt: { type: Date, default: null, required: false },
    ...profileBaseFields,
  },
  baseSchemaOptions,
);

businessProfileSchema.plugin(softDeletePlugin);

businessProfileSchema.index({ userId: 1, role: 1 }, { unique: true });

export const BusinessProfileModel =
  mongoose.models.BusinessProfile ||
  mongoose.model<BusinessProfileDocument>("BusinessProfile", businessProfileSchema);
export default BusinessProfileModel;
