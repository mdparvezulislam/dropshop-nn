import { z } from "zod";

export const notifySchema = z.object({
  userId: z.string().optional(),
  recipientEmail: z.string().email().optional().or(z.literal("")),
  recipientPhone: z.string().optional(),
  type: z.string().min(1),
  category: z
    .enum([
      "commerce",
      "order",
      "payment",
      "shipping",
      "inventory",
      "account",
      "security",
      "marketing",
      "cms",
      "blog",
      "finance",
      "supplier",
      "system",
    ])
    .optional(),
  title: z.string().optional(),
  body: z.string().optional(),
  channels: z.array(z.enum(["in_app", "email", "sms", "push", "whatsapp", "webhook"])).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  templateKey: z.string().optional(),
  variables: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
    .optional(),
  data: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  href: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  scheduledAt: z.union([z.string(), z.coerce.date()]).optional().nullable(),
  maxRetries: z.number().int().min(0).max(10).optional(),
  forceChannels: z.boolean().optional(),
});

export const inboxQuerySchema = z.object({
  unreadOnly: z.boolean().optional(),
  archived: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
});

export const templateUpsertSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  category: z
    .enum([
      "commerce",
      "order",
      "payment",
      "shipping",
      "inventory",
      "account",
      "security",
      "marketing",
      "cms",
      "blog",
      "finance",
      "supplier",
      "system",
    ])
    .default("system"),
  description: z.string().optional(),
  channels: z
    .array(z.enum(["in_app", "email", "sms", "push", "whatsapp", "webhook"]))
    .default(["in_app"]),
  subject: z.string().optional(),
  emailBody: z.string().optional(),
  smsBody: z.string().optional(),
  inAppTitle: z.string().min(1),
  inAppBody: z.string().min(1),
  pushTitle: z.string().optional(),
  pushBody: z.string().optional(),
  defaultHref: z.string().optional(),
  variables: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  locale: z.string().default("en"),
});

export const deliveryLogQuerySchema = z.object({
  status: z.string().optional(),
  channel: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(30),
});
