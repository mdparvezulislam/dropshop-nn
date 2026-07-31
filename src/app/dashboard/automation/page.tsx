import type { Metadata } from "next";
import { AutomationDashboard } from "@/features/automation/components/automation-dashboard";

export const metadata: Metadata = {
  title: "Automation Center - NN Enterprise",
  robots: { index: false },
};

export default function AutomationPage() {
  return <AutomationDashboard />;
}
