import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/shared/lib/database/base-schema";
import { BaseDocument } from "@/shared/lib/database/types";
import type { SecurityEvent } from "../domain/security-types";

export interface SecurityEventDBFields {
  userId?: string | null;
  eventType: string;
  severity: string;
  title: string;
  description?: string;
  metadata: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: {
    type?: string;
    os?: string;
    browser?: string;
  };
  resolved: boolean;
  resolvedAt?: Date | null;
  resolvedBy?: string | null;
  resolvedNotes?: string;
}

export type SecurityEventDocument = BaseDocument & SecurityEventDBFields;

const { status: baseStatus, ...otherBaseFields } = baseFieldsDefinition;

const securityEventSchema = new Schema<SecurityEventDocument>(
  {
    userId: { type: String, default: null, required: false, index: true },
    eventType: {
      type: String,
      required: true,
      enum: [
        "login_success",
        "login_failed",
        "login_locked_out",
        "password_changed",
        "password_reset_requested",
        "password_reset_completed",
        "account_locked",
        "account_unlocked",
        "account_suspended",
        "account_reactivated",
        "account_deleted",
        "new_device_detected",
        "device_trusted",
        "device_untrusted",
        "session_created",
        "session_terminated",
        "session_expired",
        "multiple_sessions_detected",
        "role_changed",
        "permission_changed",
        "verification_sent",
        "verification_completed",
        "suspicious_activity",
        "rate_limit_exceeded",
        "brute_force_detected",
      ],
      index: true,
    },
    severity: {
      type: String,
      required: true,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: null, required: false },
    ipAddress: { type: String, default: null, required: false, index: true },
    userAgent: { type: String, default: null, required: false },
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
    resolved: { type: Boolean, default: false, required: true, index: true },
    resolvedAt: { type: Date, default: null, required: false },
    resolvedBy: { type: String, default: null, required: false },
    resolvedNotes: { type: String, default: null, required: false },
    ...otherBaseFields,
  },
  baseSchemaOptions,
);

securityEventSchema.plugin(softDeletePlugin);

// Compound indexes for common queries
securityEventSchema.index({ userId: 1, eventType: 1, createdAt: -1 });
securityEventSchema.index({ severity: 1, createdAt: -1 });
securityEventSchema.index({ resolved: 1, createdAt: -1 });
securityEventSchema.index({ createdAt: -1 });
securityEventSchema.index({ eventType: 1, createdAt: -1 });

export const SecurityEventModel =
  mongoose.models.SecurityEvent ||
  mongoose.model<SecurityEventDocument>("SecurityEvent", securityEventSchema);

export default SecurityEventModel;
