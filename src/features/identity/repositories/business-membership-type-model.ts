import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/lib/database/base-schema";
import { BaseDocument } from "@/lib/database/types";

export interface MembershipBenefitsDBFields {
  features: string[];
  pricingRules: {
    ruleType: string;
    discountPercent?: number;
    marginPercent?: number;
  };
  minimumOrderAmount: number;
  discountRules: {
    minQty?: number;
    discountPercent?: number;
  };
  accessRules: string[];
  dashboardVisibility: boolean;
  marketingAccess: boolean;
}

export interface BusinessMembershipTypeDBFields {
  slug: string;
  name: string;
  banglaName: string;
  description: string;
  icon: string;
  color: string;
  priority: number;
  approvalRequired: boolean;
  isActive: boolean;
  isArchived: boolean;
  benefits: MembershipBenefitsDBFields;
}

export type BusinessMembershipTypeDocument = BaseDocument & BusinessMembershipTypeDBFields;

const { status: _, ...membershipTypeBaseFields } = baseFieldsDefinition;

const businessMembershipTypeSchema = new Schema<BusinessMembershipTypeDocument>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    banglaName: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: "UserCheck" },
    color: { type: String, default: "blue" },
    priority: { type: Number, default: 0 },
    approvalRequired: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true, index: true },
    isArchived: { type: Boolean, default: false, index: true },
    benefits: {
      features: [{ type: String }],
      pricingRules: {
        ruleType: { type: String, default: "standard" },
        discountPercent: { type: Number, default: 0 },
        marginPercent: { type: Number, default: 0 },
      },
      minimumOrderAmount: { type: Number, default: 0 },
      discountRules: {
        minQty: { type: Number, default: 1 },
        discountPercent: { type: Number, default: 0 },
      },
      accessRules: [{ type: String }],
      dashboardVisibility: { type: Boolean, default: true },
      marketingAccess: { type: Boolean, default: false },
    },
    ...membershipTypeBaseFields,
  },
  baseSchemaOptions,
);

businessMembershipTypeSchema.plugin(softDeletePlugin);

export const BusinessMembershipTypeModel =
  mongoose.models.BusinessMembershipType ||
  mongoose.model<BusinessMembershipTypeDocument>(
    "BusinessMembershipType",
    businessMembershipTypeSchema,
  );

export default BusinessMembershipTypeModel;
