import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/shared/lib/database/base-schema";
import type { BaseDocument } from "@/shared/lib/database/types";

export interface NotificationPrefDBFields {
  userId: string;
  orderUpdates: boolean;
  marketingMessages: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
}

export type NotificationPrefDocument = BaseDocument & NotificationPrefDBFields;

const { status: _, ...prefBaseFields } = baseFieldsDefinition;

const notificationPrefSchema = new Schema<NotificationPrefDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    orderUpdates: { type: Boolean, required: true, default: true },
    marketingMessages: { type: Boolean, required: true, default: false },
    emailNotifications: { type: Boolean, required: true, default: true },
    smsNotifications: { type: Boolean, required: true, default: false },
    pushNotifications: { type: Boolean, required: true, default: true },
    ...prefBaseFields,
  },
  { ...baseSchemaOptions, collection: "user_notification_preferences" },
);

export const UserNotificationPreferenceModel =
  mongoose.models.UserNotificationPreference ||
  mongoose.model<NotificationPrefDocument>("UserNotificationPreference", notificationPrefSchema);
export default UserNotificationPreferenceModel;
