import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/shared/lib/database/base-schema";

const { status, ...otherBaseFields } = baseFieldsDefinition;

const walletSchema = new Schema(
  {
    workspaceId: { type: String, required: true, unique: true, index: true },
    workspaceRole: {
      type: String,
      enum: ["reseller", "wholesaler", "admin", "supplier"],
      required: true,
    },
    currency: { type: String, required: true, default: "BDT" },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
      index: true,
    },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "wallets" },
);

export const WalletModel = mongoose.models.Wallet || mongoose.model("Wallet", walletSchema);
export default WalletModel;
