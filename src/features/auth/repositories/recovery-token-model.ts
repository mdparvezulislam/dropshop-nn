import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/lib/database/base-schema";
import { BaseDocument } from "@/lib/database/types";
import type { RecoveryToken } from "../domain/security-types";

export interface RecoveryTokenDBFields {
  userId: string;
  email: string;
  token: string; // Raw token (for display in emails)
  tokenHash: string; // Hashed token (for verification)
  type: string;
  status: string;
  expiresAt: Date;
  usedAt?: Date | null;
  usedByIp?: string;
  usedByUserAgent?: string;
  metadata?: Record<string, unknown>;
}

export type RecoveryTokenDocument = BaseDocument & RecoveryTokenDBFields;

const { status: baseStatus, ...otherBaseFields } = baseFieldsDefinition;

const recoveryTokenSchema = new Schema<RecoveryTokenDocument>(
  {
    userId: { type: String, required: true, index: true },
    email: { type: String, required: true, index: true },
    token: { type: String, required: true, unique: true },
    tokenHash: { type: String, required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ["password_reset", "email_verification", "phone_verification", "account_recovery"],
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "used", "expired", "revoked"],
      default: "pending",
      index: true,
    },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date, default: null, required: false },
    usedByIp: { type: String, default: null, required: false },
    usedByUserAgent: { type: String, default: null, required: false },
    ...otherBaseFields,
  },
  baseSchemaOptions,
);

recoveryTokenSchema.plugin(softDeletePlugin);

// Compound indexes for common queries
recoveryTokenSchema.index({ userId: 1, type: 1, status: 1 });
recoveryTokenSchema.index({ tokenHash: 1 });
recoveryTokenSchema.index({ expiresAt: 1 });
recoveryTokenSchema.index({ status: 1, createdAt: -1 });
recoveryTokenSchema.index({ email: 1, type: 1 });

export const RecoveryTokenModel =
  mongoose.models.RecoveryToken ||
  mongoose.model<RecoveryTokenDocument>("RecoveryToken", recoveryTokenSchema);

export default RecoveryTokenModel;
