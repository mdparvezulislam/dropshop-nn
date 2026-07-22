import { BaseDBEntity } from "@/shared/lib/database/types";

export interface LoginHistoryEntry {
  ip: string;
  userAgent: string;
  loggedAt: Date;
}

export interface User extends BaseDBEntity {
  username: string;
  email: string;
  phone: string;
  fullName: string;
  passwordHash: string;
  role: string;
  status: "active" | "pending" | "suspended" | "blocked";
  profileImage?: string;
  emailVerifiedAt?: Date | null;
  phoneVerifiedAt?: Date | null;
  lastLoginAt?: Date | null;
  loginHistory: LoginHistoryEntry[];
  // Security fields
  failedLoginCount: number;
  lastFailedLoginAt?: Date | null;
  lastFailedLoginIp?: string;
  lockedUntil?: Date | null;
  passwordLastChangedAt?: Date | null;
  passwordResetToken?: string;
  passwordResetTokenExpiresAt?: Date | null;
  mustChangePassword: boolean;
  trustedDevices: string[];
}

export default User;
