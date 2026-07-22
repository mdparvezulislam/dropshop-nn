import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/shared/lib/database/base-schema";

const { status: baseStatus, ...otherBaseFields } = baseFieldsDefinition;

const financeAuditLogSchema = new Schema(
  {
    referenceNumber: { type: String, default: null, index: true },
    action: {
      type: String,
      enum: [
        "wallet_created",
        "wallet_credited",
        "wallet_debited",
        "withdrawal_requested",
        "withdrawal_approved",
        "withdrawal_rejected",
        "withdrawal_paid",
        "withdrawal_cancelled",
        "withdrawal_held",
        "deposit_requested",
        "deposit_approved",
        "deposit_rejected",
        "order_settled",
        "refund_processed",
        "commission_paid",
        "manual_adjustment",
      ],
      required: true,
      index: true,
    },
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet", required: true, index: true },
    actorId: { type: String, required: true, index: true },
    actorRole: { type: String, default: null },
    actorName: { type: String, default: null },
    amount: { type: Number, required: true },
    oldBalance: { type: Number, required: true },
    newBalance: { type: Number, required: true },
    currency: { type: String, required: true, default: "BDT" },
    reason: { type: String, required: true },
    internalNotes: { type: String, default: null },
    ip: { type: String, default: null },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "finance_audit_logs" },
);

financeAuditLogSchema.index({ walletId: 1, createdAt: -1 });
financeAuditLogSchema.index({ actorId: 1, createdAt: -1 });

export const FinanceAuditLogModel =
  mongoose.models.FinanceAuditLog || mongoose.model("FinanceAuditLog", financeAuditLogSchema);
export default FinanceAuditLogModel;
