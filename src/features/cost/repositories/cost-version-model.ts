import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions, softDeletePlugin } from "@/shared/lib/database/base-schema";
import { BaseDocument } from "@/shared/lib/database/types";

export interface CostSupplierInfoDB {
  supplierId?: string;
  supplierName?: string;
  supplierSku?: string;
  invoiceNumber?: string;
  purchaseDate?: Date;
  purchaseLink?: string;
  notes?: string;
}

export interface CostVersionDBFields {
  productId: mongoose.Types.ObjectId;
  variantSku?: string;
  versionNumber: number;
  costPrice: number;
  currency: string;
  supplier: CostSupplierInfoDB;
  importCost: number;
  shippingCost: number;
  packagingCost: number;
  handlingCost: number;
  otherExpenses: number;
  landedCost: number;
  reason: string;
  reasonText?: string;
  notes?: string;
  effectiveDate: Date;
  isCurrentVersion: boolean;
  previousCostPrice?: number;
  previousLandedCost?: number;
  changedBy?: string;
  changedByName?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvalStatus: "pending" | "approved" | "rejected";
  approvedAt?: Date;
}

export type CostVersionDocument = BaseDocument & CostVersionDBFields;

const { status: _cs, ...costBaseFields } = baseFieldsDefinition;

const costSupplierInfoSchema = new Schema<CostSupplierInfoDB>({
  supplierId: { type: String, required: false },
  supplierName: { type: String, required: false },
  supplierSku: { type: String, required: false },
  invoiceNumber: { type: String, required: false },
  purchaseDate: { type: Date, required: false },
  purchaseLink: { type: String, required: false },
  notes: { type: String, required: false },
}, { _id: false });

const costVersionSchema = new Schema<CostVersionDocument>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
  variantSku: { type: String, required: false, index: true },
  versionNumber: { type: Number, required: true, default: 1 },
  costPrice: { type: Number, required: true },
  currency: { type: String, required: true, default: "BDT" },
  supplier: { type: costSupplierInfoSchema, default: {} },
  importCost: { type: Number, required: true, default: 0 },
  shippingCost: { type: Number, required: true, default: 0 },
  packagingCost: { type: Number, required: true, default: 0 },
  handlingCost: { type: Number, required: true, default: 0 },
  otherExpenses: { type: Number, required: true, default: 0 },
  landedCost: { type: Number, required: true, default: 0 },
  reason: { type: String, required: true, index: true },
  reasonText: { type: String, required: false },
  notes: { type: String, required: false, maxlength: 2000 },
  effectiveDate: { type: Date, required: true, default: Date.now },
  isCurrentVersion: { type: Boolean, required: true, default: true, index: true },
  previousCostPrice: { type: Number, required: false },
  previousLandedCost: { type: Number, required: false },
  changedBy: { type: String, required: false, index: true },
  changedByName: { type: String, required: false },
  approvedBy: { type: String, required: false },
  approvedByName: { type: String, required: false },
  approvalStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
  approvedAt: { type: Date, required: false },
  ...costBaseFields,
}, baseSchemaOptions);

costVersionSchema.index({ productId: 1, versionNumber: -1 });
costVersionSchema.index({ productId: 1, isCurrentVersion: 1 });
costVersionSchema.index({ effectiveDate: -1 });
costVersionSchema.index({ approvalStatus: 1, createdAt: -1 });
costVersionSchema.plugin(softDeletePlugin);

export const CostVersionModel =
  mongoose.models.CostVersion ||
  mongoose.model<CostVersionDocument>("CostVersion", costVersionSchema);
