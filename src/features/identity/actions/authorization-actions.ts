"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/shared/lib/action-guard";
import { RoleManagementService } from "../services/role-management-service";
import { AuthorizationService } from "@/features/auth/services/authorization-service";
import {
  createRoleSchema,
  updateRoleSchema,
  cloneRoleSchema,
  assignRoleSchema,
  bulkPermissionSchema,
  resetRoleSchema,
  permissionMatrixSchema,
} from "../types/authorization-validation";
import { getAllPermissions, getModules, getPermissionGroups } from "@/shared/core/permission-registry";

const service = new RoleManagementService();

export async function getPermissionRegistryAction(): Promise<{
  success: boolean;
  data?: {
    modules: string[];
    permissions: Array<{
      module: string;
      resource: string;
      action: string;
      description: string;
      fullPermission: string;
    }>;
    totalCount: number;
    moduleGroups: Array<{
      module: string;
      description: string;
      permissions: Array<{ module: string; resource: string; action: string; description: string }>;
    }>;
  };
  error?: string;
}> {
  try {
    await requirePermission("identity.identity.view");

    const allPermissions = getAllPermissions();
    const modules = getModules();
    const moduleGroups = getPermissionGroups();

    return {
      success: true,
      data: {
        modules,
        permissions: allPermissions.map((p) => ({
          module: p.module,
          resource: p.resource,
          action: p.action,
          description: p.description,
          fullPermission: `${p.module}.${p.resource}.${p.action}`,
        })),
        totalCount: allPermissions.length,
        moduleGroups: moduleGroups.map((g) => ({
          module: g.module,
          description: g.description,
          permissions: g.permissions,
        })),
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function getPermissionMatrixAction(input?: unknown): Promise<{
  success: boolean;
  data?: {
    modules: string[];
    actions: string[];
    roles: Array<{
      id: string;
      name: string;
      description: string;
      permissions: string[];
      isSystem: boolean;
    }>;
    matrix: Record<string, Record<string, boolean>>;
  };
  error?: string;
}> {
  try {
    await requirePermission("identity.identity.view");
    const validated = permissionMatrixSchema.parse(input ?? {});
    const result = await service.getPermissionMatrix(validated.roleIds);
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function createRoleWithValidationAction(input: unknown): Promise<{
  success: boolean;
  data?: { id: string; name: string };
  error?: string;
}> {
  try {
    const { actor } = await requirePermission("identity.identity.manage");
    const validated = createRoleSchema.parse(input);
    const role = await service.createRole(validated.name, validated.description, validated.permissions, actor);
    revalidatePath("/dashboard/identity/roles");
    revalidatePath("/dashboard/identity/authorization");
    return { success: true, data: { id: role.id, name: role.name } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function updateRoleWithValidationAction(id: string, input: unknown): Promise<{
  success: boolean;
  data?: { id: string; name: string };
  error?: string;
}> {
  try {
    const { actor } = await requirePermission("identity.identity.manage");
    const validated = updateRoleSchema.parse(input);
    const role = await service.updateRole(id, validated, actor);
    revalidatePath("/dashboard/identity/roles");
    revalidatePath("/dashboard/identity/authorization");
    revalidatePath("/dashboard/identity/permissions");
    return { success: true, data: { id: role.id, name: role.name } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function deleteRoleAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { actor } = await requirePermission("identity.identity.manage");
    await service.deleteRole(id, actor);
    revalidatePath("/dashboard/identity/roles");
    revalidatePath("/dashboard/identity/authorization");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function cloneRoleAction(input: unknown): Promise<{
  success: boolean;
  data?: { id: string; name: string };
  error?: string;
}> {
  try {
    const { actor } = await requirePermission("identity.identity.manage");
    const validated = cloneRoleSchema.parse(input);
    const role = await service.cloneRole(validated.sourceRoleId, validated.newName, actor);
    revalidatePath("/dashboard/identity/roles");
    return { success: true, data: { id: role.id, name: role.name } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function grantAllPermissionsAction(roleId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { actor } = await requirePermission("identity.identity.manage");
    await service.grantAllPermissions(roleId, actor);
    revalidatePath("/dashboard/identity/permissions");
    revalidatePath("/dashboard/identity/roles");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function removeAllPermissionsAction(roleId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { actor } = await requirePermission("identity.identity.manage");
    await service.removeAllPermissions(roleId, actor);
    revalidatePath("/dashboard/identity/permissions");
    revalidatePath("/dashboard/identity/roles");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function copyPermissionsFromRoleAction(
  sourceId: string,
  targetId: string,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { actor } = await requirePermission("identity.identity.manage");
    await service.copyPermissionsFromRole(sourceId, targetId, actor);
    revalidatePath("/dashboard/identity/permissions");
    revalidatePath("/dashboard/identity/roles");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function resetRoleToDefaultAction(roleId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { actor } = await requirePermission("identity.identity.manage");
    await service.resetRoleToDefault(roleId, actor);
    revalidatePath("/dashboard/identity/permissions");
    revalidatePath("/dashboard/identity/roles");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function assignUserRoleAction(input: unknown): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { actor } = await requirePermission("identity.identity.manage");
    const validated = assignRoleSchema.parse(input);
    const auth = new AuthorizationService();
    await auth.assignRoleToUser(validated.userId, validated.roleName, actor.id, actor.role ?? "");
    revalidatePath("/dashboard/identity/users");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function getRolesWithUserCountsAction(): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    name: string;
    description: string;
    permissions: string[];
    isSystem: boolean;
    userCount: number;
  }>;
  error?: string;
}> {
  try {
    await requirePermission("identity.identity.view");
    const roles = await service.getRolesWithUserCounts();
    return { success: true, data: roles };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}
