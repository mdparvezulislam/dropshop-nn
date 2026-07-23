import type { BaseDBEntity } from "@/lib/database/types";

export type ContentType =
  | "page"
  | "landing"
  | "blog"
  | "banner"
  | "hero"
  | "announcement"
  | "faq"
  | "campaign"
  | "flash_sale"
  | "homepage_section"
  | "footer"
  | "navigation";

export type ContentStatus = "draft" | "review" | "published" | "scheduled" | "archived";

export type ContentBlockType =
  | "hero"
  | "banner"
  | "rich_text"
  | "image"
  | "gallery"
  | "video"
  | "feature_grid"
  | "cta"
  | "faq"
  | "testimonials"
  | "product_carousel"
  | "category_carousel"
  | "countdown"
  | "newsletter"
  | "custom_html";

export interface ContentSEO {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  jsonLd?: Record<string, unknown>;
}

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  title?: string;
  subtitle?: string;
  bodyHtml?: string;
  imageUrl?: string;
  videoUrl?: string;
  ctaLabel?: string;
  ctaHref?: string;
  items?: Record<string, unknown>[];
  settings?: Record<string, unknown>;
  sortOrder: number;
}

export interface ContentRevision {
  id: string;
  version: number;
  title: string;
  bodyHtml?: string;
  blocks: ContentBlock[];
  seo?: ContentSEO;
  savedAt: Date;
  savedBy?: string;
  note?: string;
}

export interface ContentDocument extends BaseDBEntity {
  type: ContentType;
  title: string;
  slug: string;
  excerpt?: string;
  bodyHtml?: string;
  coverImage?: string;
  blocks: ContentBlock[];
  status: ContentStatus;
  category?: string;
  tags: string[];
  authorId?: string;
  authorName?: string;
  seo?: ContentSEO;
  publishedAt?: Date | null;
  scheduledAt?: Date | null;
  revisions: ContentRevision[];
  viewCount: number;
  sortOrder: number;
  parentId?: string | null;
  locale?: string;
}

export type CmsContent = ContentDocument;
