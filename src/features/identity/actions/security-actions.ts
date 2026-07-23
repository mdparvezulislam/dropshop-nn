"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, requireAnyPermission } from "@/lib/action-guard";
import { SecurityDashboardService } from "@/features/auth/services/security-dashboard-service";
import { LockoutService } from "@/features/auth/services/lockout-service";
import { SecurityEventService } from "@/features/auth/services/security-event-service";
import { PasswordResetService } from "@/features/auth/services/password-reset-service";
import { DeviceService } from "@/features/auth/services/device-service";
import { SessionService } from "@/features/identity/services/session-service";
import { UserRepository } from "@/features/auth/repositories/user-repository";
import { z } from "zod";

const dashboardService = new SecurityDashboardService();
const lockoutService = new LockoutService();
const securityEventService = new SecurityEventService();
const passwordResetService = new PasswordResetService();
const deviceService = new DeviceService();
const sessionService = new SessionService();

// ============================================================================
// Security Dashboard Actions
// ============================================================================

export async function getSecurityDashboardStatsAction(): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    await requirePermission("identity.identity.view");
    const stats = await dashboardService.getDashboardStats();
    return { success: true, data: stats };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function getUserSecurityOverviewAction(userId: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    await requirePermission("identity.identity.view");
    const overview = await dashboardService.getUserSecurityOverview(userId);
    return { success: true, data: overview };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

// ============================================================================
// Session Management Actions
// ============================================================================

export async function getActiveSessionsAction(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const { actor } = await requireAnyPermission(["identity.identity.view", "identity.identity.sessions"]);
    const sessions = await sessionService.getActiveSessions(actor.id);
    return { success: true, data: sessions };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function forceLogoutUserAction(userId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { actor } = await requirePermission("identity.identity.sessions");
    await sessionService.revokeAllUserSessions(userId);
    revalidatePath("/dashboard/identity/security");
    revalidatePath("/dashboard/identity/users");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function revokeSessionAction(sessionId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { actor } = await requirePermission("identity.identity.sessions");
    await sessionService.revokeSession(sessionId, actor.id);
    revalidatePath("/dashboard/identity/security");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function revokeOtherSessionsAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { actor } = await requirePermission("identity.identity.sessions");
    await sessionService.revokeOtherSessions(actor.id, "current");
    revalidatePath("/dashboard/identity/security");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

// ============================================================================
// Account Lockout Actions
// ============================================================================

export async function getLockoutStatusAction(userId: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    await requirePermission("identity.identity.view");
    const status = await lockoutService.getLockoutStatus(userId);
    return { success: true, data: status };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function unlockAccountAction(userId: string, notes?: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { actor } = await requirePermission("identity.identity.manage");
    await lockoutService.unlockAccount(userId, actor.id, notes);
    revalidatePath("/dashboard/identity/security");
    revalidatePath("/dashboard/identity/users");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function lockAccountAction(
  userId: string,
  type: "temporary" | "permanent",
  reason: string,
  durationMinutes?: number,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { actor } = await requirePermission("identity.identity.manage");
    const userRepo = new UserRepository();
    const user = await userRepo.findById(userId);
    if (!user) throw new Error("User not found");

    const lockoutUntil = type === "temporary" && durationMinutes
      ? new Date(Date.now() + durationMinutes * 60 * 1000)
      : null;

    await userRepo.update(userId, {
      lockedUntil: lockoutUntil,
      status: type === "permanent" ? "blocked" : "blocked",
    } as never);

    const { AccountLockoutRepository } = await import("@/features/auth/repositories/account-lockout-repository");
    const lockoutRepo = new AccountLockoutRepository();
    await lockoutRepo.create({
      userId,
      type,
      reason,
      lockedAt: new Date(),
      unlocksAt: lockoutUntil,
      lockedBy: actor.id,
    } as never);

    await securityEventService.logEvent({
      userId,
      eventType: "account_locked",
      severity: "high",
      title: `Account ${type === "permanent" ? "Permanently" : "Temporarily"} Locked`,
      description: `Account locked by ${actor.id}: ${reason}`,
      metadata: { type, reason, lockedBy: actor.id },
    });

    revalidatePath("/dashboard/identity/security");
    revalidatePath("/dashboard/identity/users");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

// ============================================================================
// Password Management Actions
// ============================================================================

export async function adminResetPasswordAction(
  userId: string,
  newPassword: string,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { actor } = await requirePermission("identity.identity.manage");
    await passwordResetService.adminResetPassword(userId, newPassword, actor.id);
    revalidatePath("/dashboard/identity/security");
    revalidatePath("/dashboard/identity/users");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function generateTemporaryPasswordAction(userId: string): Promise<{
  success: boolean;
  data?: { temporaryPassword: string };
  error?: string;
}> {
  try {
    const { actor } = await requirePermission("identity.identity.manage");
    const tempPassword = await passwordResetService.generateTemporaryPassword();
    await passwordResetService.adminResetPassword(userId, tempPassword, actor.id);
    return { success: true, data: { temporaryPassword: tempPassword } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function forcePasswordChangeAction(userId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { actor } = await requirePermission("identity.identity.manage");
    await passwordResetService.forcePasswordChange(userId, actor.id);
    revalidatePath("/dashboard/identity/security");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function requestPasswordResetAction(email: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const result = await passwordResetService.requestPasswordReset(
      email,
      "127.0.0.1",
      "server",
    );
    return { success: result.success, message: result.message };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function resetPasswordAction(
  token: string,
  newPassword: string,
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const result = await passwordResetService.resetPassword(
      token,
      newPassword,
      "127.0.0.1",
      "client",
    );
    return { success: result.success, message: result.message };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function validateResetTokenAction(token: string): Promise<{
  success: boolean;
  data?: { valid: boolean; userId?: string; email?: string };
  error?: string;
}> {
  try {
    const result = await passwordResetService.validateResetToken(token);
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

// ============================================================================
// Device Management Actions
// ============================================================================

export async function getTrustedDevicesAction(userId: string): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    await requirePermission("identity.identity.view");
    const devices = await deviceService.getTrustedDevices(userId);
    return { success: true, data: devices };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function trustDeviceAction(userId: string, deviceId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { actor } = await requirePermission("identity.identity.manage");
    await deviceService.trustDevice(userId, deviceId);
    revalidatePath("/dashboard/identity/security");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function untrustDeviceAction(userId: string, deviceId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { actor } = await requirePermission("identity.identity.manage");
    await deviceService.untrustDevice(userId, deviceId);
    revalidatePath("/dashboard/identity/security");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function removeTrustedDeviceAction(userId: string, deviceId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { actor } = await requirePermission("identity.identity.manage");
    await deviceService.removeTrustedDevice(userId, deviceId);
    revalidatePath("/dashboard/identity/security");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function removeAllTrustedDevicesAction(userId: string): Promise<{
  success: boolean;
  data?: { removed: number };
  error?: string;
}> {
  try {
    const { actor } = await requirePermission("identity.identity.manage");
    const removed = await deviceService.removeAllTrustedDevices(userId);
    revalidatePath("/dashboard/identity/security");
    return { success: true, data: { removed } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function renameDeviceAction(userId: string, deviceId: string, name: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { actor } = await requirePermission("identity.identity.manage");
    await deviceService.renameDevice(userId, deviceId, name);
    revalidatePath("/dashboard/identity/security");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

// ============================================================================
// Security Events Actions
// ============================================================================

export async function getSecurityEventsAction(filters?: {
  userId?: string;
  eventType?: string;
  severity?: string;
  resolved?: boolean;
}): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    await requirePermission("identity.identity.view");
    const events = await securityEventService.getEvents(filters);
    return { success: true, data: events };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function resolveSecurityEventAction(
  eventId: string,
  resolvedNotes?: string,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { actor } = await requirePermission("identity.identity.manage");
    await securityEventService.resolveEvent(eventId, actor.id, resolvedNotes);
    revalidatePath("/dashboard/identity/security");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

// ============================================================================
// Failed Login Monitoring Actions
// ============================================================================

export async function getRecentFailedLoginsAction(limit = 50): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    await requirePermission("identity.identity.view");
    const failedLogins = await new (await import("@/features/auth/repositories/failed-login-repository")).FailedLoginRepository().getRecentAttempts(limit);
    return { success: true, data: failedLogins };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function resolveFailedLoginAction(
  failedLoginId: string,
  resolvedBy: string,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { actor } = await requirePermission("identity.identity.manage");
    const { FailedLoginRepository } = await import("@/features/auth/repositories/failed-login-repository");
    const repo = new FailedLoginRepository();
    await repo.resolveAttempt(failedLoginId, actor.id);
    revalidatePath("/dashboard/identity/security");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

// ============================================================================
// Account Status Actions
// ============================================================================

export async function suspendAccountAction(userId: string, reason?: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { actor } = await requirePermission("identity.identity.manage");
    const userRepo = new UserRepository();
    await userRepo.update(userId, { status: "suspended" } as never);

    await securityEventService.logEvent({
      userId,
      eventType: "account_suspended",
      severity: "high",
      title: "Account Suspended",
      description: `Account suspended by ${actor.id}: ${reason || "No reason provided"}`,
      metadata: { reason, suspendedBy: actor.id },
    });

    revalidatePath("/dashboard/identity/security");
    revalidatePath("/dashboard/identity/users");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function blockAccountAction(userId: string, reason?: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { actor } = await requirePermission("identity.identity.manage");
    const userRepo = new UserRepository();
    await userRepo.update(userId, { status: "blocked" } as never);

    await securityEventService.logEvent({
      userId,
      eventType: "account_suspended",
      severity: "critical",
      title: "Account Blocked",
      description: `Account blocked by ${actor.id}: ${reason || "No reason provided"}`,
      metadata: { reason, blockedBy: actor.id },
    });

    revalidatePath("/dashboard/identity/security");
    revalidatePath("/dashboard/identity/users");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function reactivateAccountAction(userId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { actor } = await requirePermission("identity.identity.manage");
    const userRepo = new UserRepository();
    await userRepo.update(userId, {
      status: "active",
      lockedUntil: null,
      failedLoginCount: 0,
    } as never);

    await securityEventService.logEvent({
      userId,
      eventType: "account_reactivated",
      severity: "medium",
      title: "Account Reactivated",
      description: `Account reactivated by ${actor.id}`,
      metadata: { reactivatedBy: actor.id },
    });

    revalidatePath("/dashboard/identity/security");
    revalidatePath("/dashboard/identity/users");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function archiveAccountAction(userId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { actor } = await requirePermission("identity.identity.manage");
    const userRepo = new UserRepository();
    await userRepo.delete(userId);

    await securityEventService.logEvent({
      userId,
      eventType: "account_deleted",
      severity: "high",
      title: "Account Archived (Soft Delete)",
      description: `Account archived by ${actor.id}`,
      metadata: { archivedBy: actor.id },
    });

    revalidatePath("/dashboard/identity/security");
    revalidatePath("/dashboard/identity/users");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}
