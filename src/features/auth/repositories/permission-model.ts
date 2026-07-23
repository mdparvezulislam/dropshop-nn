import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/lib/database/base-schema";
import { BaseDocument } from "@/lib/database/types";

export interface PermissionDBFields {
  name: string;
  description: string;
}

export type PermissionDocument = BaseDocument & PermissionDBFields;

const permissionSchema = new Schema<PermissionDocument>(
  {
    name: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    ...baseFieldsDefinition,
  },
  baseSchemaOptions,
);

permissionSchema.plugin(softDeletePlugin);

export const PermissionModel =
  mongoose.models.Permission || mongoose.model<PermissionDocument>("Permission", permissionSchema);
export default PermissionModel;
