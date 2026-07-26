import {
  registerModules,
  freezeRegistry,
  buildModulePermissions,
  type ModulePermissionGroup,
} from "./permission-registry";

// ---------------------------------------------------------------------------
// Backward-compatible types (kept for existing consumers)
// ---------------------------------------------------------------------------

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

/** @deprecated Use permission-registry.buildPermission for new code */
export function buildPermission(domain: string, action: string): string {
  return `${domain}.${action}`;
}

/** @deprecated Use permission-registry.parsePermission for new code */
export function parsePermission(permission: string): { domain: string; action: string } | null {
  const parts = permission.split(".");
  if (parts.length !== 2) return null;
  return { domain: parts[0], action: parts[1] };
}

// ---------------------------------------------------------------------------
// Role Definitions
// ---------------------------------------------------------------------------

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
      "products.product.create",
      "products.product.view",
      "products.product.update",
      "products.product.delete",
      "products.product.publish",
      "products.product.archive",
      "products.product.restore",
      "categories.category.create",
      "categories.category.view",
      "categories.category.update",
      "categories.category.delete",
      "brands.brand.create",
      "brands.brand.view",
      "brands.brand.update",
      "brands.brand.delete",
      "collections.collection.create",
      "collections.collection.view",
      "collections.collection.update",
      "collections.collection.delete",
      "collections.collection.publish",
      "suppliers.supplier.create",
      "suppliers.supplier.view",
      "suppliers.supplier.update",
      "suppliers.supplier.suspend",
      "inventory.inventory.view",
      "inventory.inventory.update",
      "inventory.inventory.adjust",
      "inventory.inventory.transfer",
      "inventory.inventory.import",
      "inventory.inventory.export",
      "pricing.pricing.view",
      "pricing.pricing.update",
      "pricing.pricing.override",
      "pricing.pricing.manage",
      "orders.order.create",
      "orders.order.view",
      "orders.order.update",
      "orders.order.delete",
      "orders.order.cancel",
      "orders.order.assign_courier",
      "orders.order.update_tracking",
      "orders.order.mark_packed",
      "orders.order.ship",
      "orders.order.process_return",
      "orders.order.exchange",
      "orders.order.refund",
      "customers.customer.view",
      "customers.customer.manage",
      "customers.customer.export",
      "resellers.reseller.create",
      "resellers.reseller.view",
      "resellers.reseller.update",
      "resellers.reseller.suspend",
      "wholesalers.wholesaler.view",
      "wholesalers.wholesaler.update",
      "wallet.wallet.view",
      "wallet.wallet.manage",
      "wallet.wallet.approve_withdraw",
      "wallet.wallet.reject_withdraw",
      "wallet.wallet.manual_credit",
      "wallet.wallet.manual_debit",
      "finance.finance.view",
      "finance.finance.manage",
      "finance.finance.export",
      "courier.courier.view",
      "courier.courier.manage",
      "courier.courier.retry_booking",
      "courier.courier.sync_status",
      "reports.report.view",
      "reports.report.export",
      "reports.report.generate",
      "reports.report.download",
      "analytics.analytics.view",
      "analytics.analytics.manage",
      "settings.settings.view",
      "settings.settings.update",
      "settings.settings.manage",
      "notifications.notification.view",
      "notifications.notification.create",
      "notifications.notification.update",
      "notifications.notification.delete",
      "notifications.notification.export",
      "content.content.create",
      "content.content.view",
      "content.content.update",
      "content.content.delete",
      "content.content.publish",
      "content.content.archive",
      "content.content.restore",
      "identity.identity.view",
      "identity.identity.create",
      "identity.identity.update",
      "identity.identity.delete",
      "identity.identity.approve",
      "identity.identity.reject",
      "identity.identity.suspend",
      "identity.identity.sessions",
      "identity.identity.manage",
      "users.user.create",
      "users.user.view",
      "users.user.update",
      "users.user.delete",
      "users.user.assign",
      "media.media.create",
      "media.media.view",
      "media.media.delete",
      "marketing.marketing.view",
      "marketing.marketing.manage",
      "templates.template.view",
      "templates.template.create",
      "templates.template.update",
      "templates.template.delete",
      "automation.automation.view",
      "automation.automation.manage",
    ],
    isSystem: true,
  },
  {
    name: "Manager",
    description: "Operational control over assigned modules",
    permissions: [
      "products.product.create",
      "products.product.view",
      "products.product.update",
      "categories.category.view",
      "categories.category.update",
      "brands.brand.view",
      "brands.brand.update",
      "collections.collection.view",
      "collections.collection.update",
      "suppliers.supplier.view",
      "suppliers.supplier.update",
      "inventory.inventory.view",
      "inventory.inventory.update",
      "inventory.inventory.adjust",
      "pricing.pricing.view",
      "pricing.pricing.update",
      "resellers.reseller.create",
      "resellers.reseller.view",
      "resellers.reseller.update",
      "resellers.reseller.suspend",
      "orders.order.view",
      "orders.order.update",
      "orders.order.cancel",
      "orders.order.assign_courier",
      "orders.order.update_tracking",
      "orders.order.mark_packed",
      "customers.customer.view",
      "customers.customer.manage",
      "finance.finance.view",
      "courier.courier.view",
      "reports.report.view",
      "content.content.create",
      "content.content.view",
      "content.content.update",
      "content.content.publish",
      "identity.identity.view",
      "identity.identity.approve",
      "identity.identity.reject",
      "identity.identity.sessions",
      "users.user.view",
      "users.user.update",
      "settings.settings.view",
      "notifications.notification.view",
      "analytics.analytics.view",
    ],
    isSystem: true,
  },
  {
    name: "Support",
    description: "Customer support with view access",
    permissions: [
      "products.product.view",
      "orders.order.view",
      "orders.order.update",
      "customers.customer.view",
      "customers.customer.manage",
      "identity.identity.view",
      "users.user.view",
      "inventory.inventory.view",
      "courier.courier.view",
      "notifications.notification.view",
    ],
    isSystem: true,
  },
  {
    name: "Warehouse",
    description: "Inventory and stock management",
    permissions: [
      "products.product.view",
      "inventory.inventory.view",
      "inventory.inventory.update",
      "inventory.inventory.adjust",
      "inventory.inventory.transfer",
      "inventory.inventory.import",
      "orders.order.view",
      "orders.order.update",
      "orders.order.mark_packed",
      "courier.courier.view",
    ],
    isSystem: true,
  },
  {
    name: "Finance",
    description: "Financial operations and reporting",
    permissions: [
      "finance.finance.view",
      "finance.finance.manage",
      "finance.finance.export",
      "wallet.wallet.view",
      "wallet.wallet.manage",
      "wallet.wallet.approve_withdraw",
      "wallet.wallet.reject_withdraw",
      "wallet.wallet.manual_credit",
      "wallet.wallet.manual_debit",
      "reports.report.view",
      "reports.report.export",
      "reports.report.generate",
      "orders.order.view",
      "pricing.pricing.view",
    ],
    isSystem: true,
  },
  {
    name: "Operations",
    description: "Order fulfillment and logistics",
    permissions: [
      "orders.order.view",
      "orders.order.update",
      "orders.order.cancel",
      "orders.order.assign_courier",
      "orders.order.update_tracking",
      "orders.order.mark_packed",
      "orders.order.ship",
      "orders.order.process_return",
      "orders.order.exchange",
      "courier.courier.view",
      "courier.courier.manage",
      "courier.courier.retry_booking",
      "courier.courier.sync_status",
      "inventory.inventory.view",
      "inventory.inventory.update",
      "customers.customer.view",
    ],
    isSystem: true,
  },
  {
    name: "Courier Manager",
    description: "Courier and shipment management",
    permissions: [
      "courier.courier.view",
      "courier.courier.manage",
      "courier.courier.retry_booking",
      "courier.courier.sync_status",
      "orders.order.view",
      "orders.order.update",
      "orders.order.assign_courier",
      "orders.order.update_tracking",
    ],
    isSystem: true,
  },
  {
    name: "Marketing",
    description: "Content and marketing operations",
    permissions: [
      "content.content.create",
      "content.content.view",
      "content.content.update",
      "content.content.delete",
      "content.content.publish",
      "content.content.archive",
      "products.product.view",
      "analytics.analytics.view",
      "analytics.analytics.manage",
      "media.media.create",
      "media.media.view",
      "media.media.delete",
      "marketing.marketing.view",
      "marketing.marketing.manage",
      "notifications.notification.view",
      "notifications.notification.create",
    ],
    isSystem: true,
  },
  {
    name: "Viewer",
    description: "Read-only access to system reports and dashboards",
    permissions: [
      "products.product.view",
      "orders.order.view",
      "reports.report.view",
      "analytics.analytics.view",
      "notifications.notification.view",
    ],
    isSystem: true,
  },
];

// ---------------------------------------------------------------------------
// Register all module permissions with the centralized registry
// ---------------------------------------------------------------------------

const STANDARD_ACTIONS = ["view", "create", "update", "delete"];

const MODULE_DEFINITIONS: ModulePermissionGroup[] = [
  {
    module: "products",
    description: "Product catalog management",
    permissions: buildModulePermissions("products", ["product"], STANDARD_ACTIONS, [
      { resource: "product", actions: ["publish", "archive", "restore", "import", "export"] },
    ]),
  },
  {
    module: "categories",
    description: "Product category management",
    permissions: buildModulePermissions("categories", ["category"], STANDARD_ACTIONS),
  },
  {
    module: "brands",
    description: "Brand management",
    permissions: buildModulePermissions("brands", ["brand"], STANDARD_ACTIONS),
  },
  {
    module: "collections",
    description: "Product collection management",
    permissions: buildModulePermissions("collections", ["collection"], STANDARD_ACTIONS, [
      { resource: "collection", actions: ["publish", "archive", "restore"] },
    ]),
  },
  {
    module: "suppliers",
    description: "Supplier management",
    permissions: buildModulePermissions("suppliers", ["supplier"], STANDARD_ACTIONS, [
      { resource: "supplier", actions: ["suspend", "approve", "reject"] },
    ]),
  },
  {
    module: "inventory",
    description: "Inventory and stock management",
    permissions: buildModulePermissions("inventory", ["inventory"], STANDARD_ACTIONS, [
      { resource: "inventory", actions: ["adjust", "transfer", "import", "export"] },
    ]),
  },
  {
    module: "pricing",
    description: "Pricing rules and profiles",
    permissions: buildModulePermissions("pricing", ["pricing"], STANDARD_ACTIONS, [
      { resource: "pricing", actions: ["override", "manage"] },
    ]),
  },
  {
    module: "orders",
    description: "Order lifecycle management",
    permissions: buildModulePermissions("orders", ["order"], STANDARD_ACTIONS, [
      {
        resource: "order",
        actions: [
          "cancel",
          "assign_courier",
          "update_tracking",
          "mark_packed",
          "ship",
          "process_return",
          "exchange",
          "refund",
          "approve",
        ],
      },
    ]),
  },
  {
    module: "customers",
    description: "Customer management",
    permissions: buildModulePermissions("customers", ["customer"], STANDARD_ACTIONS, [
      { resource: "customer", actions: ["manage", "export"] },
    ]),
  },
  {
    module: "resellers",
    description: "Reseller partner management",
    permissions: buildModulePermissions("resellers", ["reseller"], STANDARD_ACTIONS, [
      { resource: "reseller", actions: ["suspend", "approve"] },
    ]),
  },
  {
    module: "wholesalers",
    description: "Wholesale buyer management",
    permissions: buildModulePermissions("wholesalers", ["wholesaler"], STANDARD_ACTIONS, [
      { resource: "wholesaler", actions: ["approve"] },
    ]),
  },
  {
    module: "wallet",
    description: "Wallet and balance management",
    permissions: buildModulePermissions(
      "wallet",
      ["wallet"],
      ["view"],
      [
        {
          resource: "wallet",
          actions: [
            "manage",
            "approve_withdraw",
            "reject_withdraw",
            "manual_credit",
            "manual_debit",
          ],
        },
      ],
    ),
  },
  {
    module: "finance",
    description: "Financial operations",
    permissions: buildModulePermissions("finance", ["finance"], STANDARD_ACTIONS, [
      { resource: "finance", actions: ["manage", "export"] },
    ]),
  },
  {
    module: "courier",
    description: "Courier and shipment management",
    permissions: buildModulePermissions("courier", ["courier"], STANDARD_ACTIONS, [
      { resource: "courier", actions: ["manage", "retry_booking", "sync_status"] },
    ]),
  },
  {
    module: "reports",
    description: "Reporting and analytics",
    permissions: buildModulePermissions(
      "reports",
      ["report"],
      ["view"],
      [{ resource: "report", actions: ["export", "generate", "download"] }],
    ),
  },
  {
    module: "analytics",
    description: "Platform analytics",
    permissions: buildModulePermissions(
      "analytics",
      ["analytics"],
      ["view"],
      [{ resource: "analytics", actions: ["manage"] }],
    ),
  },
  {
    module: "settings",
    description: "Platform settings",
    permissions: buildModulePermissions(
      "settings",
      ["settings"],
      ["view"],
      [{ resource: "settings", actions: ["update", "manage"] }],
    ),
  },
  {
    module: "notifications",
    description: "Notification management",
    permissions: buildModulePermissions("notifications", ["notification"], STANDARD_ACTIONS, [
      { resource: "notification", actions: ["export"] },
    ]),
  },
  {
    module: "content",
    description: "CMS and content management",
    permissions: buildModulePermissions("content", ["content"], STANDARD_ACTIONS, [
      { resource: "content", actions: ["publish", "archive", "restore"] },
    ]),
  },
  {
    module: "identity",
    description: "Identity and access management",
    permissions: buildModulePermissions("identity", ["identity"], STANDARD_ACTIONS, [
      { resource: "identity", actions: ["approve", "reject", "suspend", "sessions", "manage"] },
    ]),
  },
  {
    module: "users",
    description: "User management",
    permissions: buildModulePermissions("users", ["user"], STANDARD_ACTIONS, [
      { resource: "user", actions: ["assign"] },
    ]),
  },
  {
    module: "media",
    description: "Media asset management",
    permissions: buildModulePermissions("media", ["media"], STANDARD_ACTIONS),
  },
  {
    module: "marketing",
    description: "Marketing and promotions",
    permissions: buildModulePermissions(
      "marketing",
      ["marketing"],
      ["view"],
      [{ resource: "marketing", actions: ["manage"] }],
    ),
  },
  {
    module: "templates",
    description: "Template management",
    permissions: buildModulePermissions("templates", ["template"], STANDARD_ACTIONS),
  },
  {
    module: "automation",
    description: "Automation rules",
    permissions: buildModulePermissions(
      "automation",
      ["automation"],
      ["view"],
      [{ resource: "automation", actions: ["manage"] }],
    ),
  },
];

registerModules(MODULE_DEFINITIONS);
freezeRegistry();
