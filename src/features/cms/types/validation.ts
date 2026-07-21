import { z } from "zod";

export const contentBlockSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    "hero",
    "banner",
    "rich_text",
    "image",
    "gallery",
    "video",
    "feature_grid",
    "cta",
    "faq",
    "testimonials",
    "product_carousel",
    "category_carousel",
    "countdown",
    "newsletter",
    "custom_html",
  ]),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  bodyHtml: z.string().optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  items: z.array(z.record(z.string(), z.unknown())).optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
  sortOrder: z.number().int().default(0),
});

export const contentSeoSchema = z.object({
  metaTitle: z.string().max(70).optional().or(z.literal("")),
  metaDescription: z.string().max(160).optional().or(z.literal("")),
  metaKeywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().optional().or(z.literal("")),
  robots: z.string().optional().or(z.literal("")),
  ogTitle: z.string().optional().or(z.literal("")),
  ogDescription: z.string().optional().or(z.literal("")),
  ogImage: z.string().optional().or(z.literal("")),
  twitterCard: z.string().optional().or(z.literal("")),
  twitterTitle: z.string().optional().or(z.literal("")),
  twitterDescription: z.string().optional().or(z.literal("")),
  twitterImage: z.string().optional().or(z.literal("")),
  jsonLd: z.record(z.string(), z.unknown()).optional(),
});

export const contentTypeSchema = z.enum([
  "page",
  "landing",
  "blog",
  "banner",
  "hero",
  "announcement",
  "faq",
  "campaign",
  "flash_sale",
  "homepage_section",
  "footer",
  "navigation",
]);

export const contentStatusSchema = z.enum([
  "draft",
  "review",
  "published",
  "scheduled",
  "archived",
]);

export const createContentSchema = z.object({
  type: contentTypeSchema,
  title: z.string().min(2, "Title is required").trim(),
  slug: z.string().optional(),
  excerpt: z.string().optional().or(z.literal("")),
  bodyHtml: z.string().optional().or(z.literal("")),
  coverImage: z.string().optional().or(z.literal("")),
  blocks: z.array(contentBlockSchema).default([]),
  status: contentStatusSchema.default("draft"),
  category: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  seo: contentSeoSchema.optional(),
  scheduledAt: z.coerce.date().optional().nullable(),
  sortOrder: z.number().int().default(0),
  parentId: z.string().optional().nullable(),
  locale: z.string().default("en"),
});

export type CreateContentInput = z.infer<typeof createContentSchema>;

export const updateContentSchema = createContentSchema.partial().extend({
  id: z.string().min(1),
});

export type UpdateContentInput = z.infer<typeof updateContentSchema>;

export const publishContentSchema = z.object({
  id: z.string().min(1),
  scheduledAt: z.coerce.date().optional().nullable(),
});

export const createMediaSchema = z.object({
  name: z.string().min(1),
  url: z.string().url("Valid URL required"),
  type: z.enum(["image", "video", "pdf", "document", "other"]),
  mimeType: z.string().optional(),
  fileSize: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  altText: z.string().optional().or(z.literal("")),
  caption: z.string().optional().or(z.literal("")),
  folder: z.string().default("general"),
  tags: z.array(z.string()).default([]),
  imagekitFileId: z.string().optional(),
});

export type CreateMediaInput = z.infer<typeof createMediaSchema>;

export const updateMediaSchema = createMediaSchema.partial().extend({
  id: z.string().min(1),
});

export const navigationItemSchema: z.ZodType<{
  id: string;
  label: string;
  href: string;
  icon?: string;
  openInNewTab?: boolean;
  roles?: string[];
  children?: unknown[];
  sortOrder: number;
  isVisible: boolean;
}> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    href: z.string().min(1),
    icon: z.string().optional(),
    openInNewTab: z.boolean().optional(),
    roles: z.array(z.string()).optional(),
    children: z.array(navigationItemSchema).optional(),
    sortOrder: z.number().int().default(0),
    isVisible: z.boolean().default(true),
  }),
);

export const upsertNavigationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  location: z.enum(["header", "footer", "sidebar", "mega_menu"]),
  items: z.array(navigationItemSchema).default([]),
  isActive: z.boolean().default(true),
});

export type UpsertNavigationInput = z.infer<typeof upsertNavigationSchema>;

export const contentListFilterSchema = z.object({
  type: z.union([contentTypeSchema, z.array(contentTypeSchema)]).optional(),
  status: z.union([contentStatusSchema, z.literal("all")]).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});
