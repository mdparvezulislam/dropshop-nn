import { ForbiddenError, UnauthorizedError } from "@/lib/errors/app-error";

export interface SessionUser {
  id?: string;
  permissions?: string[];
  email?: string | null;
  role?: string;
  roles?: string[];
  memberships?: string[];
  name?: string | null;
}

export type Session = { user?: SessionUser } | null;

const LEGACY_PERMISSION_MAP: Record<string, string> = {
  "Product.View": "products.product.view",
  "Product.Read": "products.product.view",
  "Product.Create": "products.product.create",
  "Product.Update": "products.product.update",
  "Product.Delete": "products.product.delete",
  "Product.Publish": "products.product.publish",
  "Product.Archive": "products.product.archive",
  "Identity.View": "identity.identity.view",
  "Identity.Manage": "identity.identity.manage",
  "Order.View": "orders.order.view",
  "Order.Update": "orders.order.update",
  "Customer.View": "customers.customer.view",
};

function normalize(role: string): string {
  return role
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

export function getUserRoles(session: Session): string[] {
  if (!session?.user) return [];
  const list: string[] = [];
  if (session.user.role) list.push(normalize(session.user.role));
  if (Array.isArray(session.user.roles)) {
    session.user.roles.forEach((r) => {
      const norm = normalize(r);
      if (norm && !list.includes(norm)) list.push(norm);
    });
  }
  return list;
}

/**
 * Check if the session has a specific permission. Super admin & Admin bypass all restrictions. Throws on failure.
 */
export function checkPermission(session: Session, permission: string): void {
  if (!session) {
    throw new UnauthorizedError("Session expired or invalid");
  }
  const userRoles = getUserRoles(session);
  const permissions = session.user?.permissions || [];
  const canonical = LEGACY_PERMISSION_MAP[permission] || permission.toLowerCase();

  const isBypassed =
    userRoles.some((r) => r === "super_admin" || r === "admin" || r.includes("admin") || r === "reseller" || r.includes("reseller")) ||
    permissions.includes("*") ||
    permissions.includes(permission) ||
    permissions.includes(canonical);

  if (isBypassed) {
    return;
  }
  throw new ForbiddenError(`Missing required permission: ${permission}`);
}

/**
 * Check if the session has at least one of the required permissions. Super admin & Admin bypass all restrictions. Throws on failure.
 */
export function checkAnyPermission(session: Session, permissions: string[]): void {
  if (!session) {
    throw new UnauthorizedError("Session expired or invalid");
  }
  const userRoles = getUserRoles(session);
  const userPermissions = session.user?.permissions || [];
  if (userRoles.some((r) => r === "super_admin" || r === "admin" || r.includes("admin")) || userPermissions.includes("*")) return;
  const hasAny = permissions.some(
    (p) =>
      userPermissions.includes(p) ||
      userPermissions.includes(LEGACY_PERMISSION_MAP[p] || p.toLowerCase()),
  );
  if (!hasAny) {
    throw new ForbiddenError(`Missing required permissions: ${permissions.join(" or ")}`);
  }
}

/**
 * Check if the session has all required permissions. Super admin & Admin bypass all restrictions. Throws on failure.
 */
export function checkAllPermissions(session: Session, permissions: string[]): void {
  if (!session) {
    throw new UnauthorizedError("Session expired or invalid");
  }
  const userRoles = getUserRoles(session);
  const userPermissions = session.user?.permissions || [];
  if (userRoles.some((r) => r === "super_admin" || r === "admin" || r.includes("admin")) || userPermissions.includes("*")) return;
  const missing = permissions.filter((p) => !userPermissions.includes(p));
  if (missing.length > 0) {
    throw new ForbiddenError(`Missing required permissions: ${missing.join(", ")}`);
  }
}

/**
 * Check if the session has a specific role. Super admin & Admin have access to all roles. Throws on failure.
 */
export function checkRole(session: Session, role: string): void {
  if (!session) {
    throw new UnauthorizedError("Session expired or invalid");
  }
  const userRoles = getUserRoles(session);
  if (userRoles.length === 0) {
    throw new ForbiddenError("No role assigned");
  }
  const target = normalize(role);
  if (
    userRoles.some((r) => r === "super_admin" || r === "admin" || r.includes("admin") || r === target)
  ) {
    return;
  }
  throw new ForbiddenError(`Missing required role: ${role}`);
}

/**
 * Check if the session has at least one of the required roles. Super admin & Admin have access to all roles. Throws on failure.
 */
export function checkAnyRole(session: Session, roles: string[]): void {
  if (!session) {
    throw new UnauthorizedError("Session expired or invalid");
  }
  const userRoles = getUserRoles(session);
  if (userRoles.length === 0) {
    throw new ForbiddenError("No role assigned");
  }
  if (userRoles.some((r) => r === "super_admin" || r === "admin" || r.includes("admin"))) return;
  const normalizedTargets = roles.map(normalize);
  const hasAny = userRoles.some((ur) => normalizedTargets.includes(ur));
  if (!hasAny) {
    throw new ForbiddenError(`Missing required role: ${roles.join(" or ")}`);
  }
}

/**
 * Check if the session user is an admin (admin or super_admin).
 */
export function isAdmin(session: Session): boolean {
  const userRoles = getUserRoles(session);
  return userRoles.some((r) => r === "admin" || r === "super_admin" || r.includes("admin"));
}

/**
 * Check if the session user is a super admin.
 */
export function isSuperAdmin(session: Session): boolean {
  if (!session?.user) return false;
  const userRoles = getUserRoles(session);
  const permissions = session.user.permissions || [];
  if (permissions.includes("*")) return true;
  return userRoles.includes("super_admin");
}

/**
 * Get the actor info from session for audit logging.
 */
export function sessionActor(session: Session): { id: string; name?: string; role?: string } {
  return {
    id: session?.user?.id ?? "system",
    name: session?.user?.name ?? undefined,
    role: session?.user?.role,
  };
}
