"use client";

import { Store } from "lucide-react";
import { WorkspaceLayout } from "@/shared/components/workspace/workspace-layout";
import { WORKSPACE_SHELLS } from "@/shared/components/workspace/workspace-registry";

export default function ResellerLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <WorkspaceLayout
      config={WORKSPACE_SHELLS.reseller}
      workspaceIcon={<Store className="h-4 w-4" />}
      userMenuItems={[
        { label: "Account", href: "/account" },
        { label: "Settings", href: "/reseller/settings" },
        { label: "Switch workspace", href: "/dashboard" },
        { label: "Sign out", destructive: true },
      ]}
    >
      {children}
    </WorkspaceLayout>
  );
}
