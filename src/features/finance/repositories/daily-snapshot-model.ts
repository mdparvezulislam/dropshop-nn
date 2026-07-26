import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";

const { status: baseStatus, ...otherBaseFields } = baseFieldsDefinition;

const dailySnapshotSchema = new Schema(
  {
    snapshotDate: { type: String, required: true, unique: true, index: true }, // YYYY-MM-DD
    openingBalanceCents: { type: Number, required: true },
    closingBalanceCents: { type: Number, required: true },
    revenueCents: { type: Number, required: true },
    profitCents: { type: Number, required: true },
    withdrawalsCents: { type: Number, required: true },
    depositsCents: { type: Number, required: true },
    refundsCents: { type: Number, required: true },
    totalTransactionsCount: { type: Number, required: true },
    reconciled: { type: Boolean, default: true },
    lockedAt: { type: Date, required: true, default: Date.now },
    notes: { type: String, default: null },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "daily_snapshots" },
);

dailySnapshotSchema.index({ snapshotDate: -1 });

export const DailySnapshotModel =
  mongoose.models.DailySnapshot || mongoose.model("DailySnapshot", dailySnapshotSchema);
export default DailySnapshotModel;
