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
  WALLET: "/dashboard/wallet",
  INVOICES: "/dashboard/invoices",
} as const;

export const PERMISSIONS = {
  MANAGE_USERS: "manage:users",
  MANAGE_PRODUCTS: "manage:products",
  MANAGE_ORDERS: "manage:orders",
  MANAGE_PAYMENTS: "manage:payments",
  MANAGE_COURIERS: "manage:couriers",
  MANAGE_INVENTORY: "manage:inventory",
  MANAGE_PRICING: "manage:pricing",
  VIEW_WALLET: "view:wallet",
  MANAGE_WALLET: "manage:wallet",
  VIEW_INVOICES: "view:invoices",
} as const;

export const FILE_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ALLOWED_FILE_TYPES: ["application/pdf", "image/jpeg", "image/png", "text/csv"],
} as const;
