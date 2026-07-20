import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/shared/lib/database/base-schema";
import { BaseDocument } from "@/shared/lib/database/types";

export interface WorkspaceSettingsDB {
  language?: string;
  timezone?: string;
  currency?: string;
  autoApproval?: boolean;
  orderNotifications?: boolean;
  marketingEmails?: boolean;
  smsNotifications?: boolean;
}

export interface NotificationPreferencesDB {
  email: boolean;
  sms: boolean;
  inApp: boolean;
  orderUpdates: boolean;
  marketing: boolean;
  security: boolean;
}

export interface BusinessWorkspaceDBFields {
  businessProfileId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  walletId?: string | null;
  settings?: WorkspaceSettingsDB;
  notificationPreferences?: NotificationPreferencesDB;
  analyticsProfileId?: string | null;
  status: string;
}

export type BusinessWorkspaceDocument = BaseDocument & BusinessWorkspaceDBFields;

const workspaceSettingsSchema = new Schema<WorkspaceSettingsDB>(
  {
    language: { type: String, default: "en" },
    timezone: { type: String, default: "Asia/Dhaka" },
    currency: { type: String, default: "BDT" },
    autoApproval: { type: Boolean, default: false },
    orderNotifications: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
  },
  { _id: false },
);

const notificationPreferencesSchema = new Schema<NotificationPreferencesDB>(
  {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    inApp: { type: Boolean, default: true },
    orderUpdates: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
    security: { type: Boolean, default: true },
  },
  { _id: false },
);

const { status: _, ...workspaceBaseFields } = baseFieldsDefinition;

const businessWorkspaceSchema = new Schema<BusinessWorkspaceDocument>(
  {
    businessProfileId: {
      type: Schema.Types.ObjectId,
      ref: "BusinessProfile",
      required: true,
      unique: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    walletId: { type: String, default: null, required: false },
    settings: { type: workspaceSettingsSchema, default: () => ({}) },
    notificationPreferences: {
      type: notificationPreferencesSchema,
      default: () => ({
        email: true,
        sms: false,
        inApp: true,
        orderUpdates: true,
        marketing: false,
        security: true,
      }),
    },
    analyticsProfileId: { type: String, default: null, required: false },
    status: {
      type: String,
      enum: ["active", "suspended", "archived"],
      default: "active",
      index: true,
    },
    ...workspaceBaseFields,
  },
  baseSchemaOptions,
);

businessWorkspaceSchema.plugin(softDeletePlugin);

export const BusinessWorkspaceModel =
  mongoose.models.BusinessWorkspace ||
  mongoose.model<BusinessWorkspaceDocument>("BusinessWorkspace", businessWorkspaceSchema);
export default BusinessWorkspaceModel;
