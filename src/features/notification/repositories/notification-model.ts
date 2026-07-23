import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/lib/database/base-schema";
import type { BaseDocument } from "@/lib/database/types";

const { status: _, metadata: __, ...baseFields } = baseFieldsDefinition;

const attemptSchema = new Schema(
  {
    id: { type: String, required: true },
    channel: { type: String, required: true },
    status: { type: String, required: true },
    provider: { type: String },
    providerMessageId: { type: String },
    error: { type: String },
    attemptedAt: { type: Date, required: true },
    completedAt: { type: Date },
  },
  { _id: false },
);

const notificationSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    recipientEmail: { type: String },
    recipientPhone: { type: String },
    category: { type: String, required: true, index: true },
    type: { type: String, required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    channels: [{ type: String }],
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: [
        "queued",
        "sending",
        "delivered",
        "failed",
        "retrying",
        "cancelled",
        "expired",
        "read",
        "archived",
      ],
      default: "queued",
      index: true,
    },
    templateKey: { type: String },
    variables: { type: Schema.Types.Mixed, default: {} },
    data: { type: Schema.Types.Mixed, default: {} },
    href: { type: String },
    entityType: { type: String },
    entityId: { type: String, index: true },
    attempts: { type: [attemptSchema], default: [] },
    scheduledAt: { type: Date, default: null },
    sentAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    readAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
    isRead: { type: Boolean, default: false, index: true },
    isArchived: { type: Boolean, default: false, index: true },
    ...baseFields,
  },
  { ...baseSchemaOptions, collection: "notifications" },
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1, isArchived: 1 });
notificationSchema.index({ status: 1, scheduledAt: 1 });

notificationSchema.plugin(softDeletePlugin);

export type NotificationMongoDocument = BaseDocument & {
  userId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  category: string;
  type: string;
  title: string;
  body: string;
  channels: string[];
  priority: string;
  status: string;
  templateKey?: string;
  variables: Record<string, unknown>;
  data: Record<string, unknown>;
  href?: string;
  entityType?: string;
  entityId?: string;
  attempts: unknown[];
  scheduledAt?: Date | null;
  sentAt?: Date | null;
  deliveredAt?: Date | null;
  readAt?: Date | null;
  expiresAt?: Date | null;
  retryCount: number;
  maxRetries: number;
  isRead: boolean;
  isArchived: boolean;
};

export const NotificationModel =
  mongoose.models.NotificationMessage ||
  mongoose.model<NotificationMongoDocument>("NotificationMessage", notificationSchema);

export default NotificationModel;
