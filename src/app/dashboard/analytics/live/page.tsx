import type { Metadata } from "next";
import { LiveDashboard } from "@/features/analytics/components/live-dashboard";

export const metadata: Metadata = {
  title: "Live Dashboard - DropshopNN",
  robots: { index: false },
};

export default function LiveDashboardPage() {
  return <LiveDashboard />;
}
