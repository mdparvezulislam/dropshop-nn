import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";

const { status: baseStatus, ...otherBaseFields } = baseFieldsDefinition;

const platformSecretSchema = new Schema(
  {
    provider: { type: String, required: true, index: true },
    secretType: { type: String, required: true, index: true },
    displayName: { type: String, required: true },
    description: { type: String },
    encryptedValue: { type: String, required: true },
    iv: { type: String, required: true },
    authTag: { type: String, required: true },
    maskedValue: { type: String, required: true },
    version: { type: Number, required: true, default: 1 },
    status: { type: String, required: true, default: "active", index: true },
    currentVersion: { type: Number, required: true, default: 1 },
    previousVersion: { type: Number },
    rollbackVersion: { type: Number },
    previousEncryptedValue: { type: String },
    previousIv: { type: String },
    previousAuthTag: { type: String },
    lastUsedAt: { type: Date },
    rotatedAt: { type: Date },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "platform_secrets" },
);

const secretAuditLogSchema = new Schema(
  {
    secretId: { type: String, required: true, index: true },
    provider: { type: String, required: true },
    secretType: { type: String, required: true },
    action: { type: String, required: true, index: true },
    performedBy: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now, index: true },
    ipAddress: { type: String },
    details: { type: String },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "secret_audit_logs" },
);

const secretFailedAccessLogSchema = new Schema(
  {
    secretId: { type: String, index: true },
    provider: { type: String },
    failureReason: { type: String, required: true, index: true },
    attemptedBy: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now, index: true },
    ipAddress: { type: String },
    errorMessage: { type: String },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "secret_failed_access_logs" },
);

export const PlatformSecretModel =
  mongoose.models.PlatformSecret || mongoose.model("PlatformSecret", platformSecretSchema);

export const SecretAuditLogModel =
  mongoose.models.SecretAuditLog || mongoose.model("SecretAuditLog", secretAuditLogSchema);

export const SecretFailedAccessLogModel =
  mongoose.models.SecretFailedAccessLog || mongoose.model("SecretFailedAccessLog", secretFailedAccessLogSchema);
