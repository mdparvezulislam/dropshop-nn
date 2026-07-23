import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";

const { status, ...otherBaseFields } = baseFieldsDefinition;

const walletSchema = new Schema(
  {
    workspaceId: { type: String, required: true, unique: true, index: true },
    workspaceRole: {
      type: String,
      enum: [
        "customer",
        "reseller",
        "wholesaler",
        "admin",
        "supplier",
        "staff",
        "platform",
        "commission",
      ],
      required: true,
      index: true,
    },
    currency: { type: String, required: true, default: "BDT" },
    status: {
      type: String,
      enum: ["active", "suspended", "frozen"],
      default: "active",
      index: true,
    },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "wallets" },
);

walletSchema.index({ workspaceRole: 1, status: 1 });

export const WalletModel = mongoose.models.Wallet || mongoose.model("Wallet", walletSchema);
export default WalletModel;
