"use client";

import * as React from "react";
import { Store } from "lucide-react";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { WORKSPACE_SHELLS } from "@/components/workspace/workspace-registry";
import { ResellerHeader } from "@/features/reseller-workspace/components/reseller-header";
import { ResellerMobileBottomNav } from "@/features/reseller-workspace/components/reseller-mobile-bottom-nav";
import { ResellerGlobalSearchModal } from "@/features/reseller-workspace/components/reseller-global-search-modal";

export function ResellerLayoutClient({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16 lg:pb-0">
      {/* Mobile Top Header */}
      <ResellerHeader onSearchOpen={() => setSearchOpen(true)} />

      <WorkspaceLayout
        config={WORKSPACE_SHELLS.reseller}
        workspaceIcon={<Store className="h-4 w-4" />}
        userMenuItems={[
          { label: "Account", href: "/account" },
          { label: "Shop Settings", href: "/reseller/settings" },
          { label: "Notifications", href: "/reseller/notifications" },
          { label: "Support Center", href: "/reseller/support" },
          { label: "Switch workspace", href: "/dashboard" },
          { label: "Sign out", destructive: true },
        ]}
      >
        {children}
      </WorkspaceLayout>
      <ResellerMobileBottomNav />
      <ResellerGlobalSearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
