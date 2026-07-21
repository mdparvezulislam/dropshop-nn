export interface PermissionDefinition {
  domain: string;
  action: string;
  description: string;
}

export const PERMISSION_DOMAINS = [
  "Product",
  "Pricing",
  "Inventory",
  "Order",
  "Customer",
  "Reseller",
  "Wholesaler",
  "Supplier",
  "User",
  "Report",
  "Analytics",
  "Settings",
  "Notification",
  "Finance",
  "Content",
  "Identity",
] as const;

export type PermissionDomain = (typeof PERMISSION_DOMAINS)[number];

export const PERMISSION_ACTIONS = [
  "Create",
  "View",
  "Update",
  "Delete",
  "Publish",
  "Archive",
  "Suspend",
  "Approve",
  "Reject",
  "Override",
  "Export",
  "Import",
  "Assign",
  "Transfer",
  "Sessions",
  "Manage",
] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export function buildPermission(domain: string, action: string): string {
  return `${domain}.${action}`;
}

export function parsePermission(permission: string): { domain: string; action: string } | null {
  const parts = permission.split(".");
  if (parts.length !== 2) return null;
  return { domain: parts[0], action: parts[1] };
}

export interface RoleDefinition {
  name: string;
  description: string;
  permissions: string[];
  isSystem?: boolean;
  parentRole?: string;
}

export const SYSTEM_ROLES: RoleDefinition[] = [
  {
    name: "Super Admin",
    description: "Full system access including configuration",
    permissions: ["*"],
    isSystem: true,
  },
  {
    name: "Admin",
    description: "Full platform operational control",
    permissions: [
      "Product.Create",
      "Product.View",
      "Product.Update",
      "Product.Delete",
      "Product.Publish",
      "Product.Archive",
      "Supplier.Create",
      "Supplier.View",
      "Supplier.Update",
      "Supplier.Suspend",
      "Inventory.View",
      "Inventory.Update",
      "Inventory.Adjust",
      "Inventory.Transfer",
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
      "User.View",
      "User.Update",
      "Report.View",
      "Report.Export",
      "Analytics.View",
      "Settings.View",
      "Settings.Update",
      "Notification.View",
      "Notification.Create",
      "Notification.Update",
      "Notification.Delete",
      "Notification.Export",
      "Content.Create",
      "Content.View",
      "Content.Update",
      "Content.Delete",
      "Content.Publish",
      "Content.Archive",
      "Identity.View",
      "Identity.Create",
      "Identity.Update",
      "Identity.Approve",
      "Identity.Reject",
      "Identity.Suspend",
      "Identity.Sessions",
      "User.Create",
      "User.View",
      "User.Update",
      "User.Delete",
    ],
    isSystem: true,
  },
  {
    name: "Manager",
    description: "Operational control over assigned modules",
    permissions: [
      "Product.Create",
      "Product.View",
      "Product.Update",
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
      "Report.View",
      "Content.Create",
      "Content.View",
      "Content.Update",
      "Content.Publish",
      "Identity.View",
      "Identity.Approve",
      "Identity.Reject",
      "User.View",
      "Settings.View",
    ],
    isSystem: true,
  },
  {
    name: "Reseller",
    description: "Reseller with private catalog access",
    permissions: [
      "Product.View",
      "Pricing.View",
      "Reseller.View",
      "Reseller.Update",
      "Order.Create",
      "Order.View",
      "Order.Cancel",
      "Customer.View",
      "Customer.Manage",
      "Finance.View",
      "Analytics.View",
      "Notification.View",
    ],
  },
  {
    name: "Supplier",
    description: "Supplier with own product and inventory access",
    permissions: [
      "Product.Create",
      "Product.View",
      "Product.Update",
      "Inventory.View",
      "Inventory.Update",
      "Pricing.View",
      "Order.View",
    ],
  },
  {
    name: "Customer",
    description: "Registered buyer",
    permissions: ["Product.View", "Order.Create", "Order.View"],
  },
];
