import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";

const { status: baseStatus, ...otherBaseFields } = baseFieldsDefinition;

const withdrawalSchema = new Schema(
  {
    referenceNumber: { type: String, required: true, unique: true, index: true },
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet", required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, required: true, default: "BDT" },
    status: {
      type: String,
      enum: [
        "draft",
        "pending",
        "under_review",
        "approved",
        "paid",
        "completed",
        "rejected",
        "cancelled",
        "hold",
      ],
      required: true,
      default: "pending",
      index: true,
    },
    method: {
      type: String,
      enum: ["bkash", "nagad", "rocket", "upay", "bank", "binance_pay", "manual"],
      required: true,
      index: true,
    },
    payoutDetails: {
      accountNumber: { type: String, required: true },
      accountName: { type: String, default: null },
      bankName: { type: String, default: null },
      branchName: { type: String, default: null },
      routingNumber: { type: String, default: null },
      notes: { type: String, default: null },
    },
    transactionId: { type: String, default: null, index: true },
    fee: { type: Number, default: 0 },
    reviewedBy: { type: String, default: null },
    reviewedAt: { type: Date, default: null },
    paidAt: { type: Date, default: null },
    rejectReason: { type: String, default: null },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "withdrawals" },
);

withdrawalSchema.index({ walletId: 1, status: 1, createdAt: -1 });

export const WithdrawalModel =
  mongoose.models.Withdrawal || mongoose.model("Withdrawal", withdrawalSchema);
export default WithdrawalModel;
