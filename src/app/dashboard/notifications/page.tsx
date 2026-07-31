import type { Metadata } from "next";
import { NotificationsOverview } from "@/features/notification/components/notifications-overview";

export const metadata: Metadata = {
  title: "Notifications - NN Enterprise",
  robots: { index: false },
};

export default function NotificationsPage() {
  return <NotificationsOverview />;
}
