import type { Metadata } from "next";
import { UsersAdmin } from "@/features/identity/components/users-admin";

export const metadata: Metadata = {
  title: "Users - DropshopNN",
  robots: { index: false },
};

export default function UsersPage() {
  return <UsersAdmin />;
}
