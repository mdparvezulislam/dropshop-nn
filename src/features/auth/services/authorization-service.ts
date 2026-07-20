import { RoleRepository } from "../repositories/role-repository";
import { logger } from "@/shared/utils/logger";

const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  "Super Admin": ["*"],
  Admin: [
    "Product.Create",
    "Product.Update",
    "Product.View",
    "Product.Delete",
    "Product.Publish",
    "Product.Archive",
    "Supplier.Create",
    "Supplier.Update",
    "Supplier.View",
    "Supplier.Suspend",
    "Inventory.View",
    "Inventory.Update",
    "Inventory.Adjust",
    "Pricing.View",
    "Pricing.Update",
    "Pricing.Override",
    "Reseller.Create",
    "Reseller.View",
    "Reseller.Update",
    "Reseller.Suspend",
    "Order.Create",
    "Order.View",
    "Order.Update",
    "Order.Delete",
    "Order.Cancel",
    "Order.AssignCourier",
    "Order.UpdateTracking",
    "Order.ProcessReturn",
    "Order.Refund",
    "User.Create",
    "User.Update",
    "User.View",
  ],
  Manager: [
    "Product.Create",
    "Product.Update",
    "Product.View",
    "Supplier.View",
    "Inventory.View",
    "Inventory.Update",
    "Inventory.Adjust",
    "Pricing.View",
    "Pricing.Update",
    "Reseller.Create",
    "Reseller.View",
    "Reseller.Update",
    "Reseller.Suspend",
    "Order.View",
    "Order.Update",
    "Order.Cancel",
    "Order.AssignCourier",
    "Order.UpdateTracking",
  ],
  Staff: [
    "Product.View",
    "Inventory.View",
    "Inventory.Update",
    "Pricing.View",
    "Reseller.View",
    "Order.View",
    "Order.Update",
  ],
  Supplier: [
    "Product.Create",
    "Product.Update",
    "Product.View",
    "Inventory.View",
    "Inventory.Update",
    "Pricing.View",
    "Order.View",
    "Order.Update",
  ],
  Reseller: [
    "Product.View",
    "Pricing.View",
    "Reseller.View",
    "Reseller.Update",
    "Order.Create",
    "Order.View",
    "Order.Cancel",
  ],
  Customer: ["Product.View", "Order.Create", "Order.View", "Order.Cancel"],
  Support: ["Product.View", "Inventory.View", "Order.View", "User.View"],
  Accountant: ["Order.View", "Invoice.View", "Report.View", "Pricing.View"],
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
