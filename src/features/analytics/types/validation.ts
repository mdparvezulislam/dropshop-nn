import { z } from "zod";

export const trackEventSchema = z.object({
  eventName: z.string().min(1).max(120),
  module: z.string().optional(),
  source: z.string().max(80).optional(),
  actorId: z.string().optional(),
  actorRole: z.string().optional(),
  sessionId: z.string().optional(),
  requestId: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  value: z.number().optional(),
  currency: z.string().max(8).optional(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  timestamp: z.union([z.string(), z.coerce.date()]).optional(),
  idempotencyKey: z.string().max(200).optional(),
});

export type TrackEventInputSchema = z.infer<typeof trackEventSchema>;

export const dateRangeSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  preset: z.enum(["today", "7d", "30d", "90d", "12m", "custom"]).default("30d"),
});

export type DateRangeInput = z.infer<typeof dateRangeSchema>;

export const analyticsFilterSchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  preset: z.enum(["today", "7d", "30d", "90d", "12m", "custom"]).optional(),
  store: z.string().optional(),
  courier: z.string().optional(),
  customerId: z.string().optional(),
  resellerId: z.string().optional(),
  wholesaleId: z.string().optional(),
  productId: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
});

export const overviewQuerySchema = dateRangeSchema.extend({
  compare: z.boolean().optional().default(false),
});

export const exportQuerySchema = z.object({
  format: z.enum(["csv", "excel", "pdf"]).default("csv"),
  filters: analyticsFilterSchema.optional(),
  type: z.enum(["executive", "orders", "products", "finance", "logistics"]).optional(),
});

export const reportGenerateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  type: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly", "custom"]),
  filters: analyticsFilterSchema.optional(),
});

export const reportExportSchema = z.object({
  reportId: z.string().min(1),
  format: z.enum(["csv", "excel", "pdf"]).default("csv"),
});

export const dashboardRefreshSchema = z.object({
  dashboard: z.enum(["executive", "order", "product", "customer", "finance", "live"]).optional(),
});

export const liveDashboardSchema = z.object({
  refreshInterval: z.number().min(0).max(300).optional(),
});

export const analyticsSearchSchema = z.object({
  query: z.string().min(2).max(200),
  limit: z.number().min(1).max(50).optional().default(20),
});
