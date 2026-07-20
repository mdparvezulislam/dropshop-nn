"use client";

import { WorkspaceLayout } from "@/shared/components/workspace/workspace-layout";
import { SupplierTopbar } from "@/features/supplier-workspace/supplier-topbar";
import { SUPPLIER_NAV } from "@/features/supplier-workspace/nav-config";
import { Building2 } from "lucide-react";

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <WorkspaceLayout
      nav={SUPPLIER_NAV}
      workspaceLabel="Supplier"
      workspaceIcon={<Building2 className="h-4 w-4" />}
      topbar={SupplierTopbar}
    >
      {children}
    </WorkspaceLayout>
  );
}
