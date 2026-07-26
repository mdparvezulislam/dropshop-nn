import { RoleRepository } from "../repositories/role-repository";
import { UserRepository } from "../repositories/user-repository";
import { logger } from "@/lib/utils/logger";
import {
  validatePermissions,
  isValidPermission,
  getAllPermissions,
} from "@/lib/core/permission-registry";
import { SYSTEM_ROLES } from "@/lib/core/permissions";
import { AuditLogger } from "@/lib/audit-logger";
import { ValidationError, ForbiddenError } from "@/lib/errors/app-error";

const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {};
for (const role of SYSTEM_ROLES) {
  DEFAULT_ROLE_PERMISSIONS[role.name] = role.permissions;
}

export class AuthorizationService {
  private readonly roleRepository: RoleRepository;
  private readonly userRepository: UserRepository;
  private static cachedRoles: Map<string, string[]> = new Map();

  constructor() {
    this.roleRepository = new RoleRepository();
    this.userRepository = new UserRepository();
  }

  async getPermissionsForRole(roleName: string): Promise<string[]> {
    if (AuthorizationService.cachedRoles.has(roleName)) {
      return AuthorizationService.cachedRoles.get(roleName) || [];
    }

    try {
      const role = await this.roleRepository.findByName(roleName);
      if (role) {
        AuthorizationService.cachedRoles.set(roleName, role.permissions);
        return role.permissions;
      }
    } catch (err) {
      logger.error("AuthorizationService: failed to fetch role permissions from database", err, {
        roleName,
      });
    }

    const fallback = DEFAULT_ROLE_PERMISSIONS[roleName] || [];
    AuthorizationService.cachedRoles.set(roleName, fallback);
    return fallback;
  }

  async hasPermission(roleName: string, requiredPermission: string): Promise<boolean> {
    const permissions = await this.getPermissionsForRole(roleName);
    if (permissions.includes("*")) return true;
    return permissions.includes(requiredPermission);
  }

  async hasAnyPermission(roleName: string, requiredPermissions: string[]): Promise<boolean> {
    const permissions = await this.getPermissionsForRole(roleName);
    if (permissions.includes("*")) return true;
    return requiredPermissions.some((p) => permissions.includes(p));
  }

  async hasAllPermissions(roleName: string, requiredPermissions: string[]): Promise<boolean> {
    const permissions = await this.getPermissionsForRole(roleName);
    if (permissions.includes("*")) return true;
    return requiredPermissions.every((p) => permissions.includes(p));
  }

  async isSuperAdmin(roleName: string): Promise<boolean> {
    if (roleName === "Super Admin" || roleName === "super_admin") return true;
    const permissions = await this.getPermissionsForRole(roleName);
    return permissions.includes("*");
  }

  async isAdmin(roleName: string): Promise<boolean> {
    if (await this.isSuperAdmin(roleName)) return true;
    const normalized = roleName
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");
    return normalized === "admin" || normalized.includes("admin");
  }

  validatePermissionsList(permissions: string[]): { valid: string[]; invalid: string[] } {
    return validatePermissions(permissions);
  }

  async preventPrivilegeEscalation(actorRole: string, targetPermissions: string[]): Promise<void> {
    if (await this.isSuperAdmin(actorRole)) return;

    const actorPermissions = await this.getPermissionsForRole(actorRole);
    if (actorPermissions.includes("*")) return;

    const unauthorized = targetPermissions.filter(
      (p) => !actorPermissions.includes(p) && p !== "*",
    );

    if (unauthorized.length > 0) {
      throw new ForbiddenError(
        `Cannot assign permissions you don't have: ${unauthorized.join(", ")}`,
      );
    }
  }

  async preventRoleEscalation(actorRole: string, targetRoleName: string): Promise<void> {
    if (await this.isSuperAdmin(actorRole)) return;

    const targetSystemRole = SYSTEM_ROLES.find((r) => r.name === targetRoleName);
    if (!targetSystemRole) return;

    if (targetSystemRole.permissions.includes("*")) {
      throw new ForbiddenError("Cannot assign Super Admin role");
    }

    if (targetSystemRole.isSystem) {
      const actorPermissions = await this.getPermissionsForRole(actorRole);
      if (!actorPermissions.includes("*")) {
        const targetPerms = targetSystemRole.permissions;
        const unauthorized = targetPerms.filter((p) => !actorPermissions.includes(p));
        if (unauthorized.length > 0) {
          throw new ForbiddenError(
            `Cannot assign role with permissions you don't have: ${unauthorized.slice(0, 5).join(", ")}`,
          );
        }
      }
    }
  }

  async assignRoleToUser(
    userId: string,
    newRoleName: string,
    actorId: string,
    actorRole: string,
  ): Promise<void> {
    await this.preventRoleEscalation(actorRole, newRoleName);

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ValidationError("User not found");
    }

    const oldRole = (user as { role?: string }).role;
    await this.userRepository.update(userId, { role: newRoleName } as never);

    AuthorizationService.clearCache();

    await AuditLogger.record({
      action: "user.role_assigned",
      entityType: "user",
      entityId: userId,
      actor: { id: actorId, role: actorRole },
      changes: [{ field: "role", oldValue: oldRole, newValue: newRoleName }],
    });
  }

  static clearCache(): void {
    AuthorizationService.cachedRoles.clear();
  }
}

export default AuthorizationService;
