import type { Metadata } from "next";
import { SecretManagerUI } from "@/features/security/components/SecretManagerUI";

export const metadata: Metadata = {
  title: "Secrets Management - NN Enterprise",
  robots: { index: false },
};

export default function SecretsManagementPage() {
  return <SecretManagerUI />;
}
