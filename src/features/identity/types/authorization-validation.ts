import { z } from "zod";
import { isValidPermission } from "@/lib/core/permission-registry";

const permissionString = z.string().min(1, "Permission cannot be empty").refine(
  (val: string) => isValidPermission(val),
  { message: "Invalid permission string" },
);

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(1, "Role name is required")
    .max(50, "Role name must be 50 characters or less")
    .trim(),
  description: z.string().max(500, "Description must be 500 characters or less").default(""),
  permissions: z.array(permissionString).default([]),
});

export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(1, "Role name is required")
    .max(50, "Role name must be 50 characters or less")
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional(),
  permissions: z.array(permissionString).optional(),
});

export const assignRoleSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  roleName: z.string().min(1, "Role name is required").trim(),
});

export const bulkPermissionSchema = z.object({
  roleId: z.string().min(1, "Role ID is required"),
  permissions: z.array(permissionString),
});

export const cloneRoleSchema = z.object({
  sourceRoleId: z.string().min(1, "Source role ID is required"),
  newName: z
    .string()
    .min(1, "New role name is required")
    .max(50, "Role name must be 50 characters or less")
    .trim(),
});

export const resetRoleSchema = z.object({
  roleId: z.string().min(1, "Role ID is required"),
});

export const permissionMatrixSchema = z.object({
  roleIds: z.array(z.string()).optional(),
  module: z.string().optional(),
  search: z.string().optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
export type BulkPermissionInput = z.infer<typeof bulkPermissionSchema>;
export type CloneRoleInput = z.infer<typeof cloneRoleSchema>;
export type ResetRoleInput = z.infer<typeof resetRoleSchema>;
export type PermissionMatrixInput = z.infer<typeof permissionMatrixSchema>;
