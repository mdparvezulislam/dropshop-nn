"use client";

import * as React from "react";
import { usePermissions } from "@/hooks/use-permissions";

export interface RoleGuardProps {
  role?: string;
  anyRole?: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function RoleGuard({
  role,
  anyRole,
  fallback = null,
  children,
}: RoleGuardProps): React.ReactElement | null {
  const { hasRole, hasAnyRole } = usePermissions();

  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  if (anyRole && !hasAnyRole(anyRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default RoleGuard;
