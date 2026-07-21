import type { Metadata } from "next";
import { SessionsAdmin } from "@/features/identity/components/sessions-admin";

export const metadata: Metadata = {
  title: "Sessions - DropshopNN",
  robots: { index: false },
};

export default function SessionsPage() {
  return <SessionsAdmin />;
}
