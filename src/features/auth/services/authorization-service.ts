import { RoleRepository } from "../repositories/role-repository";
import { logger } from "@/shared/utils/logger";

const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  "Super Admin": ["*"],
  Admin: [
    "Product.Create",
    "Product.Update",
    "Product.View",
    "Product.Delete",
    "Order.View",
    "Order.Update",
    "Order.Delete",
    "User.Create",
    "User.Update",
    "User.View",
  ],
  Manager: ["Product.Create", "Product.Update", "Product.View", "Order.View", "Order.Update"],
  Staff: ["Product.View", "Order.View", "Order.Update"],
  Supplier: ["Product.Create", "Product.Update", "Product.View", "Order.View", "Order.Update"],
  Reseller: ["Product.View", "Order.Create", "Order.View"],
  Customer: ["Product.View", "Order.Create", "Order.View"],
  Support: ["Product.View", "Order.View", "User.View"],
  Accountant: ["Order.View", "Invoice.View", "Report.View"],
};

export class AuthorizationService {
  private readonly roleRepository: RoleRepository;
  private static cachedRoles: Map<string, string[]> = new Map();

  constructor() {
    this.roleRepository = new RoleRepository();
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
    return fallback;
  }

  async hasPermission(roleName: string, requiredPermission: string): Promise<boolean> {
    const permissions = await this.getPermissionsForRole(roleName);

    if (permissions.includes("*")) {
      return true;
    }

    return permissions.includes(requiredPermission);
  }

  static clearCache(): void {
    AuthorizationService.cachedRoles.clear();
  }
}

export default AuthorizationService;
