import { BaseDBEntity } from "@/lib/database/types";

export type WorkspaceStatus = "active" | "suspended" | "archived";

export interface WorkspaceSettings {
  language?: string;
  timezone?: string;
  currency?: string;
  autoApproval?: boolean;
  orderNotifications?: boolean;
  marketingEmails?: boolean;
  smsNotifications?: boolean;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  inApp: boolean;
  orderUpdates: boolean;
  marketing: boolean;
  security: boolean;
}

export interface BusinessWorkspace extends BaseDBEntity {
  businessProfileId: string;
  userId: string;
  walletId?: string | null;
  settings?: WorkspaceSettings;
  notificationPreferences?: NotificationPreferences;
  analyticsProfileId?: string | null;
  status: WorkspaceStatus;
}

export default BusinessWorkspace;
