import type { Metadata } from "next";
import { ExecutiveDashboard } from "@/features/analytics/components/executive-dashboard";

export const metadata: Metadata = {
  title: "Executive Dashboard - DropshopNN",
  robots: { index: false },
};

export default function ExecutiveDashboardPage() {
  return <ExecutiveDashboard />;
}
