import type { Metadata } from "next";
import { getActiveSessionsAction } from "@/features/identity/actions/account-actions";
import { SecurityPageContent } from "./security-content";

export const metadata: Metadata = {
  title: "Security - DropshopNN",
  robots: { index: false },
};

export default async function SecurityPage() {
  const sessionsResult = await getActiveSessionsAction();
  return (
    <SecurityPageContent
      sessions={sessionsResult.success ? sessionsResult.data ?? [] : []}
    />
  );
}
