import { RecoveryTokenRepository } from "../repositories/recovery-token-repository";
import { UserRepository } from "../repositories/user-repository";
import { SecurityEventService } from "./security-event-service";
import { AuditLogger } from "@/shared/lib/audit-logger";
import { logger } from "@/shared/utils/logger";
import { env } from "@/shared/config/env";
import { hashPassword } from "@/shared/utils/hash";
import { createHash, randomBytes } from "crypto";
import { NotFoundError, ValidationError, ConflictError } from "@/shared/errors/app-error";
import type { RecoveryToken, PasswordResetRequest } from "../domain/security-types";

export class PasswordResetService {
  private readonly recoveryTokenRepository: RecoveryTokenRepository;
  private readonly userRepository: UserRepository;
  private readonly securityEventService: SecurityEventService;

  constructor() {
    this.recoveryTokenRepository = new RecoveryTokenRepository();
    this.userRepository = new UserRepository();
    this.securityEventService = new SecurityEventService();
  }

  async requestPasswordReset(
    email: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      // Don't reveal whether user exists
      return { success: true, message: "If the email exists, a reset link will be sent." };
    }

    // Check for recent reset requests (rate limiting)
    const recentTokens = await this.recoveryTokenRepository.findByUserId(user.id);
    const recentReset = recentTokens.find(
      (t) => t.type === "password_reset" && t.createdAt > new Date(Date.now() - 5 * 60 * 1000),
    );
    if (recentReset) {
      throw new ConflictError("Password reset already requested. Please wait 5 minutes.");
    }

    const token = this.generateSecureToken();
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000);

    const recoveryToken = await this.recoveryTokenRepository.create({
      userId: user.id,
      email: user.email,
      token,
      tokenHash,
      type: "password_reset",
      status: "pending",
      expiresAt,
      metadata: {
        requestedFromIp: ipAddress,
        requestedFromUserAgent: userAgent,
      },
    } as never);

    await this.securityEventService.logEvent({
      userId: user.id,
      eventType: "password_reset_requested",
      severity: "medium",
      title: "Password Reset Requested",
      description: `Password reset requested from ${ipAddress}`,
      metadata: { tokenId: recoveryToken.id, ipAddress },
      ipAddress,
      userAgent,
    });

    await AuditLogger.record({
      action: "password.reset_requested",
      entityType: "user",
      entityId: user.id,
      actor: { id: "system", role: "system" },
      changes: [{ field: "passwordResetToken", oldValue: undefined, newValue: "requested" }],
    });

    // In production, send email here
    logger.info("Password reset requested", {
      userId: user.id,
      email: user.email,
      ipAddress,
      token: process.env.NODE_ENV === "development" ? token : undefined,
    });

    return { success: true, message: "Password reset instructions sent to your email." };
  }

  async validateResetToken(token: string): Promise<{ valid: boolean; userId?: string; email?: string }> {
    const validToken = await this.recoveryTokenRepository.findValidToken(token);

    if (!validToken) {
      return { valid: false };
    }

    return { valid: true, userId: validToken.userId, email: validToken.email };
  }

  async resetPassword(
    token: string,
    newPassword: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ success: boolean; message: string }> {
    const validToken = await this.recoveryTokenRepository.findValidToken(token);

    if (!validToken) {
      throw new ValidationError("Invalid or expired reset token");
    }

    const user = await this.userRepository.findById(validToken.userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const oldPasswordHash = user.passwordHash;
    const newPasswordHash = await hashPassword(newPassword);

    await this.userRepository.update(validToken.userId, {
      passwordHash: newPasswordHash,
      passwordLastChangedAt: new Date(),
      passwordResetToken: null,
      passwordResetTokenExpiresAt: null,
      mustChangePassword: false,
      lockedUntil: null,
      failedLoginCount: 0,
    } as never);

    await this.recoveryTokenRepository.markAsUsed(
      validToken.id,
      ipAddress,
      userAgent,
    );

    await this.securityEventService.logEvent({
      userId: user.id,
      eventType: "password_reset_completed",
      severity: "medium",
      title: "Password Reset Completed",
      description: `Password successfully reset from ${ipAddress}`,
      metadata: { ipAddress },
      ipAddress,
      userAgent,
    });

    await AuditLogger.record({
      action: "password.reset_completed",
      entityType: "user",
      entityId: user.id,
      actor: { id: "system", role: "system" },
      changes: [
        { field: "passwordHash", oldValue: "[old_hash]", newValue: "[new_hash]" },
        { field: "passwordLastChangedAt", oldValue: user.passwordLastChangedAt, newValue: new Date().toISOString() },
      ],
    });

    return { success: true, message: "Password reset successfully. You can now log in." };
  }

  async adminResetPassword(
    userId: string,
    newPassword: string,
    resetBy: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const passwordHash = await hashPassword(newPassword);

    await this.userRepository.update(userId, {
      passwordHash,
      passwordLastChangedAt: new Date(),
      mustChangePassword: true,
      passwordResetToken: null,
      passwordResetTokenExpiresAt: null,
      lockedUntil: null,
      failedLoginCount: 0,
    } as never);

    await this.securityEventService.logEvent({
      userId,
      eventType: "password_changed",
      severity: "high",
      title: "Password Reset by Admin",
      description: `Password was reset by administrator ${resetBy}`,
      metadata: { resetBy, adminUserId: resetBy },
    });

    await AuditLogger.record({
      action: "password.admin_reset",
      entityType: "user",
      entityId: userId,
      actor: { id: resetBy, role: "admin" },
      changes: [
        { field: "passwordHash", oldValue: "[old_hash]", newValue: "[new_hash]" },
        { field: "mustChangePassword", oldValue: user.mustChangePassword, newValue: true },
      ],
    });

    return { success: true, message: "Password reset successfully." };
  }

  async userResetPassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const { comparePassword } = await import("@/shared/utils/hash");
    const currentMatches = await comparePassword(currentPassword, user.passwordHash);
    if (!currentMatches) {
      throw new ValidationError("Current password is incorrect");
    }

    const passwordHash = await hashPassword(newPassword);

    await this.userRepository.update(userId, {
      passwordHash,
      passwordLastChangedAt: new Date(),
      mustChangePassword: false,
    } as never);

    await this.securityEventService.logEvent({
      userId,
      eventType: "password_changed",
      severity: "medium",
      title: "Password Changed",
      description: "User changed their password",
    });

    await AuditLogger.record({
      action: "password.changed",
      entityType: "user",
      entityId: userId,
      actor: { id: userId, role: "user" },
      changes: [
        { field: "passwordHash", oldValue: "[old_hash]", newValue: "[new_hash]" },
        { field: "passwordLastChangedAt", oldValue: user.passwordLastChangedAt, newValue: new Date().toISOString() },
      ],
    });

    return { success: true, message: "Password changed successfully." };
  }

  async generateTemporaryPassword(): Promise<string> {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async forcePasswordChange(userId: string, resetBy: string): Promise<void> {
    await this.userRepository.update(userId, {
      mustChangePassword: true,
    } as never);

    await this.securityEventService.logEvent({
      userId,
      eventType: "password_changed",
      severity: "low",
      title: "Force Password Change",
      description: `Password change was forced by ${resetBy}`,
      metadata: { resetBy },
    });
  }

  private generateSecureToken(): string {
    return randomBytes(32).toString("hex");
  }

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}

export default PasswordResetService;
