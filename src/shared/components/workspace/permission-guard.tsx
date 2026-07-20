"use client";

import * as React from "react";
import { usePermissions } from "@/shared/hooks/use-permissions";
import type { PermissionCheckResult } from "@/shared/hooks/use-permissions";

export interface PermissionGuardProps {
  permission?: string;
  role?: string;
  anyPermission?: string[];
  anyRole?: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({
  permission,
  role,
  anyPermission,
  anyRole,
  fallback = null,
  children,
}: PermissionGuardProps): React.ReactElement | null {
  const { hasPermission, hasRole, hasAnyRole } = usePermissions();

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  if (anyPermission && !anyPermission.some((p) => hasPermission(p))) {
    return <>{fallback}</>;
  }

  if (anyRole && !hasAnyRole(anyRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export type { PermissionCheckResult };
