import type { Metadata } from "next";
import { RolesAdmin } from "@/features/identity/components/roles-admin";

export const metadata: Metadata = {
  title: "Roles - DropshopNN",
  robots: { index: false },
};

export default function RolesPage() {
  return <RolesAdmin />;
}
