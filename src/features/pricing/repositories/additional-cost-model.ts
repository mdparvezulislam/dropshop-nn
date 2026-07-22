import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions, softDeletePlugin } from "@/shared/lib/database/base-schema";
import { BaseDocument } from "@/shared/lib/database/types";

export interface AdditionalCostDBFields {
  productId: mongoose.Types.ObjectId;
  variantSku?: string;
  costType: "import" | "shipping" | "packaging" | "handling" | "vat" | "tax" | "customs" | "other";
  label: string;
  amount: number;
  isPercentage: boolean;
  percentageOfField?: "baseCostPrice" | "purchasePrice" | "supplierPrice" | "sellingPrice";
  isActive: boolean;
}

export type AdditionalCostDocument = BaseDocument & AdditionalCostDBFields;

const { status: _, ...baseFields } = baseFieldsDefinition;

const additionalCostSchema = new Schema<AdditionalCostDocument>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    variantSku: { type: String, required: false, index: true },
    costType: { type: String, enum: ["import", "shipping", "packaging", "handling", "vat", "tax", "customs", "other"], required: true, index: true },
    label: { type: String, required: true, maxlength: 200 },
    amount: { type: Number, required: true, min: 0 },
    isPercentage: { type: Boolean, default: false },
    percentageOfField: { type: String, enum: ["baseCostPrice", "purchasePrice", "supplierPrice", "sellingPrice"], required: false },
    isActive: { type: Boolean, default: true, index: true },
    ...baseFields,
  },
  baseSchemaOptions,
);

additionalCostSchema.plugin(softDeletePlugin);

export const AdditionalCostModel =
  mongoose.models.AdditionalCost ||
  mongoose.model<AdditionalCostDocument>("AdditionalCost", additionalCostSchema);
