import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/lib/database/base-schema";
import { BaseDocument } from "@/lib/database/types";

export interface ApplicationDBFields {
  userId: string;
  userFullName: string;
  userPhone: string;
  userEmail: string;
  membershipType: string;
  status:
    "pending" | "under_review" | "need_info" | "approved" | "rejected" | "suspended" | "expired";
  commonFields: {
    fullName: string;
    phone: string;
    altPhone?: string;
    bkashNumber: string;
    district: string;
    upazila: string;
    fullAddress: string;
    facebookProfile?: string;
    facebookPage?: string;
    website?: string;
    salesChannel: string;
  };
  resellerFields?: {
    monthlyOrders: "0-20" | "20-50" | "50-100" | "100+";
    productCategories: string[];
  };
  wholesalerFields?: {
    companyName: string;
    businessType: "Retail Shop" | "Online Shop" | "Distributor" | "Dealer" | "Importer" | "Other";
    estimatedMonthlyPurchase: "২০,০০০+" | "৫০,০০০+" | "১,০০,০০০+" | "৫,০০,০০০+";
    tradeLicense?: string;
    binNumber?: string;
    tinNumber?: string;
  };
  reviewNotes?: string;
  adminQuestion?: string;
  userAnswer?: string;
  reviewedBy?: string;
  reviewedAt?: Date | null;
  rejectionReason?: string;
}

export type ApplicationDocument = BaseDocument & ApplicationDBFields;

const { status: _, ...appBaseFields } = baseFieldsDefinition;

const applicationSchema = new Schema<ApplicationDocument>(
  {
    userId: { type: String, required: true, index: true },
    userFullName: { type: String, required: true },
    userPhone: { type: String, required: true },
    userEmail: { type: String, required: true },
    membershipType: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: [
        "pending",
        "under_review",
        "need_info",
        "approved",
        "rejected",
        "suspended",
        "expired",
      ],
      default: "pending",
      index: true,
    },
    commonFields: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      altPhone: { type: String },
      bkashNumber: { type: String, required: true },
      district: { type: String, required: true },
      upazila: { type: String, required: true },
      fullAddress: { type: String, required: true },
      facebookProfile: { type: String },
      facebookPage: { type: String },
      website: { type: String },
      salesChannel: { type: String, required: true },
    },
    resellerFields: {
      monthlyOrders: { type: String, enum: ["0-20", "20-50", "50-100", "100+"] },
      productCategories: [{ type: String }],
    },
    wholesalerFields: {
      companyName: { type: String },
      businessType: { type: String },
      estimatedMonthlyPurchase: { type: String },
      tradeLicense: { type: String },
      binNumber: { type: String },
      tinNumber: { type: String },
    },
    reviewNotes: { type: String },
    adminQuestion: { type: String },
    userAnswer: { type: String },
    reviewedBy: { type: String },
    reviewedAt: { type: Date, default: null },
    rejectionReason: { type: String },
    ...appBaseFields,
  },
  baseSchemaOptions,
);

applicationSchema.plugin(softDeletePlugin);
applicationSchema.index({ userId: 1, membershipType: 1, status: 1 });

export const BusinessMembershipApplicationModel =
  mongoose.models.BusinessMembershipApplication ||
  mongoose.model<ApplicationDocument>("BusinessMembershipApplication", applicationSchema);

export default BusinessMembershipApplicationModel;
