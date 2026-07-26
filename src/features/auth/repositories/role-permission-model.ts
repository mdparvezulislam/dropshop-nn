import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/lib/database/base-schema";
import { BaseDocument } from "@/lib/database/types";

export interface RolePermissionDBFields {
  roleName: string;
  permissionName: string;
  grantedBy?: string;
  grantedAt?: Date;
}

export type RolePermissionDocument = BaseDocument & RolePermissionDBFields;

const rolePermissionSchema = new Schema<RolePermissionDocument>(
  {
    roleName: { type: String, required: true, index: true },
    permissionName: { type: String, required: true, index: true },
    grantedBy: { type: String, default: "system" },
    grantedAt: { type: Date, default: Date.now },
    ...baseFieldsDefinition,
  },
  baseSchemaOptions,
);

rolePermissionSchema.plugin(softDeletePlugin);
rolePermissionSchema.index({ roleName: 1, permissionName: 1 }, { unique: true });

export const RolePermissionModel =
  mongoose.models.RolePermission ||
  mongoose.model<RolePermissionDocument>("RolePermission", rolePermissionSchema);

export default RolePermissionModel;
