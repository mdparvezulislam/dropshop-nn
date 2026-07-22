import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/shared/lib/database/base-schema";
import { BaseDocument } from "@/shared/lib/database/types";
import type { TrustedDevice } from "../domain/security-types";

export interface TrustedDeviceDBFields {
  userId: string;
  deviceId: string;
  deviceInfo: {
    type: string;
    os: string;
    browser: string;
    userAgent: string;
    ipAddress: string;
    location?: {
      country?: string;
      city?: string;
      timezone?: string;
    };
  };
  name?: string;
  isTrusted: boolean;
  lastUsedAt: Date;
  expiresAt?: Date | null;
  autoTrusted: boolean;
}

export type TrustedDeviceDocument = BaseDocument & TrustedDeviceDBFields;

const trustedDeviceSchema = new Schema<TrustedDeviceDocument>(
  {
    userId: { type: String, required: true, index: true },
    deviceId: { type: String, required: true, unique: true, index: true },
    deviceInfo: {
      type: {
        type: String,
        enum: ["desktop", "mobile", "tablet", "unknown"],
        default: "unknown",
        required: true,
      },
      os: {
        type: String,
        enum: ["windows", "macos", "linux", "ios", "android", "unknown"],
        default: "unknown",
        required: true,
      },
      browser: {
        type: String,
        enum: ["chrome", "firefox", "safari", "edge", "opera", "unknown"],
        default: "unknown",
        required: true,
      },
      userAgent: { type: String, required: true },
      ipAddress: { type: String, required: true, index: true },
      location: {
        country: { type: String, default: null, required: false },
        city: { type: String, default: null, required: false },
        timezone: { type: String, default: null, required: false },
      },
    },
    name: { type: String, default: null, required: false },
    isTrusted: { type: Boolean, default: true, required: true, index: true },
    lastUsedAt: { type: Date, required: true, default: Date.now, index: true },
    expiresAt: { type: Date, default: null, required: false, index: true },
    autoTrusted: { type: Boolean, default: false, required: true, index: true },
    ...baseFieldsDefinition,
  },
  baseSchemaOptions,
);

trustedDeviceSchema.plugin(softDeletePlugin);

// Compound indexes for common queries
trustedDeviceSchema.index({ userId: 1, deviceId: 1 });
trustedDeviceSchema.index({ userId: 1, isTrusted: 1 });
trustedDeviceSchema.index({ userId: 1, lastUsedAt: -1 });
trustedDeviceSchema.index({ "deviceInfo.ipAddress": 1 });

export const TrustedDeviceModel =
  mongoose.models.TrustedDevice ||
  mongoose.model<TrustedDeviceDocument>("TrustedDevice", trustedDeviceSchema);

export default TrustedDeviceModel;
