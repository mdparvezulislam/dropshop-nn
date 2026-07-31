import type { Metadata } from "next";
import { TemplatesManager } from "@/features/notification/components/templates-manager";

export const metadata: Metadata = {
  title: "Notification Templates - NN Enterprise",
  robots: { index: false },
};

export default function NotificationTemplatesPage() {
  return <TemplatesManager />;
}
