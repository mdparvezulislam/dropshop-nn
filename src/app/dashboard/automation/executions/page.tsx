import type { Metadata } from "next";
import { ExecutionHistory } from "@/features/automation/components/execution-history";

export const metadata: Metadata = {
  title: "Execution History - Automation - NN Enterprise",
  robots: { index: false },
};

export default function ExecutionsPage() {
  return <ExecutionHistory />;
}
