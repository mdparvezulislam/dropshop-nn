import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/lib/database/base-schema";
import { BaseDocument } from "@/lib/database/types";
import type { AccountLockout } from "../domain/security-types";

export interface AccountLockoutDBFields {
  userId: string;
  type: string;
  reason: string;
  lockedAt: Date;
  unlockedAt?: Date | null;
  unlocksAt?: Date | null;
  lockedBy?: string | null;
  unlockedBy?: string | null;
  notes?: string;
}

export type AccountLockoutDocument = BaseDocument & AccountLockoutDBFields;

const accountLockoutSchema = new Schema<AccountLockoutDocument>(
  {
    userId: { type: String, required: true, index: true, unique: true },
    type: {
      type: String,
      required: true,
      enum: ["temporary", "permanent"],
      index: true,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        "max_failed_attempts",
        "manual_lock",
        "suspicious_activity",
        "admin_action",
        "verification_failed",
      ],
      index: true,
    },
    lockedAt: { type: Date, required: true, default: Date.now, index: true },
    unlockedAt: { type: Date, default: null, required: false },
    unlocksAt: { type: Date, default: null, required: false, index: true },
    lockedBy: { type: String, default: null, required: false },
    unlockedBy: { type: String, default: null, required: false },
    notes: { type: String, default: null, required: false },
    ...baseFieldsDefinition,
  },
  baseSchemaOptions,
);

accountLockoutSchema.plugin(softDeletePlugin);

// Compound indexes for common queries
accountLockoutSchema.index({ userId: 1 });
accountLockoutSchema.index({ type: 1, lockedAt: -1 });
accountLockoutSchema.index({ unlocksAt: 1 });
accountLockoutSchema.index({ reason: 1 });

export const AccountLockoutModel =
  mongoose.models.AccountLockout ||
  mongoose.model<AccountLockoutDocument>("AccountLockout", accountLockoutSchema);

export default AccountLockoutModel;
