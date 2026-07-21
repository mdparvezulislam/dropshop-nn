import type { Metadata } from "next";
import { NotificationsOverview } from "@/features/notification/components/notifications-overview";

export const metadata: Metadata = {
  title: "Notifications - DropshopNN",
  robots: { index: false },
};

export default function NotificationsPage() {
  return <NotificationsOverview />;
}
