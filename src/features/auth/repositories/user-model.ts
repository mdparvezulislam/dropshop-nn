import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/shared/lib/database/base-schema";
import { BaseDocument } from "@/shared/lib/database/types";

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
  role: string;
  status: "active" | "pending" | "suspended";
  profileImage?: string;
  emailVerifiedAt?: Date | null;
  phoneVerifiedAt?: Date | null;
  lastLoginAt?: Date | null;
  loginHistory: LoginHistoryItem[];
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
    status: {
      type: String,
      enum: ["active", "pending", "suspended"],
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
    ...userBaseFields,
  },
  baseSchemaOptions,
);

userSchema.plugin(softDeletePlugin);

export const UserModel = mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);
export default UserModel;
