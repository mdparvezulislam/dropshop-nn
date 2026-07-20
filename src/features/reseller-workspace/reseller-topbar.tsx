"use client";

import * as React from "react";
import { Topbar } from "@/shared/components/workspace/topbar";
import { getResellerBreadcrumbs } from "./nav-config";

export interface ResellerTopbarProps {
  onMenuClick: () => void;
  onCommandOpen: () => void;
  collapsed: boolean;
}

export function ResellerTopbar(props: ResellerTopbarProps): React.ReactElement {
  return (
    <Topbar
      {...props}
      getBreadcrumbsFn={getResellerBreadcrumbs}
      searchPlaceholder="Search reseller workspace…"
      avatarFallback="RS"
      userLabel="My Shop"
      userEmail="reseller@dropshop.nn"
      showQuickAction={false}
      userMenuItems={[
        { label: "Settings", href: "/reseller/settings" },
        { label: "Switch to Admin", href: "/dashboard" },
      ]}
    />
  );
}

export default ResellerTopbar;
