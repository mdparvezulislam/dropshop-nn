"use client";

import { WorkspaceLayout } from "@/shared/components/workspace/workspace-layout";
import { WholesaleTopbar } from "@/features/wholesale-workspace/wholesale-topbar";
import { WHOLESALE_NAV } from "@/features/wholesale-workspace/nav-config";
import { Warehouse } from "lucide-react";

export default function WholesaleLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <WorkspaceLayout
      nav={WHOLESALE_NAV}
      workspaceLabel="Wholesale"
      workspaceIcon={<Warehouse className="h-4 w-4" />}
      topbar={WholesaleTopbar}
    >
      {children}
    </WorkspaceLayout>
  );
}
