import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { ContentModel, type ContentMongoDocument } from "./content-model";
import type {
  CmsContent,
  ContentBlock,
  ContentRevision,
  ContentSEO,
  ContentStatus,
  ContentType,
} from "../domain/content-entity";
import type { PaginationParams, SortParams, PaginatedResult } from "@/shared/types";

function mapBlock(b: any): ContentBlock {
  return {
    id: b.id,
    type: b.type,
    title: b.title,
    subtitle: b.subtitle,
    bodyHtml: b.bodyHtml,
    imageUrl: b.imageUrl,
    videoUrl: b.videoUrl,
    ctaLabel: b.ctaLabel,
    ctaHref: b.ctaHref,
    items: b.items,
    settings: b.settings,
    sortOrder: b.sortOrder ?? 0,
  };
}

function mapSeo(s: any): ContentSEO | undefined {
  if (!s) return undefined;
  return {
    metaTitle: s.metaTitle,
    metaDescription: s.metaDescription,
    metaKeywords: s.metaKeywords,
    canonicalUrl: s.canonicalUrl,
    robots: s.robots,
    ogTitle: s.ogTitle,
    ogDescription: s.ogDescription,
    ogImage: s.ogImage,
    twitterCard: s.twitterCard,
    twitterTitle: s.twitterTitle,
    twitterDescription: s.twitterDescription,
    twitterImage: s.twitterImage,
    jsonLd: s.jsonLd,
  };
}

function mapRevision(r: any): ContentRevision {
  return {
    id: r.id,
    version: r.version,
    title: r.title,
    bodyHtml: r.bodyHtml,
    blocks: (r.blocks || []).map(mapBlock),
    seo: mapSeo(r.seo),
    savedAt: r.savedAt,
    savedBy: r.savedBy,
    note: r.note,
  };
}

function toDomain(doc: any): CmsContent {
  return {
    id: doc._id?.toString?.() ?? doc.id,
    type: doc.type,
    title: doc.title,
    slug: doc.slug,
    excerpt: doc.excerpt,
    bodyHtml: doc.bodyHtml,
    coverImage: doc.coverImage,
    blocks: (doc.blocks || []).map(mapBlock),
    status: doc.status,
    category: doc.category,
    tags: doc.tags || [],
    authorId: doc.authorId,
    authorName: doc.authorName,
    seo: mapSeo(doc.seo),
    publishedAt: doc.publishedAt,
    scheduledAt: doc.scheduledAt,
    revisions: (doc.revisions || []).map(mapRevision),
    viewCount: doc.viewCount ?? 0,
    sortOrder: doc.sortOrder ?? 0,
    parentId: doc.parentId,
    locale: doc.locale,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted ?? false,
    metadata: doc.metadata ? Object.fromEntries(doc.metadata) : undefined,
  } as CmsContent;
}

export interface ContentFilter {
  type?: ContentType | ContentType[];
  status?: ContentStatus | ContentStatus[] | "all";
  category?: string;
  authorId?: string;
  tags?: string[];
  search?: string;
}

export class ContentRepository extends BaseRepository<ContentMongoDocument, CmsContent> {
  constructor() {
    super(ContentModel as any, toDomain);
  }

  async findBySlug(type: ContentType, slug: string): Promise<CmsContent | null> {
    return this.findOne({ type, slug, isDeleted: { $ne: true } });
  }

  async findPublishedBySlug(type: ContentType, slug: string): Promise<CmsContent | null> {
    return this.findOne({
      type,
      slug,
      status: "published",
      isDeleted: { $ne: true },
    });
  }

  async list(
    filter: ContentFilter = {},
    pagination: PaginationParams = { page: 1, limit: 20 },
    sort?: SortParams,
  ): Promise<PaginatedResult<CmsContent>> {
    const dbFilter: Record<string, unknown> = { isDeleted: { $ne: true } };

    if (filter.type) {
      dbFilter.type = Array.isArray(filter.type) ? { $in: filter.type } : filter.type;
    }
    if (filter.status && filter.status !== "all") {
      dbFilter.status = Array.isArray(filter.status) ? { $in: filter.status } : filter.status;
    }
    if (filter.category) dbFilter.category = filter.category;
    if (filter.authorId) dbFilter.authorId = filter.authorId;
    if (filter.tags?.length) dbFilter.tags = { $in: filter.tags };
    if (filter.search) {
      dbFilter.$or = [
        { title: { $regex: filter.search, $options: "i" } },
        { slug: { $regex: filter.search, $options: "i" } },
        { excerpt: { $regex: filter.search, $options: "i" } },
        { tags: { $regex: filter.search, $options: "i" } },
      ];
    }

    return this.findPaginated(dbFilter, pagination, sort);
  }

  async countByStatus(type?: ContentType): Promise<Record<string, number>> {
    const match: Record<string, unknown> = { isDeleted: { $ne: true } };
    if (type) match.type = type;

    const rows = await ContentModel.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const result: Record<string, number> = {
      draft: 0,
      review: 0,
      published: 0,
      scheduled: 0,
      archived: 0,
    };
    for (const row of rows) {
      if (row._id) result[row._id] = row.count;
    }
    return result;
  }

  async incrementViews(id: string): Promise<void> {
    await ContentModel.updateOne({ _id: id }, { $inc: { viewCount: 1 } });
  }
}

export default ContentRepository;
