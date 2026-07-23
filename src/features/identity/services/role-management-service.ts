import { RoleRepository } from "@/features/auth/repositories/role-repository";
import { AuthorizationService } from "@/features/auth/services/authorization-service";
import {
  validatePermissions,
  getAllPermissions,
  getModules,
  getPermissionGroups,
} from "@/lib/core/permission-registry";
import { SYSTEM_ROLES, type RoleDefinition } from "@/lib/core/permissions";
import { AuditLogger } from "@/lib/audit-logger";
import { logger } from "@/lib/utils/logger";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from "@/lib/errors/app-error";
import type { Role } from "@/features/auth/domain/role-entity";

export class RoleManagementService {
  private readonly roleRepository: RoleRepository;
  private readonly authorizationService: AuthorizationService;

  constructor() {
    this.roleRepository = new RoleRepository();
    this.authorizationService = new AuthorizationService();
  }

  async createRole(
    name: string,
    description: string,
    permissions: string[],
    actor: { id: string; role?: string },
  ): Promise<Role> {
    const existing = await this.roleRepository.findByName(name);
    if (existing) {
      throw new ConflictError(`Role "${name}" already exists`);
    }

    if (actor.role) {
      await this.authorizationService.preventPrivilegeEscalation(actor.role, permissions);
    }

    const { valid, invalid } = validatePermissions(permissions);
    if (invalid.length > 0) {
      throw new ValidationError(`Invalid permissions: ${invalid.join(", ")}`);
    }

    const role = await this.roleRepository.create({
      name,
      description: description || `Custom role: ${name}`,
      permissions: valid,
    });

    AuthorizationService.clearCache();

    await AuditLogger.record({
      action: "role.created",
      entityType: "role",
      entityId: role.id,
      actor: { id: actor.id, role: actor.role },
      changes: [
        { field: "name", oldValue: undefined, newValue: name },
        { field: "permissions", oldValue: undefined, newValue: valid.join(", ") },
      ],
    });

    return role;
  }

  async updateRole(
    id: string,
    data: { name?: string; description?: string; permissions?: string[] },
    actor: { id: string; role?: string },
  ): Promise<Role> {
    const existing = await this.roleRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Role not found");
    }

    const systemRole = SYSTEM_ROLES.find(
      (r) => r.name.toLowerCase() === existing.name.toLowerCase(),
    );
    if (systemRole && data.permissions && actor.role !== "Super Admin" && actor.role !== "super_admin") {
      throw new ForbiddenError("Cannot modify system role permissions");
    }

    if (data.name && data.name !== existing.name) {
      const duplicate = await this.roleRepository.findByName(data.name);
      if (duplicate) {
        throw new ConflictError(`Role "${data.name}" already exists`);
      }
    }

    if (data.permissions && actor.role) {
      await this.authorizationService.preventPrivilegeEscalation(actor.role, data.permissions);
    }

    if (data.permissions) {
      const { valid, invalid } = validatePermissions(data.permissions);
      if (invalid.length > 0) {
        throw new ValidationError(`Invalid permissions: ${invalid.join(", ")}`);
      }
      data.permissions = valid;
    }

    const oldPermissions = existing.permissions;
    const updated = await this.roleRepository.update(id, data as never);

    AuthorizationService.clearCache();

    const changes: { field: string; oldValue: unknown; newValue: unknown }[] = [];
    if (data.name) changes.push({ field: "name", oldValue: existing.name, newValue: data.name });
    if (data.description !== undefined) changes.push({ field: "description", oldValue: existing.description, newValue: data.description });
    if (data.permissions) changes.push({ field: "permissions", oldValue: oldPermissions.join(", "), newValue: data.permissions.join(", ") });

    await AuditLogger.record({
      action: "role.updated",
      entityType: "role",
      entityId: id,
      actor: { id: actor.id, role: actor.role },
      changes,
    });

    return updated;
  }

  async deleteRole(id: string, actor: { id: string; role?: string }): Promise<void> {
    const existing = await this.roleRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Role not found");
    }

    const systemRole = SYSTEM_ROLES.find(
      (r) => r.name.toLowerCase() === existing.name.toLowerCase(),
    );
    if (systemRole) {
      throw new ForbiddenError("Cannot delete system role");
    }

    await this.roleRepository.delete(id);
    AuthorizationService.clearCache();

    await AuditLogger.record({
      action: "role.deleted",
      entityType: "role",
      entityId: id,
      actor: { id: actor.id, role: actor.role },
      changes: [{ field: "name", oldValue: existing.name, newValue: undefined }],
    });
  }

  async cloneRole(
    sourceRoleId: string,
    newName: string,
    actor: { id: string; role?: string },
  ): Promise<Role> {
    const source = await this.roleRepository.findById(sourceRoleId);
    if (!source) {
      throw new NotFoundError("Source role not found");
    }

    const existing = await this.roleRepository.findByName(newName);
    if (existing) {
      throw new ConflictError(`Role "${newName}" already exists`);
    }

    if (actor.role) {
      await this.authorizationService.preventPrivilegeEscalation(actor.role, source.permissions);
    }

    const cloned = await this.roleRepository.create({
      name: newName,
      description: `Cloned from ${source.name}`,
      permissions: [...source.permissions],
    });

    AuthorizationService.clearCache();

    await AuditLogger.record({
      action: "role.cloned",
      entityType: "role",
      entityId: cloned.id,
      actor: { id: actor.id, role: actor.role },
      changes: [
        { field: "sourceRole", oldValue: source.name, newValue: newName },
        { field: "permissions", oldValue: undefined, newValue: source.permissions.join(", ") },
      ],
    });

    return cloned;
  }

  async grantAllPermissions(
    roleId: string,
    actor: { id: string; role?: string },
  ): Promise<Role> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) throw new NotFoundError("Role not found");

    const systemRole = SYSTEM_ROLES.find(
      (r) => r.name.toLowerCase() === role.name.toLowerCase(),
    );
    if (systemRole) {
      throw new ForbiddenError("Cannot modify system role permissions");
    }

    const allPermissions = getAllPermissions().map(
      (p) => `${p.module}.${p.resource}.${p.action}`,
    );

    const updated = await this.roleRepository.update(roleId, {
      permissions: allPermissions,
    } as never);

    AuthorizationService.clearCache();

    await AuditLogger.record({
      action: "role.permissions_granted_all",
      entityType: "role",
      entityId: roleId,
      actor: { id: actor.id, role: actor.role },
      changes: [{ field: "permissions", oldValue: role.permissions.join(", "), newValue: "ALL" }],
    });

    return updated;
  }

  async removeAllPermissions(
    roleId: string,
    actor: { id: string; role?: string },
  ): Promise<Role> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) throw new NotFoundError("Role not found");

    const systemRole = SYSTEM_ROLES.find(
      (r) => r.name.toLowerCase() === role.name.toLowerCase(),
    );
    if (systemRole) {
      throw new ForbiddenError("Cannot modify system role permissions");
    }

    const updated = await this.roleRepository.update(roleId, {
      permissions: [],
    } as never);

    AuthorizationService.clearCache();

    await AuditLogger.record({
      action: "role.permissions_removed_all",
      entityType: "role",
      entityId: roleId,
      actor: { id: actor.id, role: actor.role },
      changes: [{ field: "permissions", oldValue: role.permissions.join(", "), newValue: "NONE" }],
    });

    return updated;
  }

  async copyPermissionsFromRole(
    sourceRoleId: string,
    targetRoleId: string,
    actor: { id: string; role?: string },
  ): Promise<Role> {
    const source = await this.roleRepository.findById(sourceRoleId);
    if (!source) throw new NotFoundError("Source role not found");

    const target = await this.roleRepository.findById(targetRoleId);
    if (!target) throw new NotFoundError("Target role not found");

    const targetSystemRole = SYSTEM_ROLES.find(
      (r) => r.name.toLowerCase() === target.name.toLowerCase(),
    );
    if (targetSystemRole) {
      throw new ForbiddenError("Cannot modify system role permissions");
    }

    if (actor.role) {
      await this.authorizationService.preventPrivilegeEscalation(actor.role, source.permissions);
    }

    const updated = await this.roleRepository.update(targetRoleId, {
      permissions: [...source.permissions],
    } as never);

    AuthorizationService.clearCache();

    await AuditLogger.record({
      action: "role.permissions_copied",
      entityType: "role",
      entityId: targetRoleId,
      actor: { id: actor.id, role: actor.role },
      changes: [
        { field: "sourceRole", oldValue: undefined, newValue: source.name },
        { field: "permissions", oldValue: target.permissions.join(", "), newValue: source.permissions.join(", ") },
      ],
    });

    return updated;
  }

  async resetRoleToDefault(
    roleId: string,
    actor: { id: string; role?: string },
  ): Promise<Role> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) throw new NotFoundError("Role not found");

    const systemDef = SYSTEM_ROLES.find(
      (r) => r.name.toLowerCase() === role.name.toLowerCase(),
    );
    if (!systemDef) {
      throw new ForbiddenError("Can only reset system roles to defaults");
    }

    const updated = await this.roleRepository.update(roleId, {
      permissions: [...systemDef.permissions],
    } as never);

    AuthorizationService.clearCache();

    await AuditLogger.record({
      action: "role.reset_to_default",
      entityType: "role",
      entityId: roleId,
      actor: { id: actor.id, role: actor.role },
      changes: [
        { field: "permissions", oldValue: role.permissions.join(", "), newValue: systemDef.permissions.join(", ") },
      ],
    });

    return updated;
  }

  async getPermissionMatrix(roleIds?: string[]): Promise<{
    modules: string[];
    actions: string[];
    roles: Array<{ id: string; name: string; description: string; permissions: string[]; isSystem: boolean }>;
    matrix: Record<string, Record<string, boolean>>;
  }> {
    const groups = getPermissionGroups();
    const allModules = groups.map((g) => g.module);

    const allActions = new Set<string>();
    for (const group of groups) {
      for (const perm of group.permissions) {
        allActions.add(perm.action);
      }
    }
    const sortedActions = Array.from(allActions).sort();

    let dbRoles = await this.roleRepository.find({ isDeleted: { $ne: true } } as never);
    if (roleIds && roleIds.length > 0) {
      dbRoles = dbRoles.filter((r) => roleIds.includes(r.id));
    }

    const roles = [
      ...SYSTEM_ROLES.map((r) => ({
        id: `system:${r.name}`,
        name: r.name,
        description: r.description,
        permissions: r.permissions,
        isSystem: true,
      })),
      ...dbRoles.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        permissions: r.permissions,
        isSystem: false,
      })),
    ];

    const matrix: Record<string, Record<string, boolean>> = {};
    for (const role of roles) {
      matrix[role.id] = {};
      for (const mod of allModules) {
        for (const action of sortedActions) {
          const perm = `${mod}.${action}`;
          matrix[role.id][perm] =
            role.permissions.includes("*") || role.permissions.includes(perm);
        }
      }
    }

    return {
      modules: allModules,
      actions: sortedActions,
      roles,
      matrix,
    };
  }

  async getAllPermissions(): Promise<{
    modules: string[];
    permissions: Array<{ module: string; resource: string; action: string; description: string; fullPermission: string }>;
    totalCount: number;
  }> {
    const allPermissions = getAllPermissions();
    const modules = getModules();

    return {
      modules,
      permissions: allPermissions.map((p) => ({
        module: p.module,
        resource: p.resource,
        action: p.action,
        description: p.description,
        fullPermission: `${p.module}.${p.resource}.${p.action}`,
      })),
      totalCount: allPermissions.length,
    };
  }

  async getRolesWithUserCounts(): Promise<
    Array<{ id: string; name: string; description: string; permissions: string[]; isSystem: boolean; userCount: number }>
  > {
    const dbRoles = await this.roleRepository.find({ isDeleted: { $ne: true } } as never);

    const rolesWithCounts: Array<{
      id: string;
      name: string;
      description: string;
      permissions: string[];
      isSystem: boolean;
      userCount: number;
    }> = [];

    for (const role of [...SYSTEM_ROLES, ...dbRoles.map((r) => ({ name: r.name, description: r.description, permissions: r.permissions, isSystem: false }))]) {
      let userCount = 0;
      try {
        const { UserRepository } = await import("@/features/auth/repositories/user-repository");
        const userRepo = new UserRepository();
        userCount = await userRepo.count({ role: role.name, isDeleted: { $ne: true } } as never);
      } catch {
        userCount = 0;
      }

      rolesWithCounts.push({
        id: role.isSystem ? `system:${role.name}` : dbRoles.find((r) => r.name === role.name)?.id ?? "",
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        isSystem: role.isSystem ?? false,
        userCount,
      });
    }

    return rolesWithCounts;
  }
}

export default RoleManagementService;
