/**
 * Security Types for IDENTITY-CENTER-001C
 * Enterprise Identity Lifecycle & Security Center
 */

import { BaseDBEntity } from "@/shared/lib/database/types";

// ============================================================================
// Device Types
// ============================================================================

export type DeviceType = "desktop" | "mobile" | "tablet" | "unknown";
export type DeviceOS = "windows" | "macos" | "linux" | "ios" | "android" | "unknown";
export type BrowserType = "chrome" | "firefox" | "safari" | "edge" | "opera" | "unknown";

export interface DeviceInfo {
  type: DeviceType;
  os: DeviceOS;
  browser: BrowserType;
  userAgent: string;
  ipAddress: string;
  location?: {
    country?: string;
    city?: string;
    timezone?: string;
  };
}

export interface TrustedDevice extends BaseDBEntity {
  userId: string;
  deviceId: string; // Hash of device fingerprint
  deviceInfo: DeviceInfo;
  name?: string; // User-assigned name
  isTrusted: boolean;
  lastUsedAt: Date;
  createdAt: Date;
  expiresAt?: Date | null;
  autoTrusted: boolean; // Auto-trusted by system
}

// ============================================================================
// Failed Login Types
// ============================================================================

export type FailedLoginReason = 
  | "invalid_credentials"
  | "account_locked"
  | "account_suspended"
  | "account_not_found"
  | "rate_limited"
  | "verification_required"
  | "unknown";

export interface FailedLoginAttempt extends BaseDBEntity {
  identifier: string; // Email, username, or phone used
  ipAddress: string;
  userAgent: string;
  deviceInfo?: Partial<DeviceInfo>;
  reason: FailedLoginReason;
  attemptCount: number; // Consecutive attempts from same IP/identifier
  lastAttemptAt: Date;
  resolvedAt?: Date | null;
  resolvedBy?: string | null;
}

// ============================================================================
// Account Lockout Types
// ============================================================================

export type LockoutType = "temporary" | "permanent";
export type LockoutReason = 
  | "max_failed_attempts"
  | "manual_lock"
  | "suspicious_activity"
  | "admin_action"
  | "verification_failed";

export interface AccountLockout extends BaseDBEntity {
  userId: string;
  type: LockoutType;
  reason: LockoutReason;
  lockedAt: Date;
  unlockedAt?: Date | null;
  unlocksAt?: Date | null; // For temporary lockouts
  lockedBy?: string | null; // User ID or "system"
  unlockedBy?: string | null;
  notes?: string;
}

// ============================================================================
// Security Event Types
// ============================================================================

export type SecurityEventSeverity = "low" | "medium" | "high" | "critical";
export type SecurityEventType = 
  | "login_success"
  | "login_failed"
  | "login_locked_out"
  | "password_changed"
  | "password_reset_requested"
  | "password_reset_completed"
  | "account_locked"
  | "account_unlocked"
  | "account_suspended"
  | "account_reactivated"
  | "account_deleted"
  | "new_device_detected"
  | "device_trusted"
  | "device_untrusted"
  | "session_created"
  | "session_terminated"
  | "session_expired"
  | "multiple_sessions_detected"
  | "role_changed"
  | "permission_changed"
  | "verification_sent"
  | "verification_completed"
  | "suspicious_activity"
  | "rate_limit_exceeded"
  | "brute_force_detected";

export interface SecurityEvent extends BaseDBEntity {
  userId?: string | null; // Null for system events
  eventType: SecurityEventType;
  severity: SecurityEventSeverity;
  title: string;
  description?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: Partial<DeviceInfo>;
  resolved: boolean;
  resolvedAt?: Date | null;
  resolvedBy?: string | null;
  resolvedNotes?: string;
}

// ============================================================================
// Recovery Token Types
// ============================================================================

export type RecoveryTokenType = "password_reset" | "email_verification" | "phone_verification" | "account_recovery";
export type RecoveryTokenStatus = "pending" | "used" | "expired" | "revoked";

export interface RecoveryToken extends BaseDBEntity {
  userId: string;
  email: string;
  token: string; // Hashed token
  tokenHash: string; // For verification
  type: RecoveryTokenType;
  status: RecoveryTokenStatus;
  expiresAt: Date;
  usedAt?: Date | null;
  usedByIp?: string;
  usedByUserAgent?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

// ============================================================================
// Password Reset Types
// ============================================================================

export interface PasswordResetRequest extends BaseDBEntity {
  userId: string;
  email: string;
  recoveryTokenId: string;
  requestedAt: Date;
  requestedFromIp: string;
  requestedFromUserAgent: string;
  completedAt?: Date | null;
  completedFromIp?: string;
  oldPasswordHash?: string; // For audit
  newPasswordHash?: string; // For audit (hashed)
}

// ============================================================================
// Security Dashboard Types
// ============================================================================

export interface SecurityDashboardStats {
  activeUsers: number;
  loggedInUsers: number;
  failedLoginAttempts: number;
  lockedAccounts: number;
  suspendedUsers: number;
  blockedUsers: number;
  pendingVerifications: number;
  passwordResetRequests: number;
  activeSessions: number;
  trustedDevices: number;
  newDevicesToday: number;
  securityEvents: {
    total: number;
    bySeverity: Record<SecurityEventSeverity, number>;
    byType: Record<SecurityEventType, number>;
    unresolved: number;
  };
  recentEvents: Array<{
    id: string;
    eventType: SecurityEventType;
    severity: SecurityEventSeverity;
    title: string;
    userId?: string;
    userName?: string;
    timestamp: Date;
    resolved: boolean;
  }>;
  recentFailedLogins: Array<{
    id: string;
    identifier: string;
    ipAddress: string;
    reason: FailedLoginReason;
    attemptCount: number;
    lastAttemptAt: Date;
  }>;
  recentLockouts: Array<{
    id: string;
    userId: string;
    userName: string;
    type: LockoutType;
    reason: LockoutReason;
    lockedAt: Date;
    unlocksAt?: Date | null;
  }>;
}

// ============================================================================
// Security Settings Types
// ============================================================================

export interface SecuritySettings {
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireNumber: boolean;
  passwordRequireSpecial: boolean;
  passwordExpirationDays: number | null;
  sessionTimeoutMinutes: number;
  rememberMeSessionDays: number;
  maxConcurrentSessions: number | null;
  autoTrustDevices: boolean;
  securityEventRetentionDays: number;
  failedLoginRetentionDays: number;
  enable2FA: boolean;
  rateLimitLoginAttempts: number;
  rateLimitWindowMinutes: number;
}

export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  maxLoginAttempts: 5,
  lockoutDurationMinutes: 30,
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireNumber: true,
  passwordRequireSpecial: true,
  passwordExpirationDays: null,
  sessionTimeoutMinutes: 24 * 60, // 24 hours
  rememberMeSessionDays: 30,
  maxConcurrentSessions: null,
  autoTrustDevices: false,
  securityEventRetentionDays: 90,
  failedLoginRetentionDays: 30,
  enable2FA: false,
  rateLimitLoginAttempts: 10,
  rateLimitWindowMinutes: 5,
};

// ============================================================================
// Notification Event Types
// ============================================================================

export type SecurityNotificationType = 
  | "new_login"
  | "new_device_login"
  | "password_changed"
  | "password_reset"
  | "account_locked"
  | "account_unlocked"
  | "account_suspended"
  | "account_reactivated"
  | "role_changed";

export interface SecurityNotification {
  userId: string;
  type: SecurityNotificationType;
  title: string;
  message: string;
  data: Record<string, unknown>;
  sentAt: Date;
  delivered: boolean;
  deliveredAt?: Date | null;
  deliveryMethod: "email" | "sms" | "push" | "in_app";
}
