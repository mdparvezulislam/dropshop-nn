import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions, softDeletePlugin } from "@/shared/lib/database/base-schema";
import { BaseDocument } from "@/shared/lib/database/types";

export interface ProfileMarkupRuleDB {
  channel: "retail" | "wholesale" | "reseller" | "distributor";
  markupType: "percentage" | "fixed_amount";
  markupValue: number;
}

export interface ProfileDiscountRuleDB {
  type: "percentage" | "fixed_amount";
  value: number;
  minOrderValue?: number;
}

export interface PricingProfileDBFields {
  name: string;
  slug: string;
  description?: string;
  markupRules: ProfileMarkupRuleDB[];
  discountRules: ProfileDiscountRuleDB[];
  minMarginPercent: number;
  roundPriceTo?: number;
  isActive: boolean;
  isDefault: boolean;
}

export type PricingProfileDocument = BaseDocument & PricingProfileDBFields;

const { status: _, ...baseFields } = baseFieldsDefinition;

const profileMarkupRuleSchema = new Schema(
  {
    channel: { type: String, enum: ["retail", "wholesale", "reseller", "distributor"], required: true },
    markupType: { type: String, enum: ["percentage", "fixed_amount"], required: true },
    markupValue: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const profileDiscountRuleSchema = new Schema(
  {
    type: { type: String, enum: ["percentage", "fixed_amount"], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, required: false, min: 0 },
  },
  { _id: false },
);

const pricingProfileSchema = new Schema<PricingProfileDocument>(
  {
    name: { type: String, required: true, maxlength: 200, index: true },
    slug: { type: String, required: true, unique: true, maxlength: 200, lowercase: true },
    description: { type: String, maxlength: 500, default: "" },
    markupRules: { type: [profileMarkupRuleSchema], default: [] },
    discountRules: { type: [profileDiscountRuleSchema], default: [] },
    minMarginPercent: { type: Number, default: 0, min: 0, max: 100 },
    roundPriceTo: { type: Number, required: false, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
    isDefault: { type: Boolean, default: false },
    ...baseFields,
  },
  baseSchemaOptions,
);

pricingProfileSchema.plugin(softDeletePlugin);

export const PricingProfileModel =
  mongoose.models.PricingProfile ||
  mongoose.model<PricingProfileDocument>("PricingProfile", pricingProfileSchema);
