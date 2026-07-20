import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/shared/lib/database/base-schema";

const { status: baseStatus, ...otherBaseFields } = baseFieldsDefinition;

const ledgerEntrySchema = new Schema(
  {
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet", required: true, index: true },
    amount: { type: Number, required: true }, // Credit (+), Debit (-) in cents
    type: {
      type: String,
      enum: [
        "opening_balance",
        "profit_credit",
        "manual_credit",
        "manual_debit",
        "withdrawal_request",
        "withdrawal_approved",
        "withdrawal_rejected",
        "withdrawal_paid",
        "refund",
        "commission",
        "settlement",
        "adjustment",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "cleared", "locked", "cancelled"],
      required: true,
      default: "pending",
    },
    referenceType: { type: String, enum: ["order", "withdrawal", "settlement", "manual"], default: null },
    referenceId: { type: String, default: null },
    clearsAt: { type: Date, default: null, index: true },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "ledger_entries" },
);

// Compound index to speed up derived balance calculations
ledgerEntrySchema.index({ walletId: 1, status: 1, clearsAt: 1 });

export const LedgerEntryModel =
  mongoose.models.LedgerEntry || mongoose.model("LedgerEntry", ledgerEntrySchema);
export default LedgerEntryModel;
