import type { Metadata } from "next";
import { DeliveryLogs } from "@/features/notification/components/delivery-logs";

export const metadata: Metadata = {
  title: "Delivery Logs - DropshopNN",
  robots: { index: false },
};

export default function NotificationLogsPage() {
  return <DeliveryLogs />;
}
