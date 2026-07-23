import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/lib/database/base-schema";
import { BaseDocument } from "@/lib/database/types";
import type { FailedLoginAttempt } from "../domain/security-types";

export interface FailedLoginDBFields {
  identifier: string; // Email, username, or phone
  ipAddress: string;
  userAgent: string;
  deviceInfo?: {
    type?: string;
    os?: string;
    browser?: string;
  };
  reason: string;
  attemptCount: number;
  lastAttemptAt: Date;
  resolvedAt?: Date | null;
  resolvedBy?: string | null;
}

export type FailedLoginDocument = BaseDocument & FailedLoginDBFields;

const failedLoginSchema = new Schema<FailedLoginDocument>(
  {
    identifier: { type: String, required: true, index: true },
    ipAddress: { type: String, required: true, index: true },
    userAgent: { type: String, required: true },
    deviceInfo: {
      type: {
        type: String,
        enum: ["desktop", "mobile", "tablet", "unknown"],
        default: "unknown",
      },
      os: {
        type: String,
        enum: ["windows", "macos", "linux", "ios", "android", "unknown"],
        default: "unknown",
      },
      browser: {
        type: String,
        enum: ["chrome", "firefox", "safari", "edge", "opera", "unknown"],
        default: "unknown",
      },
    },
    reason: {
      type: String,
      required: true,
      enum: [
        "invalid_credentials",
        "account_locked",
        "account_suspended",
        "account_not_found",
        "rate_limited",
        "verification_required",
        "unknown",
      ],
      index: true,
    },
    attemptCount: { type: Number, required: true, default: 1, min: 1 },
    lastAttemptAt: { type: Date, required: true, default: Date.now, index: true },
    resolvedAt: { type: Date, default: null, required: false },
    resolvedBy: { type: String, default: null, required: false },
    ...baseFieldsDefinition,
  },
  baseSchemaOptions,
);

failedLoginSchema.plugin(softDeletePlugin);

// Compound indexes for common queries
failedLoginSchema.index({ identifier: 1, ipAddress: 1, lastAttemptAt: -1 });
failedLoginSchema.index({ lastAttemptAt: -1 });
failedLoginSchema.index({ resolvedAt: 1 });
failedLoginSchema.index({ reason: 1, lastAttemptAt: -1 });

export const FailedLoginModel =
  mongoose.models.FailedLogin ||
  mongoose.model<FailedLoginDocument>("FailedLogin", failedLoginSchema);

export default FailedLoginModel;
