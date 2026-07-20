"use client";

import * as React from "react";
import { Topbar } from "@/shared/components/workspace/topbar";
import { getSupplierBreadcrumbs } from "./nav-config";

export interface SupplierTopbarProps {
  onMenuClick: () => void;
  onCommandOpen: () => void;
  collapsed: boolean;
}

export function SupplierTopbar(props: SupplierTopbarProps): React.ReactElement {
  return (
    <Topbar
      {...props}
      getBreadcrumbsFn={getSupplierBreadcrumbs}
      searchPlaceholder="Search supplier portal…"
      avatarFallback="SP"
      userLabel="Supplier Portal"
      userEmail="supplier@dropshop.nn"
      showQuickAction={false}
      userMenuItems={[
        { label: "Profile", href: "/supplier/profile" },
        { label: "Settings", href: "/supplier/settings" },
        { label: "Switch to Admin", href: "/dashboard" },
      ]}
    />
  );
}

export default SupplierTopbar;
