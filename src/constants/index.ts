export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  COURIER: "courier",
} as const;

export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  DASHBOARD: "/dashboard",
  PRODUCTS: "/dashboard/products",
  ORDERS: "/dashboard/orders",
  PAYMENTS: "/dashboard/payments",
  COURIER: "/dashboard/couriers",
  INVENTORY: "/dashboard/inventory",
  PRICING: "/dashboard/pricing",
  RESELLERS: "/dashboard/resellers",
  WALLET: "/dashboard/wallet",
  INVOICES: "/dashboard/invoices",
} as const;

export const PERMISSIONS = {
  MANAGE_USERS: "User.Manage",
  MANAGE_PRODUCTS: "Product.Manage",
  MANAGE_ORDERS: "Order.Manage",
  MANAGE_PAYMENTS: "Finance.Manage",
  MANAGE_COURIERS: "Courier.Manage",
  MANAGE_INVENTORY: "Inventory.Manage",
  MANAGE_PRICING: "Pricing.Manage",
  VIEW_WALLET: "Wallet.View",
  MANAGE_WALLET: "Wallet.Manage",
  VIEW_INVOICES: "Invoice.View",
  INVENTORY_VIEW: "Inventory.View",
  INVENTORY_UPDATE: "Inventory.Update",
  INVENTORY_ADJUST: "Inventory.Adjust",
  PRICING_VIEW: "Pricing.View",
  PRICING_UPDATE: "Pricing.Update",
  PRICING_OVERRIDE: "Pricing.Override",
  RESELLER_CREATE: "Reseller.Create",
  RESELLER_VIEW: "Reseller.View",
  RESELLER_UPDATE: "Reseller.Update",
  RESELLER_SUSPEND: "Reseller.Suspend",
} as const;

export const STOCK_AVAILABILITY = {
  IN_STOCK: "in_stock",
  LOW_STOCK: "low_stock",
  OUT_OF_STOCK: "out_of_stock",
  PRE_ORDER: "pre_order",
  BACKORDER: "backorder",
} as const;

export const STOCK_OPERATIONS = {
  STOCK_IN: "stock_in",
  STOCK_OUT: "stock_out",
  ADJUSTMENT: "adjustment",
  RESERVATION: "reservation",
  RELEASE: "release",
  TRANSFER: "transfer",
} as const;

export const PRICING_RULES = {
  FIXED: "fixed",
  PERCENTAGE: "percentage",
  SUPPLIER_BASED: "supplier_based",
  CATEGORY_BASED: "category_based",
  BRAND_BASED: "brand_based",
  DYNAMIC: "dynamic",
} as const;

export const AUDIT_EVENTS = {
  PRICE_CHANGED: "Price Changed",
  STOCK_UPDATED: "Stock Updated",
  STOCK_ADJUSTED: "Stock Adjusted",
  SUPPLIER_PRICE_CHANGED: "Supplier Price Changed",
  INVENTORY_IMPORTED: "Inventory Imported",
  RESELLER_CREATED: "Reseller Created",
  RESELLER_UPDATED: "Reseller Updated",
  PRODUCT_ADDED: "Product Added",
  PRODUCT_REMOVED: "Product Removed",
  RESELLER_PRICE_UPDATED: "Price Updated",
} as const;

export const RESELLER_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  SUSPENDED: "suspended",
  BLOCKED: "blocked",
  ARCHIVED: "archived",
} as const;

export const DEFAULT_CURRENCY = "BDT" as const;

export const SUPPORTED_CURRENCIES = ["BDT", "USD"] as const;

export const FILE_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ALLOWED_FILE_TYPES: ["application/pdf", "image/jpeg", "image/png", "text/csv"],
} as const;
