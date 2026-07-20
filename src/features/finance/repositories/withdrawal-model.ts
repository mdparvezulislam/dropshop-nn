import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/shared/lib/database/base-schema";

const { status: baseStatus, ...otherBaseFields } = baseFieldsDefinition;

const withdrawalSchema = new Schema(
  {
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet", required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
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
      ],
      required: true,
      default: "pending",
    },
    method: {
      type: String,
      enum: ["bkash", "nagad", "rocket", "bank", "manual"],
      required: true,
    },
    payoutDetails: {
      accountNumber: { type: String, required: true },
      accountName: { type: String, default: null },
      bankName: { type: String, default: null },
      branchName: { type: String, default: null },
      routingNumber: { type: String, default: null },
    },
    referenceNumber: { type: String, default: null },
    fee: { type: Number, default: 0 },
    reviewedBy: { type: String, default: null },
    reviewedAt: { type: Date, default: null },
    paidAt: { type: Date, default: null },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "withdrawals" },
);

export const WithdrawalModel =
  mongoose.models.Withdrawal || mongoose.model("Withdrawal", withdrawalSchema);
export default WithdrawalModel;
