import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/lib/database/base-schema";
import { BaseDocument } from "@/lib/database/types";

export interface UserSessionDBFields {
  token: string;
  userId: string;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
}

export type UserSessionDocument = BaseDocument & UserSessionDBFields;

const userSessionSchema = new Schema<UserSessionDocument>(
  {
    token: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    ...baseFieldsDefinition,
  },
  baseSchemaOptions,
);

userSessionSchema.plugin(softDeletePlugin);

export const UserSessionModel =
  mongoose.models.UserSession ||
  mongoose.model<UserSessionDocument>("UserSession", userSessionSchema);
export default UserSessionModel;
