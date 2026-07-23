import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/lib/database/base-schema";
import type { BaseDocument } from "@/lib/database/types";

const { status: _, ...baseFields } = baseFieldsDefinition;

const templateSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true, index: true },
    description: { type: String },
    channels: [{ type: String }],
    subject: { type: String },
    emailBody: { type: String },
    smsBody: { type: String },
    inAppTitle: { type: String, required: true },
    inAppBody: { type: String, required: true },
    pushTitle: { type: String },
    pushBody: { type: String },
    defaultHref: { type: String },
    variables: [{ type: String }],
    isActive: { type: Boolean, default: true, index: true },
    locale: { type: String, default: "en" },
    ...baseFields,
  },
  { ...baseSchemaOptions, collection: "notification_templates" },
);

templateSchema.plugin(softDeletePlugin);

export type TemplateMongoDocument = BaseDocument & {
  key: string;
  name: string;
  category: string;
  description?: string;
  channels: string[];
  subject?: string;
  emailBody?: string;
  smsBody?: string;
  inAppTitle: string;
  inAppBody: string;
  pushTitle?: string;
  pushBody?: string;
  defaultHref?: string;
  variables: string[];
  isActive: boolean;
  locale: string;
};

export const NotificationTemplateModel =
  mongoose.models.NotificationTemplate ||
  mongoose.model<TemplateMongoDocument>("NotificationTemplate", templateSchema);

export default NotificationTemplateModel;
