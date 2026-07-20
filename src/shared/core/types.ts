import type { BaseEntity, AuditFields, PaginationParams, SortParams, SortOrder, QueryFilter } from "@/shared/types";

export type { BaseEntity, AuditFields, PaginationParams, SortParams, SortOrder, QueryFilter };

export type EntityStatus = "active" | "inactive" | "draft" | "archived" | "deleted";

export type EntityVisibility = "published" | "draft" | "hidden" | "scheduled" | "archived";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "changes_requested";

export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded" | "cancelled";

export type NotificationChannel = "in_app" | "email" | "sms" | "push" | "whatsapp";

export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export type OrderStatus = "pending" | "confirmed" | "processing" | "packed" | "shipped" | "delivered" | "cancelled" | "returned";

export type InventoryAvailability = "in_stock" | "low_stock" | "out_of_stock" | "pre_order" | "backorder";

export type StockOperation = "stock_in" | "stock_out" | "adjustment" | "reservation" | "release" | "transfer";

export type PricingRuleType = "fixed" | "percentage" | "supplier_based" | "category_based" | "brand_based" | "dynamic";

export type CurrencyCode = "BDT" | "USD";

export type BusinessType = "sole_proprietorship" | "partnership" | "limited_company" | "individual";

export type UserRole = "super_admin" | "admin" | "manager" | "support" | "supplier" | "reseller" | "wholesaler" | "customer" | "guest";

export type ActorInfo = {
  id: string;
  name?: string;
  role?: string;
};

export interface ChangeRecord {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface RangeFilter<T = number> {
  min?: T;
  max?: T;
}

export interface DateRangeFilter {
  from?: string;
  to?: string;
}

export interface ExportOptions {
  format: "csv" | "json";
  filename?: string;
  columns?: string[];
  filters?: Record<string, unknown>;
}

export interface ImportResult {
  totalRows: number;
  successCount: number;
  failureCount: number;
  errors: { row: number; message: string }[];
}

export interface FileUploadResult {
  url: string;
  fileId: string;
  fileName: string;
  mimeType: string;
  size: number;
}

export interface SearchQuery {
  query: string;
  filters?: Record<string, unknown>;
  page?: number;
  limit?: number;
  sort?: string;
  order?: SortOrder;
}

export interface SearchResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  suggestions?: string[];
}
