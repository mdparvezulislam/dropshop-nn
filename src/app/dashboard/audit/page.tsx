import type { Metadata } from "next";
import { AuditCenter } from "@/features/identity/components/audit-center";

export const metadata: Metadata = {
  title: "Audit Center - NN Enterprise",
  robots: { index: false },
};

export default function AuditPage() {
  return <AuditCenter />;
}
