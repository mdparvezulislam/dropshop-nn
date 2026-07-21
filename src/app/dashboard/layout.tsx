"use client";

import { LayoutDashboard } from "lucide-react";
import { WorkspaceLayout } from "@/shared/components/workspace/workspace-layout";
import { WORKSPACE_SHELLS } from "@/shared/components/workspace/workspace-registry";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <WorkspaceLayout
      config={WORKSPACE_SHELLS.admin}
      workspaceIcon={<LayoutDashboard className="h-4 w-4" />}
    >
      {children}
    </WorkspaceLayout>
  );
}
