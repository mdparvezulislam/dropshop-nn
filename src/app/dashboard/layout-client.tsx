"use client";

import { LayoutDashboard } from "lucide-react";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { WORKSPACE_SHELLS } from "@/components/workspace/workspace-registry";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminMobileBottomNav } from "@/components/admin/admin-mobile-bottom-nav";

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16 lg:pb-0">
      {/* Mobile Top Operations Header */}
      <AdminHeader />

      <WorkspaceLayout
        config={WORKSPACE_SHELLS.admin}
        workspaceIcon={<LayoutDashboard className="h-4 w-4" />}
      >
        {children}
      </WorkspaceLayout>

      {/* Dedicated Admin Mobile Bottom Navigation */}
      <AdminMobileBottomNav />
    </div>
  );
}
