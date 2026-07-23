import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";

const { status: baseStatus, ...otherBaseFields } = baseFieldsDefinition;

const platformSettingSchema = new Schema(
  {
    category: { type: String, required: true, index: true },
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
    dataType: { type: String, required: true, default: "string" },
    name: { type: String, required: true },
    description: { type: String },
    scope: { type: String, required: true, default: "global" },
    defaultValue: { type: Schema.Types.Mixed },
    isPublic: { type: Boolean, default: false },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "platform_settings" },
);

const featureFlagSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    state: { type: String, required: true, default: "off" },
    allowedRoles: [{ type: String }],
    isExperimental: { type: Boolean, default: false },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "feature_flags" },
);

const settingAuditLogSchema = new Schema(
  {
    settingKey: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    changedBy: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    reason: { type: String },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "setting_audit_logs" },
);

export const PlatformSettingModel =
  mongoose.models.PlatformSetting || mongoose.model("PlatformSetting", platformSettingSchema);

export const FeatureFlagModel =
  mongoose.models.FeatureFlag || mongoose.model("FeatureFlag", featureFlagSchema);

export const SettingAuditLogModel =
  mongoose.models.SettingAuditLog || mongoose.model("SettingAuditLog", settingAuditLogSchema);
