"use client";

import { Warehouse } from "lucide-react";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { WORKSPACE_SHELLS } from "@/components/workspace/workspace-registry";

export function WholesaleLayoutClient({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <WorkspaceLayout
      config={WORKSPACE_SHELLS.wholesale}
      workspaceIcon={<Warehouse className="h-4 w-4" />}
      userMenuItems={[
        { label: "Account", href: "/account" },
        { label: "Settings", href: "/wholesale/settings" },
        { label: "Switch workspace", href: "/dashboard" },
        { label: "Sign out", destructive: true },
      ]}
    >
      {children}
    </WorkspaceLayout>
  );
}
