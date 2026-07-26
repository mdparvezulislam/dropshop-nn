import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/lib/database/base-schema";
import { BaseDocument } from "@/lib/database/types";

export interface CampaignPricingDBFields {
  name: string;
  campaignType: "campaign" | "flash_sale" | "festival" | "seasonal" | "clearance";
  productId: mongoose.Types.ObjectId;
  variantSku?: string;
  campaignPrice: number;
  effectiveFrom: Date;
  effectiveTo: Date;
  timezone: string;
  priority: number;
  isActive: boolean;
  autoRestore: boolean;
  description?: string;
}

export type CampaignPricingDocument = BaseDocument & CampaignPricingDBFields;

export interface ScheduledPricingDBFields {
  productId: mongoose.Types.ObjectId;
  variantSku?: string;
  scheduledPrice: number;
  scheduledCost?: number;
  effectiveFrom: Date;
  effectiveTo: Date;
  timezone: string;
  autoEnable: boolean;
  autoDisable: boolean;
  isActive: boolean;
  status: "pending" | "active" | "expired" | "cancelled";
}

export type ScheduledPricingDocument = BaseDocument & ScheduledPricingDBFields;

const { status: _, ...baseFields } = baseFieldsDefinition;

const campaignPricingSchema = new Schema<CampaignPricingDocument>(
  {
    name: { type: String, required: true, maxlength: 200 },
    campaignType: {
      type: String,
      enum: ["campaign", "flash_sale", "festival", "seasonal", "clearance"],
      required: true,
      index: true,
    },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    variantSku: { type: String, required: false, index: true },
    campaignPrice: { type: Number, required: true, min: 0 },
    effectiveFrom: { type: Date, required: true },
    effectiveTo: { type: Date, required: true },
    timezone: { type: String, default: "Asia/Dhaka" },
    priority: { type: Number, default: 100, min: 0, max: 1000 },
    isActive: { type: Boolean, default: true, index: true },
    autoRestore: { type: Boolean, default: true },
    description: { type: String, maxlength: 500, default: "" },
    ...baseFields,
  },
  baseSchemaOptions,
);

campaignPricingSchema.index({ productId: 1, isActive: 1, effectiveFrom: 1, effectiveTo: 1 });
campaignPricingSchema.plugin(softDeletePlugin);

export const CampaignPricingModel =
  mongoose.models.CampaignPricing ||
  mongoose.model<CampaignPricingDocument>("CampaignPricing", campaignPricingSchema);

const scheduledPricingSchema = new Schema<ScheduledPricingDocument>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    variantSku: { type: String, required: false, index: true },
    scheduledPrice: { type: Number, required: true, min: 0 },
    scheduledCost: { type: Number, required: false, min: 0 },
    effectiveFrom: { type: Date, required: true },
    effectiveTo: { type: Date, required: true },
    timezone: { type: String, default: "Asia/Dhaka" },
    autoEnable: { type: Boolean, default: true },
    autoDisable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true, index: true },
    status: {
      type: String,
      enum: ["pending", "active", "expired", "cancelled"],
      default: "pending",
      index: true,
    },
    ...baseFields,
  },
  baseSchemaOptions,
);

scheduledPricingSchema.plugin(softDeletePlugin);

export const ScheduledPricingModel =
  mongoose.models.ScheduledPricing ||
  mongoose.model<ScheduledPricingDocument>("ScheduledPricing", scheduledPricingSchema);
