import type { Metadata } from "next";
import { ReportCenter } from "@/features/analytics/components/report-center";

export const metadata: Metadata = {
  title: "Report Center - DropshopNN",
  robots: { index: false },
};

export default function ReportsPage() {
  return <ReportCenter />;
}
