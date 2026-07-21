import type { Metadata } from "next";
import { ApprovalsQueue } from "@/features/identity/components/approvals-queue";

export const metadata: Metadata = {
  title: "Approvals - DropshopNN",
  robots: { index: false },
};

export default function ApprovalsPage() {
  return <ApprovalsQueue />;
}
