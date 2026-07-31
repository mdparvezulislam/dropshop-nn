import type { Metadata } from "next";
import { AnalyticsDashboard } from "@/features/analytics/components/analytics-dashboard";

export const metadata: Metadata = {
  title: "Analytics - NN Enterprise",
  robots: { index: false },
};

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
