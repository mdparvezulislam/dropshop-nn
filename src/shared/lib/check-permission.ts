import { ForbiddenError, UnauthorizedError } from "@/shared/errors/app-error";

export interface SessionUser {
  permissions?: string[];
  email?: string | null;
  id?: string;
}

export type Session = { user?: SessionUser } | null;

export function checkPermission(
  session: Session,
  permission: string,
): void {
  if (!session) {
    throw new UnauthorizedError("Session expired or invalid");
  }
  const permissions = session.user?.permissions || [];
  if (!permissions.includes("*") && !permissions.includes(permission)) {
    throw new ForbiddenError(`Missing required permission: ${permission}`);
  }
}
