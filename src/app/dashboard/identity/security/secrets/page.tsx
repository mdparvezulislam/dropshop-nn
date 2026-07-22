import type { Metadata } from "next";
import { SecretManagerUI } from "@/features/security/components/SecretManagerUI";

export const metadata: Metadata = {
  title: "Secrets Management - DropshopNN",
  robots: { index: false },
};

export default function SecretsManagementPage() {
  return <SecretManagerUI />;
}
