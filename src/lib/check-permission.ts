import { ForbiddenError, UnauthorizedError } from "@/lib/errors/app-error";

export interface SessionUser {
  id?: string;
  permissions?: string[];
  email?: string | null;
  role?: string;
  name?: string | null;
}

export type Session = { user?: SessionUser } | null;

/**
 * Check if the session has a specific permission. Throws on failure.
 */
export function checkPermission(session: Session, permission: string): void {
  if (!session) {
    throw new UnauthorizedError("Session expired or invalid");
  }
  const permissions = session.user?.permissions || [];
  if (!permissions.includes("*") && !permissions.includes(permission)) {
    throw new ForbiddenError(`Missing required permission: ${permission}`);
  }
}

/**
 * Check if the session has at least one of the required permissions. Throws on failure.
 */
export function checkAnyPermission(session: Session, permissions: string[]): void {
  if (!session) {
    throw new UnauthorizedError("Session expired or invalid");
  }
  const userPermissions = session.user?.permissions || [];
  if (userPermissions.includes("*")) return;
  const hasAny = permissions.some((p) => userPermissions.includes(p));
  if (!hasAny) {
    throw new ForbiddenError(`Missing required permissions: ${permissions.join(" or ")}`);
  }
}

/**
 * Check if the session has all required permissions. Throws on failure.
 */
export function checkAllPermissions(session: Session, permissions: string[]): void {
  if (!session) {
    throw new UnauthorizedError("Session expired or invalid");
  }
  const userPermissions = session.user?.permissions || [];
  if (userPermissions.includes("*")) return;
  const missing = permissions.filter((p) => !userPermissions.includes(p));
  if (missing.length > 0) {
    throw new ForbiddenError(`Missing required permissions: ${missing.join(", ")}`);
  }
}

/**
 * Check if the session has a specific role. Throws on failure.
 */
export function checkRole(session: Session, role: string): void {
  if (!session) {
    throw new UnauthorizedError("Session expired or invalid");
  }
  const userRole = session.user?.role;
  if (!userRole) {
    throw new ForbiddenError("No role assigned");
  }
  if (normalize(userRole) !== normalize(role)) {
    throw new ForbiddenError(`Missing required role: ${role}`);
  }
}

/**
 * Check if the session has at least one of the required roles. Throws on failure.
 */
export function checkAnyRole(session: Session, roles: string[]): void {
  if (!session) {
    throw new UnauthorizedError("Session expired or invalid");
  }
  const userRole = session.user?.role;
  if (!userRole) {
    throw new ForbiddenError("No role assigned");
  }
  const normalized = normalize(userRole);
  const hasAny = roles.some((r) => normalize(r) === normalized);
  if (!hasAny) {
    throw new ForbiddenError(`Missing required role: ${roles.join(" or ")}`);
  }
}

/**
 * Check if the session user is an admin (admin or super_admin).
 */
export function isAdmin(session: Session): boolean {
  if (!session?.user?.role) return false;
  const r = normalize(session.user.role);
  return r === "admin" || r === "super_admin" || r.includes("admin");
}

/**
 * Check if the session user is a super admin.
 */
export function isSuperAdmin(session: Session): boolean {
  if (!session?.user?.role) return false;
  const permissions = session.user.permissions || [];
  if (permissions.includes("*")) return true;
  return normalize(session.user.role) === "super_admin";
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

function normalize(role: string): string {
  return role.trim().toLowerCase().replace(/[\s-]+/g, "_");
}
