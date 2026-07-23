"use server";

import { auth } from "@/lib/auth";
import { SessionService } from "../services/session-service";
import { checkPermission } from "@/lib/check-permission";
import { UnauthorizedError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";

function getSessionUser(session: any): { id: string; name?: string; role?: string } {
  if (!session?.user) {
    throw new UnauthorizedError("Session expired or invalid");
  }
  return session.user;
}

export async function getActiveSessionsAction() {
  const session = await auth();
  const sessionUser = getSessionUser(session);

  logger.info("Identity Action: getActiveSessionsAction called");

  const service = new SessionService();
  const result = await service.getActiveSessions(sessionUser.id);

  return { success: true, data: result };
}

export async function revokeSessionAction(sessionId: string) {
  const session = await auth();
  checkPermission(session, "Identity.Sessions");
  const sessionUser = getSessionUser(session);

  logger.info("Identity Action: revokeSessionAction called", { sessionId });

  const service = new SessionService();
  await service.revokeSession(sessionId, sessionUser.id);

  return { success: true, data: null };
}

export async function revokeOtherSessionsAction() {
  const session = await auth();
  const sessionUser = getSessionUser(session);

  logger.info("Identity Action: revokeOtherSessionsAction called");

  const service = new SessionService();
  const count = await service.revokeOtherSessions(sessionUser.id, sessionUser.id);

  return { success: true, data: { revokedCount: count } };
}

export async function forceLogoutUserAction(userId: string) {
  const session = await auth();
  checkPermission(session, "Identity.Sessions");

  logger.info("Identity Action: forceLogoutUserAction called", { userId });

  const service = new SessionService();
  const count = await service.revokeAllUserSessions(userId);

  return { success: true, data: { revokedCount: count } };
}
