import { UserSessionModel, UserSessionDocument } from "@/features/auth/repositories/user-session-model";
import { logger } from "@/shared/utils/logger";

export interface ActiveSession {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  expiresAt: Date;
  createdAt: Date;
  lastActivity: Date;
  isCurrentSession: boolean;
}

export class SessionService {
  async getActiveSessions(userId: string, currentSessionToken?: string): Promise<ActiveSession[]> {
    logger.info("SessionService: fetching active sessions", { userId });

    const docs = await UserSessionModel.find({
      userId,
      expiresAt: { $gt: new Date() },
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return docs.map((doc: any) => ({
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      ipAddress: doc.ipAddress,
      userAgent: doc.userAgent,
      expiresAt: doc.expiresAt,
      createdAt: doc.createdAt,
      lastActivity: doc.updatedAt || doc.createdAt,
      isCurrentSession: currentSessionToken
        ? doc.token === currentSessionToken
        : false,
    }));
  }

  async revokeSession(sessionId: string, userId: string): Promise<void> {
    logger.info("SessionService: revoking session", { sessionId, userId });

    await UserSessionModel.deleteOne({
      _id: sessionId,
      userId,
    }).exec();
  }

  async revokeOtherSessions(userId: string, currentSessionToken: string): Promise<number> {
    logger.info("SessionService: revoking other sessions", { userId });

    const result = await UserSessionModel.deleteMany({
      userId,
      token: { $ne: currentSessionToken },
    }).exec();

    logger.info("SessionService: other sessions revoked", {
      userId,
      count: result.deletedCount,
    });

    return result.deletedCount || 0;
  }

  async revokeAllUserSessions(userId: string): Promise<number> {
    logger.info("SessionService: revoking all user sessions", { userId });

    const result = await UserSessionModel.deleteMany({
      userId,
    }).exec();

    return result.deletedCount || 0;
  }
}

export default SessionService;
