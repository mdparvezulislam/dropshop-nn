"use server";

import { auth } from "@/shared/lib/auth";
import {
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
  sessionActor,
  type Session,
} from "@/shared/lib/check-permission";
import { UnauthorizedError, ForbiddenError } from "@/shared/errors/app-error";

export interface AuthenticatedActor {
  session: Session;
  actor: { id: string; name?: string; role?: string };
}

/**
 * Require a specific permission. Returns session + actor info for audit logging.
 * Use in every server action that needs authorization.
 */
export async function requirePermission(permission: string): Promise<AuthenticatedActor> {
  const session = await auth();
  checkPermission(session, permission);
  return {
    session,
    actor: sessionActor(session),
  };
}

/**
 * Require at least one of the specified permissions.
 */
export async function requireAnyPermission(permissions: string[]): Promise<AuthenticatedActor> {
  const session = await auth();
  checkAnyPermission(session, permissions);
  return {
    session,
    actor: sessionActor(session),
  };
}

/**
 * Require all of the specified permissions.
 */
export async function requireAllPermissions(permissions: string[]): Promise<AuthenticatedActor> {
  const session = await auth();
  checkAllPermissions(session, permissions);
  return {
    session,
    actor: sessionActor(session),
  };
}

/**
 * Require a specific role.
 */
export async function requireRole(role: string): Promise<AuthenticatedActor> {
  const session = await auth();
  if (!session) throw new UnauthorizedError("Session expired or invalid");
  const userRole = (session.user as { role?: string } | undefined)?.role;
  if (!userRole) throw new ForbiddenError("No role assigned");
  return {
    session,
    actor: sessionActor(session),
  };
}

/**
 * Standard server action wrapper that handles auth, permission check, and error handling.
 */
export async function withAuth<T>(
  permission: string,
  handler: (actor: AuthenticatedActor) => Promise<T>,
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const actor = await requirePermission(permission);
    const data = await handler(actor);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Operation failed",
    };
  }
}

/**
 * Standard server action wrapper that handles auth with any of the given permissions.
 */
export async function withAnyAuth<T>(
  permissions: string[],
  handler: (actor: AuthenticatedActor) => Promise<T>,
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const actor = await requireAnyPermission(permissions);
    const data = await handler(actor);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Operation failed",
    };
  }
}
