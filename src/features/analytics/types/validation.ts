import { z } from "zod";

export const trackEventSchema = z.object({
  eventName: z.string().min(1).max(120),
  module: z
    .enum([
      "commerce",
      "catalog",
      "customer",
      "identity",
      "inventory",
      "pricing",
      "order",
      "finance",
      "supplier",
      "cms",
      "blog",
      "notification",
      "automation",
      "website",
      "system",
    ])
    .optional(),
  source: z.string().max(80).optional(),
  actorId: z.string().optional(),
  actorRole: z.string().optional(),
  sessionId: z.string().optional(),
  requestId: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  value: z.number().optional(),
  currency: z.string().max(8).optional(),
  metadata: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
    .optional(),
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

export const overviewQuerySchema = dateRangeSchema.extend({
  compare: z.boolean().optional().default(false),
});

export const exportQuerySchema = dateRangeSchema.extend({
  format: z.enum(["csv", "json"]).default("csv"),
  metric: z.enum(["events", "revenue", "orders", "search"]).default("events"),
});
