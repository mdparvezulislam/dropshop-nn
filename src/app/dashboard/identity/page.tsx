import type { Metadata } from "next";
import { IdentityOverview } from "@/features/identity/components/identity-overview";

export const metadata: Metadata = {
  title: "Identity - DropshopNN",
  robots: { index: false },
};

export default function IdentityPage() {
  return <IdentityOverview />;
}
