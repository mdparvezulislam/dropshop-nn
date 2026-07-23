import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions, softDeletePlugin } from "@/lib/database/base-schema";
import { BaseDocument } from "@/lib/database/types";

export interface MoqTierEntryDB {
  minQuantity: number;
  maxQuantity?: number;
  price: number;
  discountPercent?: number;
  label?: string;
}

export interface MoqTierDBFields {
  productId: mongoose.Types.ObjectId;
  variantSku?: string;
  tiers: MoqTierEntryDB[];
  isActive: boolean;
}

export type MoqTierDocument = BaseDocument & MoqTierDBFields;

const { status: _, ...baseFields } = baseFieldsDefinition;

const moqTierEntrySchema = new Schema(
  {
    minQuantity: { type: Number, required: true, min: 1 },
    maxQuantity: { type: Number, required: false, min: 1 },
    price: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, required: false, min: 0, max: 100 },
    label: { type: String, required: false, maxlength: 100 },
  },
  { _id: false },
);

const moqTierSchema = new Schema<MoqTierDocument>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    variantSku: { type: String, required: false, index: true },
    tiers: { type: [moqTierEntrySchema], required: true, validate: [(arr: unknown[]) => arr.length > 0, "At least one tier required"] },
    isActive: { type: Boolean, default: true, index: true },
    ...baseFields,
  },
  baseSchemaOptions,
);

moqTierSchema.index({ productId: 1, variantSku: 1 }, { unique: true, sparse: true });
moqTierSchema.plugin(softDeletePlugin);

export const MoqTierModel =
  mongoose.models.MoqTier ||
  mongoose.model<MoqTierDocument>("MoqTier", moqTierSchema);
