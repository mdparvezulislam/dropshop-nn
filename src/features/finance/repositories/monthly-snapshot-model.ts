import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/shared/lib/database/base-schema";

const { status: baseStatus, ...otherBaseFields } = baseFieldsDefinition;

const monthlySnapshotSchema = new Schema(
  {
    monthKey: { type: String, required: true, unique: true, index: true }, // YYYY-MM
    openingBalanceCents: { type: Number, required: true },
    closingBalanceCents: { type: Number, required: true },
    grossRevenueCents: { type: Number, required: true },
    netRevenueCents: { type: Number, required: true },
    grossProfitCents: { type: Number, required: true },
    netProfitCents: { type: Number, required: true },
    withdrawalsCents: { type: Number, required: true },
    depositsCents: { type: Number, required: true },
    refundLossCents: { type: Number, required: true },
    commissionCents: { type: Number, required: true },
    platformEarningsCents: { type: Number, required: true },
    reconciled: { type: Boolean, default: true },
    lockedAt: { type: Date, required: true, default: Date.now },
    notes: { type: String, default: null },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "monthly_snapshots" },
);

monthlySnapshotSchema.index({ monthKey: -1 });

export const MonthlySnapshotModel =
  mongoose.models.MonthlySnapshot ||
  mongoose.model("MonthlySnapshot", monthlySnapshotSchema);
export default MonthlySnapshotModel;
