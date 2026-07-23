import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";

const { status: baseStatus, ...otherBaseFields } = baseFieldsDefinition;

const depositSchema = new Schema(
  {
    referenceNumber: { type: String, required: true, unique: true, index: true },
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet", required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, required: true, default: "BDT" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled", "completed"],
      required: true,
      default: "pending",
      index: true,
    },
    method: {
      type: String,
      enum: ["bkash", "nagad", "rocket", "upay", "bank", "manual", "admin_credit"],
      required: true,
      index: true,
    },
    paymentReference: { type: String, default: null, index: true },
    receiptUrl: { type: String, default: null },
    notes: { type: String, default: null },
    approvedBy: { type: String, default: null },
    approvedAt: { type: Date, default: null },
    rejectedBy: { type: String, default: null },
    rejectedAt: { type: Date, default: null },
    rejectReason: { type: String, default: null },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "deposit_requests" },
);

depositSchema.index({ walletId: 1, status: 1, createdAt: -1 });

export const DepositModel =
  mongoose.models.Deposit || mongoose.model("Deposit", depositSchema);
export default DepositModel;
