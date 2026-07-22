import { UserRepository } from "../repositories/user-repository";
import { FailedLoginRepository } from "../repositories/failed-login-repository";
import { AccountLockoutRepository } from "../repositories/account-lockout-repository";
import { SecurityEventRepository } from "../repositories/security-event-repository";
import { env } from "@/shared/config/env";
import { AuditLogger } from "@/shared/lib/audit-logger";
import { logger } from "@/shared/utils/logger";
import { ForbiddenError, ValidationError } from "@/shared/errors/app-error";
import type { User } from "../domain/user-entity";

export class LockoutService {
  private readonly userRepository: UserRepository;
  private readonly failedLoginRepository: FailedLoginRepository;
  private readonly accountLockoutRepository: AccountLockoutRepository;
  private readonly securityEventRepository: SecurityEventRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.failedLoginRepository = new FailedLoginRepository();
    this.accountLockoutRepository = new AccountLockoutRepository();
    this.securityEventRepository = new SecurityEventRepository();
  }

  async checkAndLockAccount(
    identifier: string,
    ipAddress: string,
    userAgent: string,
    deviceInfo?: { type?: string; os?: string; browser?: string },
  ): Promise<{ locked: boolean; lockout?: { until: Date; reason: string } }> {
    const maxAttempts = env.MAX_LOGIN_ATTEMPTS;
    const lockoutDuration = env.LOCKOUT_DURATION_MINUTES;

    const user = await this.userRepository.findByEmail(identifier);
    if (!user) {
      await this.failedLoginRepository.incrementAttempt(
        identifier,
        ipAddress,
        userAgent,
        "account_not_found",
        deviceInfo,
      );
      return { locked: false };
    }

    const failedCount = user.failedLoginCount + 1;

    await this.userRepository.update(user.id, {
      failedLoginCount: failedCount,
      lastFailedLoginAt: new Date(),
      lastFailedLoginIp: ipAddress,
    } as never);

    await this.failedLoginRepository.incrementAttempt(
      user.id,
      ipAddress,
      userAgent,
      "invalid_credentials",
      deviceInfo,
    );

    if (failedCount >= maxAttempts) {
      const lockoutUntil = new Date(Date.now() + lockoutDuration * 60000);

      await this.userRepository.update(user.id, {
        lockedUntil: lockoutUntil,
        status: "blocked",
      } as never);

      await this.accountLockoutRepository.create({
        userId: user.id,
        type: "temporary",
        reason: "max_failed_attempts",
        lockedAt: new Date(),
        unlocksAt: lockoutUntil,
        lockedBy: "system",
      } as never);

      await this.securityEventRepository.create({
        userId: user.id,
        eventType: "account_locked",
        severity: "high",
        title: "Account Locked Due to Failed Login Attempts",
        description: `Account locked after ${maxAttempts} failed login attempts`,
        metadata: {
          maxAttempts,
          lockoutDurationMinutes: lockoutDuration,
          ipAddress,
        },
        ipAddress,
        userAgent,
        deviceInfo,
        resolved: false,
      } as never);

      await AuditLogger.record({
        action: "account.locked",
        entityType: "user",
        entityId: user.id,
        actor: { id: "system", role: "system" },
        changes: [
          { field: "status", oldValue: user.status, newValue: "blocked" },
          { field: "lockedUntil", oldValue: user.lockedUntil, newValue: lockoutUntil.toISOString() },
        ],
      });

      return {
        locked: true,
        lockout: {
          until: lockoutUntil,
          reason: `Maximum ${maxAttempts} login attempts exceeded`,
        },
      };
    }

    return { locked: false };
  }

  async isAccountLocked(userId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) return false;

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return true;
    }

    const lockout = await this.accountLockoutRepository.findByUserId(userId);
    if (lockout && lockout.unlocksAt && lockout.unlocksAt > new Date()) {
      return true;
    }

    return false;
  }

  async unlockAccount(
    userId: string,
    unlockedBy: string,
    notes?: string,
  ): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ValidationError("User not found");
    }

    const lockout = await this.accountLockoutRepository.findByUserId(userId);
    if (!lockout) {
      throw new ValidationError("No active lockout found for this user");
    }

    await this.accountLockoutRepository.unlock(userId, unlockedBy, notes);

    const updatedUser = await this.userRepository.update(userId, {
      lockedUntil: null,
      failedLoginCount: 0,
      lastFailedLoginAt: null,
      lastFailedLoginIp: null,
      status: "active",
    } as never);

    await this.securityEventRepository.create({
      userId,
      eventType: "account_unlocked",
      severity: "medium",
      title: "Account Unlocked",
      description: `Account unlocked by ${unlockedBy}`,
      metadata: { notes },
      resolved: true,
      resolvedAt: new Date(),
      resolvedBy: unlockedBy,
    } as never);

    await AuditLogger.record({
      action: "account.unlocked",
      entityType: "user",
      entityId: userId,
      actor: { id: unlockedBy, role: "admin" },
      changes: [
        { field: "status", oldValue: user.status, newValue: "active" },
        { field: "lockedUntil", oldValue: user.lockedUntil, newValue: null },
      ],
    });

    return updatedUser;
  }

  async resetFailedAttempts(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      failedLoginCount: 0,
      lastFailedLoginAt: null,
      lastFailedLoginIp: null,
    } as never);
  }

  async getLockoutStatus(userId: string): Promise<{
    isLocked: boolean;
    lockoutUntil?: Date | null;
    failedAttempts: number;
    lastFailedAt?: Date | null;
    lastFailedIp?: string;
  }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ValidationError("User not found");
    }

    const lockout = await this.accountLockoutRepository.findByUserId(userId);

    return {
      isLocked: user.lockedUntil ? user.lockedUntil > new Date() : false,
      lockoutUntil: user.lockedUntil ?? lockout?.unlocksAt ?? null,
      failedAttempts: user.failedLoginCount,
      lastFailedAt: user.lastFailedLoginAt ?? undefined,
      lastFailedIp: user.lastFailedLoginIp ?? undefined,
    };
  }

  async autoUnlockExpired(): Promise<number> {
    const expiring = await this.accountLockoutRepository.getExpiringLockouts();
    let unlockedCount = 0;

    for (const lockout of expiring) {
      const user = await this.userRepository.findById(lockout.userId);
      if (user && user.lockedUntil && user.lockedUntil <= new Date()) {
        await this.userRepository.update(lockout.userId, {
          lockedUntil: null,
          status: "active",
        } as never);

        await this.accountLockoutRepository.unlock(lockout.userId, "system", "Auto-unlocked after timeout");

        await this.securityEventRepository.create({
          userId: lockout.userId,
          eventType: "account_unlocked",
          severity: "low",
          title: "Account Auto-Unlocked",
          description: "Account automatically unlocked after lockout duration expired",
          metadata: { lockoutId: lockout.id },
          resolved: true,
          resolvedAt: new Date(),
          resolvedBy: "system",
        } as never);

        unlockedCount++;
      }
    }

    return unlockedCount;
  }
}

export default LockoutService;
