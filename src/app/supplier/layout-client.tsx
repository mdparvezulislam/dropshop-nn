"use client";

import { Building2 } from "lucide-react";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { WORKSPACE_SHELLS } from "@/components/workspace/workspace-registry";

export function SupplierLayoutClient({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <WorkspaceLayout
      config={WORKSPACE_SHELLS.supplier}
      workspaceIcon={<Building2 className="h-4 w-4" />}
      userMenuItems={[
        { label: "Account", href: "/account" },
        { label: "Settings", href: "/supplier/settings" },
        { label: "Switch workspace", href: "/dashboard" },
        { label: "Sign out", destructive: true },
      ]}
    >
      {children}
    </WorkspaceLayout>
  );
}
