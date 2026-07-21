import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/shared/lib/database/base-schema";
import type { BaseDocument } from "@/shared/lib/database/types";

const contentBlockSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    title: { type: String },
    subtitle: { type: String },
    bodyHtml: { type: String },
    imageUrl: { type: String },
    videoUrl: { type: String },
    ctaLabel: { type: String },
    ctaHref: { type: String },
    items: [{ type: Schema.Types.Mixed }],
    settings: { type: Schema.Types.Mixed },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false },
);

const contentSeoSchema = new Schema(
  {
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: [{ type: String }],
    canonicalUrl: { type: String },
    robots: { type: String },
    ogTitle: { type: String },
    ogDescription: { type: String },
    ogImage: { type: String },
    twitterCard: { type: String },
    twitterTitle: { type: String },
    twitterDescription: { type: String },
    twitterImage: { type: String },
    jsonLd: { type: Schema.Types.Mixed },
  },
  { _id: false },
);

const contentRevisionSchema = new Schema(
  {
    id: { type: String, required: true },
    version: { type: Number, required: true },
    title: { type: String, required: true },
    bodyHtml: { type: String },
    blocks: [contentBlockSchema],
    seo: contentSeoSchema,
    savedAt: { type: Date, default: Date.now },
    savedBy: { type: String },
    note: { type: String },
  },
  { _id: false },
);

const { status: _, ...baseFields } = baseFieldsDefinition;

const contentSchema = new Schema(
  {
    type: {
      type: String,
      enum: [
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
      ],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    slug: { type: String, required: true, index: true },
    excerpt: { type: String },
    bodyHtml: { type: String },
    coverImage: { type: String },
    blocks: { type: [contentBlockSchema], default: [] },
    status: {
      type: String,
      enum: ["draft", "review", "published", "scheduled", "archived"],
      default: "draft",
      index: true,
    },
    category: { type: String, index: true },
    tags: [{ type: String }],
    authorId: { type: String, index: true },
    authorName: { type: String },
    seo: contentSeoSchema,
    publishedAt: { type: Date, default: null },
    scheduledAt: { type: Date, default: null },
    revisions: { type: [contentRevisionSchema], default: [] },
    viewCount: { type: Number, default: 0 },
    sortOrder: { type: Number, default: 0 },
    parentId: { type: String, default: null },
    locale: { type: String, default: "en" },
    ...baseFields,
  },
  { ...baseSchemaOptions, collection: "cms_contents" },
);

contentSchema.index({ type: 1, slug: 1 }, { unique: true });
contentSchema.index({ type: 1, status: 1, publishedAt: -1 });
contentSchema.index({ title: "text", excerpt: "text", tags: "text" });

contentSchema.plugin(softDeletePlugin);

export type ContentMongoDocument = BaseDocument & {
  type: string;
  title: string;
  slug: string;
  excerpt?: string;
  bodyHtml?: string;
  coverImage?: string;
  blocks: unknown[];
  status: string;
  category?: string;
  tags: string[];
  authorId?: string;
  authorName?: string;
  seo?: Record<string, unknown>;
  publishedAt?: Date | null;
  scheduledAt?: Date | null;
  revisions: unknown[];
  viewCount: number;
  sortOrder: number;
  parentId?: string | null;
  locale?: string;
};

export const ContentModel =
  mongoose.models.CmsContent || mongoose.model<ContentMongoDocument>("CmsContent", contentSchema);

export default ContentModel;
