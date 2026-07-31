import type { Metadata } from "next";
import { ScheduleManager } from "@/features/automation/components/schedule-manager";

export const metadata: Metadata = {
  title: "Schedules - Automation - NN Enterprise",
  robots: { index: false },
};

export default function SchedulesPage() {
  return <ScheduleManager />;
}
