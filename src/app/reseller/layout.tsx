"use client";

import { WorkspaceLayout } from "@/shared/components/workspace/workspace-layout";
import { ResellerTopbar } from "@/features/reseller-workspace/reseller-topbar";
import { RESELLER_NAV } from "@/features/reseller-workspace/nav-config";
import { Store } from "lucide-react";

export default function ResellerLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <WorkspaceLayout
      nav={RESELLER_NAV}
      workspaceLabel="My Shop"
      workspaceIcon={<Store className="h-4 w-4" />}
      topbar={ResellerTopbar}
    >
      {children}
    </WorkspaceLayout>
  );
}
