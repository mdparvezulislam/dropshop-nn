import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/lib/database/base-schema";
import { BaseDocument } from "@/lib/database/types";

export interface ProductVersionDBFields {
  productId: string;
  versionNumber: number;
  snapshot: Record<string, unknown>;
  changedFields: string[];
  editorId?: string;
  editorName?: string;
  reason?: string;
}

export type ProductVersionDocument = BaseDocument & ProductVersionDBFields;

const { status: _, ...versionBaseFields } = baseFieldsDefinition;

const productVersionSchema = new Schema<ProductVersionDocument>(
  {
    productId: { type: String, required: true, index: true },
    versionNumber: { type: Number, required: true },
    snapshot: { type: Schema.Types.Mixed, required: true },
    changedFields: [{ type: String }],
    editorId: { type: String, required: false },
    editorName: { type: String, required: false },
    reason: { type: String, required: false },
    ...versionBaseFields,
  },
  baseSchemaOptions,
);

productVersionSchema.plugin(softDeletePlugin);

productVersionSchema.index({ productId: 1, versionNumber: 1 }, { unique: true });
productVersionSchema.index({ productId: 1, createdAt: -1 });

export const ProductVersionModel =
  mongoose.models.ProductVersion ||
  mongoose.model<ProductVersionDocument>("ProductVersion", productVersionSchema);
export default ProductVersionModel;
