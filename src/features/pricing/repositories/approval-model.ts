import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/lib/database/base-schema";
import { BaseDocument } from "@/lib/database/types";

export interface PriceChangeDB {
  field: string;
  oldValue: mongoose.Mixed;
  newValue: mongoose.Mixed;
}

export interface PriceApprovalDBFields {
  entityType: "product_pricing" | "global_rule" | "profile" | "campaign" | "bulk_update";
  entityId: string;
  requestedBy: string;
  requestedByName?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  changes: PriceChangeDB[];
  reason: string;
  reviewNote?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
}

export type PriceApprovalDocument = BaseDocument & PriceApprovalDBFields;

const { status: _, ...baseFields } = baseFieldsDefinition;

const priceChangeSchema = new Schema(
  {
    field: { type: String, required: true },
    oldValue: { type: Schema.Types.Mixed, required: false },
    newValue: { type: Schema.Types.Mixed, required: false },
  },
  { _id: false },
);

const priceApprovalSchema = new Schema<PriceApprovalDocument>(
  {
    entityType: {
      type: String,
      enum: ["product_pricing", "global_rule", "profile", "campaign", "bulk_update"],
      required: true,
      index: true,
    },
    entityId: { type: String, required: true, index: true },
    requestedBy: { type: String, required: true, index: true },
    requestedByName: { type: String, required: false },
    reviewedBy: { type: String, required: false },
    reviewedByName: { type: String, required: false },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },
    changes: { type: [priceChangeSchema], default: [] },
    reason: { type: String, required: true, maxlength: 1000 },
    reviewNote: { type: String, required: false, maxlength: 1000 },
    approvedAt: { type: Date, required: false },
    rejectedAt: { type: Date, required: false },
    ...baseFields,
  },
  baseSchemaOptions,
);

priceApprovalSchema.index({ status: 1, createdAt: -1 });
priceApprovalSchema.plugin(softDeletePlugin);

export const PriceApprovalModel =
  mongoose.models.PriceApproval ||
  mongoose.model<PriceApprovalDocument>("PriceApproval", priceApprovalSchema);

export interface PriceHistoryEntryDBFields {
  productId: mongoose.Types.ObjectId;
  variantSku?: string;
  field: string;
  oldValue: number;
  newValue: number;
  changedBy: string;
  changedByName?: string;
  reason?: string;
  source: "manual" | "rule" | "bulk" | "import" | "automation" | "approval" | "campaign";
  affectedProducts?: number;
}

export type PriceHistoryEntryDocument = BaseDocument & PriceHistoryEntryDBFields;

const priceHistorySchema = new Schema<PriceHistoryEntryDocument>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    variantSku: { type: String, required: false, index: true },
    field: { type: String, required: true, index: true },
    oldValue: { type: Number, required: true },
    newValue: { type: Number, required: true },
    changedBy: { type: String, required: true, index: true },
    changedByName: { type: String, required: false },
    reason: { type: String, required: false, maxlength: 500 },
    source: {
      type: String,
      enum: ["manual", "rule", "bulk", "import", "automation", "approval", "campaign"],
      required: true,
      index: true,
    },
    affectedProducts: { type: Number, required: false },
    ...baseFields,
  },
  baseSchemaOptions,
);

priceHistorySchema.index({ productId: 1, createdAt: -1 });
priceHistorySchema.index({ changedBy: 1, createdAt: -1 });
priceHistorySchema.plugin(softDeletePlugin);

export const PriceHistoryEntryModel =
  mongoose.models.PriceHistoryEntry ||
  mongoose.model<PriceHistoryEntryDocument>("PriceHistoryEntry", priceHistorySchema);
