"use client";

import { useSession } from "next-auth/react";

export interface PermissionCheckResult {
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  userRole: string | undefined;
  permissions: string[];
}

export function usePermissions(): PermissionCheckResult {
  const { data: session } = useSession();
  const user = session?.user as { role?: string; permissions?: string[] } | undefined;
  const permissions = user?.permissions ?? [];
  const userRole = user?.role;

  return {
    hasPermission: (permission: string) => {
      if (permissions.includes("*")) return true;
      return permissions.includes(permission);
    },
    hasRole: (role: string) => userRole === role,
    hasAnyRole: (roles: string[]) => roles.includes(userRole ?? ""),
    userRole,
    permissions,
  };
}
