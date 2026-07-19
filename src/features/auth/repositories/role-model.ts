import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/shared/lib/database/base-schema";
import { BaseDocument } from "@/shared/lib/database/types";

export interface RoleDBFields {
  name: string;
  description: string;
  permissions: string[];
}

export type RoleDocument = BaseDocument & RoleDBFields;

const roleSchema = new Schema<RoleDocument>(
  {
    name: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    permissions: [{ type: String, required: true }],
    ...baseFieldsDefinition,
  },
  baseSchemaOptions,
);

roleSchema.plugin(softDeletePlugin);

export const RoleModel = mongoose.models.Role || mongoose.model<RoleDocument>("Role", roleSchema);
export default RoleModel;
