import type { Metadata } from "next";
import { auth } from "@/shared/lib/auth";
import { getRoleApplicationStatusAction } from "@/features/identity/actions/account-actions";
import { RolePageContent } from "./role-content";

export const metadata: Metadata = {
  title: "Role & Permissions - DropshopNN",
  robots: { index: false },
};

export default async function RolePage() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  const currentRole = user?.role || "customer";

  const applicationsResult = await getRoleApplicationStatusAction();

  return (
    <RolePageContent
      currentRole={currentRole}
      applications={applicationsResult.success ? applicationsResult.data ?? [] : []}
    />
  );
}
