import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/shared/lib/database/base-schema";

const { status: baseStatus, ...otherBaseFields } = baseFieldsDefinition;

const ledgerEntrySchema = new Schema(
  {
    referenceNumber: { type: String, required: true, unique: true, index: true },
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet", required: true, index: true },
    workspaceId: { type: String, default: null, index: true },
    amount: { type: Number, required: true }, // Credit (+), Debit (-) in cents
    currency: { type: String, required: true, default: "BDT" },
    type: {
      type: String,
      enum: [
        "credit",
        "debit",
        "refund",
        "commission",
        "adjustment",
        "withdrawal",
        "deposit",
        "order_settlement",
        "charge",
        "bonus",
        "opening_balance",
        "profit_credit",
        "manual_credit",
        "manual_debit",
        "withdrawal_request",
        "withdrawal_approved",
        "withdrawal_rejected",
        "withdrawal_paid",
      ],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "cleared", "locked", "cancelled"],
      required: true,
      default: "pending",
      index: true,
    },
    sourceModule: {
      type: String,
      enum: [
        "order",
        "withdrawal",
        "deposit",
        "manual_adjustment",
        "commission",
        "refund",
        "settlement",
        "system",
      ],
      required: true,
      default: "system",
      index: true,
    },
    referenceType: {
      type: String,
      enum: ["order", "withdrawal", "deposit", "settlement", "manual"],
      default: null,
    },
    referenceId: { type: String, default: null, index: true },
    orderId: { type: String, default: null, index: true },
    description: { type: String, default: null },
    clearsAt: { type: Date, default: null, index: true },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "ledger_entries" },
);

// Compound indexes for balance aggregations, filtering, and search performance
ledgerEntrySchema.index({ walletId: 1, status: 1, clearsAt: 1 });
ledgerEntrySchema.index({ walletId: 1, type: 1, createdAt: -1 });
ledgerEntrySchema.index({ referenceType: 1, referenceId: 1 });
ledgerEntrySchema.index({ orderId: 1, type: 1 });

export const LedgerEntryModel =
  mongoose.models.LedgerEntry || mongoose.model("LedgerEntry", ledgerEntrySchema);
export default LedgerEntryModel;
