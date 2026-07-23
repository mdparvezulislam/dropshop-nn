import type { BaseDBEntity } from "@/lib/database/types";

export interface UserNotificationPreference extends BaseDBEntity {
  userId: string;
  orderUpdates: boolean;
  marketingMessages: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
}
