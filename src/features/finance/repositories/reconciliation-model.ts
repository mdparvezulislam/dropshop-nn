import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";

const { status: baseStatus, ...otherBaseFields } = baseFieldsDefinition;

const reconciliationLogSchema = new Schema(
  {
    referenceNumber: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: ["wallet_balance", "order_settlement", "ledger_integrity", "full_system"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        "matched",
        "warning",
        "mismatch",
        "missing_ledger",
        "missing_wallet_entry",
        "missing_settlement",
      ],
      required: true,
      index: true,
    },
    walletId: { type: String, default: null, index: true },
    orderId: { type: String, default: null, index: true },
    walletBalanceCents: { type: Number, default: 0 },
    computedLedgerBalanceCents: { type: Number, default: 0 },
    differenceCents: { type: Number, default: 0 },
    notes: { type: String, default: null },
    details: { type: Schema.Types.Mixed, default: {} },
    reconciledBy: { type: String, required: true, default: "system" },
    reconciledAt: { type: Date, required: true, default: Date.now, index: true },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "reconciliation_logs" },
);

reconciliationLogSchema.index({ status: 1, createdAt: -1 });

export const ReconciliationLogModel =
  mongoose.models.ReconciliationLog || mongoose.model("ReconciliationLog", reconciliationLogSchema);
export default ReconciliationLogModel;
