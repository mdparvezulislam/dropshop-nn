import type { Metadata } from "next";
import { getNotificationPreferencesAction } from "@/features/identity/actions/account-actions";
import { NotificationsPageContent } from "./notifications-content";

export const metadata: Metadata = {
  title: "Notifications - DropshopNN",
  robots: { index: false },
};

export default async function NotificationsPage() {
  const result = await getNotificationPreferencesAction();
  return (
    <NotificationsPageContent
      initialPrefs={
        result.success
          ? (result.data ?? {
              orderUpdates: true,
              marketingMessages: false,
              emailNotifications: true,
              smsNotifications: false,
              pushNotifications: true,
            })
          : {
              orderUpdates: true,
              marketingMessages: false,
              emailNotifications: true,
              smsNotifications: false,
              pushNotifications: true,
            }
      }
    />
  );
}
