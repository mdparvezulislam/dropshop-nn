import { UserRepository } from "../repositories/user-repository";
import { FailedLoginRepository } from "../repositories/failed-login-repository";
import { AccountLockoutRepository } from "../repositories/account-lockout-repository";
import { SecurityEventRepository } from "../repositories/security-event-repository";
import { TrustedDeviceRepository } from "../repositories/trusted-device-repository";
import { RecoveryTokenRepository } from "../repositories/recovery-token-repository";
import { LockoutService } from "./lockout-service";
import type { SecurityDashboardStats } from "../domain/security-types";

export class SecurityDashboardService {
  private readonly userRepository: UserRepository;
  private readonly failedLoginRepository: FailedLoginRepository;
  private readonly accountLockoutRepository: AccountLockoutRepository;
  private readonly securityEventRepository: SecurityEventRepository;
  private readonly trustedDeviceRepository: TrustedDeviceRepository;
  private readonly recoveryTokenRepository: RecoveryTokenRepository;
  private readonly lockoutService: LockoutService;

  constructor() {
    this.userRepository = new UserRepository();
    this.failedLoginRepository = new FailedLoginRepository();
    this.accountLockoutRepository = new AccountLockoutRepository();
    this.securityEventRepository = new SecurityEventRepository();
    this.trustedDeviceRepository = new TrustedDeviceRepository();
    this.recoveryTokenRepository = new RecoveryTokenRepository();
    this.lockoutService = new LockoutService();
  }

  async getDashboardStats(): Promise<SecurityDashboardStats> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalUsers,
      activeUsers,
      lockedAccounts,
      suspendedUsers,
      blockedUsers,
      pendingUsers,
      activeSessions,
      trustedDevices,
      recentFailedLogins,
      recentLockouts,
      securityStats,
      recentEvents,
      passwordResetRequests,
      newDevicesToday,
    ] = await Promise.all([
      this.userRepository.count({ isDeleted: { $ne: true } } as never),
      this.userRepository.count({ status: "active", isDeleted: { $ne: true } } as never),
      this.userRepository.count({ lockedUntil: { $gt: now }, isDeleted: { $ne: true } } as never),
      this.userRepository.count({ status: "suspended", isDeleted: { $ne: true } } as never),
      this.userRepository.count({ status: "blocked", isDeleted: { $ne: true } } as never),
      this.userRepository.count({ status: "pending", isDeleted: { $ne: true } } as never),
      this.getActiveSessionCount(),
      this.trustedDeviceRepository.count({ isTrusted: true } as never),
      this.failedLoginRepository.getRecentAttempts(20),
      this.accountLockoutRepository.getActiveLockouts(),
      this.securityEventRepository.getStats(),
      this.securityEventRepository.getRecentEvents(20),
      this.recoveryTokenRepository.count({
        type: "password_reset",
        status: "pending",
        createdAt: { $gte: todayStart },
      } as never),
      this.securityEventRepository.count({
        eventType: "new_device_detected",
        createdAt: { $gte: todayStart },
      } as never),
    ]);

    const loggedInUsers = await this.getLoggedInUserCount();

    return {
      activeUsers,
      loggedInUsers,
      failedLoginAttempts: recentFailedLogins.length,
      lockedAccounts,
      suspendedUsers,
      blockedUsers,
      pendingVerifications: pendingUsers + (await this.getPendingVerificationCount()),
      passwordResetRequests,
      activeSessions,
      trustedDevices,
      newDevicesToday,
      securityEvents: {
        total: securityStats.total,
        bySeverity: securityStats.bySeverity as any,
        byType: securityStats.byEventType as any,
        unresolved: securityStats.unresolved,
      },
      recentEvents: recentEvents.map((e) => ({
        id: e.id,
        eventType: e.eventType,
        severity: e.severity,
        title: e.title,
        userId: e.userId ?? undefined,
        userName: undefined,
        timestamp: e.createdAt,
        resolved: e.resolved,
      })),
      recentFailedLogins: recentFailedLogins.map((f) => ({
        id: f.id,
        identifier: f.identifier,
        ipAddress: f.ipAddress,
        reason: f.reason,
        attemptCount: f.attemptCount,
        lastAttemptAt: f.lastAttemptAt,
      })),
      recentLockouts: recentLockouts.map((l) => ({
        id: l.id,
        userId: l.userId,
        userName: "Unknown User",
        type: l.type,
        reason: l.reason,
        lockedAt: l.lockedAt,
        unlocksAt: l.unlocksAt ?? undefined,
      })),
    };
  }

  async getUserSecurityOverview(userId: string): Promise<{
    user: { id: string; fullName: string; email: string; role: string; status: string };
    sessions: Array<{ id: string; ipAddress: string; userAgent: string; expiresAt: Date; createdAt: Date; isCurrent: boolean }>;
    devices: Array<{ id: string; deviceId: string; name?: string; type: string; os: string; browser: string; ipAddress: string; lastUsedAt: Date; isTrusted: boolean; autoTrusted: boolean }>;
    loginHistory: Array<{ ip: string; userAgent: string; loggedAt: Date }>;
    passwordStatus: { lastChangedAt?: Date | null; mustChangePassword: boolean; resetToken?: boolean };
    verificationStatus: { emailVerified: boolean; phoneVerified: boolean };
    securityEvents: Array<{ id: string; eventType: string; severity: string; title: string; description?: string; createdAt: Date; resolved: boolean }>;
    lockoutStatus: { isLocked: boolean; lockoutUntil?: Date | null; failedAttempts: number };
  }> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    const [sessions, devices, events, lockoutStatus] = await Promise.all([
      this.getUserSessions(userId),
      this.trustedDeviceRepository.findByUserId(userId),
      this.securityEventRepository.findByUserId(userId),
      this.lockoutService.getLockoutStatus(userId),
    ]);

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      sessions,
      devices: devices.map((d) => ({
        id: d.id,
        deviceId: d.deviceId,
        name: d.name,
        type: d.deviceInfo.type,
        os: d.deviceInfo.os,
        browser: d.deviceInfo.browser,
        ipAddress: d.deviceInfo.ipAddress,
        lastUsedAt: d.lastUsedAt,
        isTrusted: d.isTrusted,
        autoTrusted: d.autoTrusted,
      })),
      loginHistory: user.loginHistory || [],
      passwordStatus: {
        lastChangedAt: user.passwordLastChangedAt,
        mustChangePassword: user.mustChangePassword,
        resetToken: !!user.passwordResetToken,
      },
      verificationStatus: {
        emailVerified: !!user.emailVerifiedAt,
        phoneVerified: !!user.phoneVerifiedAt,
      },
      securityEvents: events.map((e) => ({
        id: e.id,
        eventType: e.eventType,
        severity: e.severity,
        title: e.title,
        description: e.description,
        createdAt: e.createdAt,
        resolved: e.resolved,
      })),
      lockoutStatus,
    };
  }

  private async getActiveSessionCount(): Promise<number> {
    try {
      const { UserSessionModel } = await import("@/features/auth/repositories/user-session-model");
      return await UserSessionModel.countDocuments({ expiresAt: { $gt: new Date() } });
    } catch {
      return 0;
    }
  }

  private async getLoggedInUserCount(): Promise<number> {
    try {
      const { UserSessionModel } = await import("@/features/auth/repositories/user-session-model");
      const sessions = await UserSessionModel.find({
        expiresAt: { $gt: new Date() },
      }).lean().exec();
      const uniqueUsers = new Set(sessions.map((s: any) => s.userId?.toString()));
      return uniqueUsers.size;
    } catch {
      return 0;
    }
  }

  private async getPendingVerificationCount(): Promise<number> {
    try {
      const { BusinessProfileService } = await import("@/features/identity/services/business-profile-service");
      const service = new BusinessProfileService();
      const pending = await service.findPendingApprovals();
      return Array.isArray(pending) ? pending.length : 0;
    } catch {
      return 0;
    }
  }

  private async getUserSessions(userId: string): Promise<Array<{
    id: string;
    ipAddress: string;
    userAgent: string;
    expiresAt: Date;
    createdAt: Date;
    isCurrent: boolean;
  }>> {
    try {
      const { UserSessionModel } = await import("@/features/auth/repositories/user-session-model");
      const sessions = await UserSessionModel.find({
        userId,
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 }).lean().exec();

      return sessions.map((s: any) => ({
        id: s._id.toString(),
        ipAddress: s.ipAddress || "unknown",
        userAgent: s.userAgent || "unknown",
        expiresAt: s.expiresAt,
        createdAt: s.createdAt,
        isCurrent: false,
      }));
    } catch {
      return [];
    }
  }
}

export default SecurityDashboardService;
