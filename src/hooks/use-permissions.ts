"use client";

import { useSession } from "next-auth/react";

export interface PermissionCheckResult {
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  userRole: string | undefined;
  permissions: string[];
  isSuperAdmin: boolean;
}

export function usePermissions(): PermissionCheckResult {
  const { data: session } = useSession();
  const user = session?.user as { role?: string; permissions?: string[] } | undefined;
  const permissions = user?.permissions ?? [];
  const rawRole = user?.role ?? "";
  const userRole = rawRole.toLowerCase().replace(/[\s-]+/g, "_");

  // Super admin and admin have full unrestricted powers across all roles & features
  const isSuperAdmin = userRole === "super_admin" || userRole === "admin" || permissions.includes("*");

  return {
    hasPermission: (permission: string) => {
      if (isSuperAdmin) return true;
      return permissions.includes(permission);
    },
    hasRole: (role: string) => {
      if (isSuperAdmin) return true;
      return userRole === role.toLowerCase().replace(/[\s-]+/g, "_");
    },
    hasAnyRole: (roles: string[]) => {
      if (isSuperAdmin) return true;
      const normalizedRoles = roles.map((r) => r.toLowerCase().replace(/[\s-]+/g, "_"));
      return normalizedRoles.includes(userRole);
    },
    userRole,
    permissions,
    isSuperAdmin,
  };
}
