import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/lib/database/base-schema";
import { BaseDocument } from "@/lib/database/types";

export interface ProductAuditDBFields {
  productId: string;
  action: string;
  editorId?: string;
  editorName?: string;
  changedFields: string[];
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  summary?: string;
}

export type ProductAuditDocument = BaseDocument & ProductAuditDBFields;

const { status: _, ...auditBaseFields } = baseFieldsDefinition;

const productAuditSchema = new Schema<ProductAuditDocument>(
  {
    productId: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    editorId: { type: String, required: false },
    editorName: { type: String, required: false },
    changedFields: [{ type: String }],
    oldValues: { type: Schema.Types.Mixed, required: false },
    newValues: { type: Schema.Types.Mixed, required: false },
    summary: { type: String, required: false },
    ...auditBaseFields,
  },
  baseSchemaOptions,
);

productAuditSchema.plugin(softDeletePlugin);

productAuditSchema.index({ productId: 1, createdAt: -1 });
productAuditSchema.index({ action: 1, createdAt: -1 });

export const ProductAuditModel =
  mongoose.models.ProductAudit ||
  mongoose.model<ProductAuditDocument>("ProductAudit", productAuditSchema);
export default ProductAuditModel;
