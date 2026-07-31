import type { Metadata } from "next";
import { LiveDashboard } from "@/features/analytics/components/live-dashboard";

export const metadata: Metadata = {
  title: "Live Dashboard - NN Enterprise",
  robots: { index: false },
};

export default function LiveDashboardPage() {
  return <LiveDashboard />;
}
