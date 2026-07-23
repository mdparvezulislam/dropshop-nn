import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/lib/database/base-schema";
import { BaseDocument } from "@/lib/database/types";

export interface LoginHistoryItem {
  ip: string;
  userAgent: string;
  loggedAt: Date;
}

export interface UserDBFields {
  username: string;
  email: string;
  phone: string;
  fullName: string;
  passwordHash: string;
  role: string; // Controls system permissions (e.g. admin, super_admin, staff, viewer)
  memberships: string[]; // Controls business capabilities (e.g. ["customer", "reseller", "wholesaler"])
  status: "active" | "pending" | "suspended" | "blocked";
  profileImage?: string;
  emailVerifiedAt?: Date | null;
  phoneVerifiedAt?: Date | null;
  lastLoginAt?: Date | null;
  loginHistory: LoginHistoryItem[];
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

export type UserDocument = BaseDocument & UserDBFields;

const { status: _, ...userBaseFields } = baseFieldsDefinition;

const userSchema = new Schema<UserDocument>(
  {
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, index: true },
    memberships: { type: [String], default: ["customer"], index: true },
    status: {
      type: String,
      enum: ["active", "pending", "suspended", "blocked"],
      default: "pending",
      index: true,
    },
    profileImage: { type: String, required: false },
    emailVerifiedAt: { type: Date, default: null, required: false },
    phoneVerifiedAt: { type: Date, default: null, required: false },
    lastLoginAt: { type: Date, default: null, required: false },
    loginHistory: [
      {
        ip: { type: String, required: true },
        userAgent: { type: String, required: true },
        loggedAt: { type: Date, default: Date.now, required: true },
      },
    ],
    // Security fields
    failedLoginCount: { type: Number, default: 0, min: 0, index: true },
    lastFailedLoginAt: { type: Date, default: null, required: false },
    lastFailedLoginIp: { type: String, default: null, required: false },
    lockedUntil: { type: Date, default: null, required: false, index: true },
    passwordLastChangedAt: { type: Date, default: null, required: false },
    passwordResetToken: { type: String, default: null, required: false, index: true },
    passwordResetTokenExpiresAt: { type: Date, default: null, required: false, index: true },
    mustChangePassword: { type: Boolean, default: false, required: true, index: true },
    trustedDevices: [{ type: String, default: [], required: false, index: true }],
    ...userBaseFields,
  },
  baseSchemaOptions,
);

userSchema.plugin(softDeletePlugin);

// Compound indexes for security queries
userSchema.index({ status: 1, lockedUntil: 1 });
userSchema.index({ failedLoginCount: 1, lastFailedLoginAt: -1 });
userSchema.index({ "loginHistory.loggedAt": -1 });

export const UserModel = mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
