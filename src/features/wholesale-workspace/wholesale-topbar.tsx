"use client";

import * as React from "react";
import { Topbar } from "@/shared/components/workspace/topbar";
import { getWholesaleBreadcrumbs } from "./nav-config";

export interface WholesaleTopbarProps {
  onMenuClick: () => void;
  onCommandOpen: () => void;
  collapsed: boolean;
}

export function WholesaleTopbar(props: WholesaleTopbarProps): React.ReactElement {
  return (
    <Topbar
      {...props}
      getBreadcrumbsFn={getWholesaleBreadcrumbs}
      searchPlaceholder="Search wholesale workspace…"
      avatarFallback="WS"
      userLabel="Wholesale"
      userEmail="wholesaler@dropshop.nn"
      showQuickAction={false}
      userMenuItems={[
        { label: "Profile", href: "/wholesale/profile" },
        { label: "Settings", href: "/wholesale/settings" },
        { label: "Switch to Admin", href: "/dashboard" },
      ]}
    />
  );
}

export default WholesaleTopbar;
