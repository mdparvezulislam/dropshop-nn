import { ContentRepository, type ContentFilter } from "../repositories/content-repository";
import type { CmsContent, ContentStatus, ContentType } from "../domain/content-entity";
import type { CreateContentInput, UpdateContentInput } from "../types/validation";
import { generateSlug } from "@/shared/utils/slug-utils";
import { ValidationError, NotFoundError } from "@/shared/errors/app-error";
import { logger } from "@/shared/utils/logger";
import type { PaginationParams, SortParams, PaginatedResult } from "@/shared/types";
import { randomUUID } from "crypto";

export class ContentService {
  private readonly repo = new ContentRepository();

  async create(
    input: CreateContentInput,
    actor?: { id: string; name?: string },
  ): Promise<CmsContent> {
    const slug = input.slug?.trim() || generateSlug(input.title);
    const existing = await this.repo.findBySlug(input.type, slug);
    if (existing) {
      throw new ValidationError("Slug already exists for this content type", {
        slug: ["A content item with this slug already exists"],
      });
    }

    logger.info("ContentService: creating content", { type: input.type, slug });

    return this.repo.create({
      type: input.type,
      title: input.title.trim(),
      slug,
      excerpt: input.excerpt || undefined,
      bodyHtml: input.bodyHtml || undefined,
      coverImage: input.coverImage || undefined,
      blocks: input.blocks ?? [],
      status: input.status ?? "draft",
      category: input.category || undefined,
      tags: input.tags ?? [],
      authorId: actor?.id,
      authorName: actor?.name,
      seo: input.seo,
      scheduledAt: input.scheduledAt ?? null,
      publishedAt: input.status === "published" ? new Date() : null,
      revisions: [],
      viewCount: 0,
      sortOrder: input.sortOrder ?? 0,
      parentId: input.parentId ?? null,
      locale: input.locale ?? "en",
      createdBy: actor?.id,
    } as any);
  }

  async update(
    input: UpdateContentInput,
    actor?: { id: string; name?: string },
  ): Promise<CmsContent> {
    const current = await this.repo.findById(input.id);
    if (!current) throw new NotFoundError("Content not found");

    const nextSlug = input.slug?.trim() || current.slug;
    if (nextSlug !== current.slug) {
      const type = (input.type ?? current.type) as ContentType;
      const clash = await this.repo.findBySlug(type, nextSlug);
      if (clash && clash.id !== current.id) {
        throw new ValidationError("Slug already exists", {
          slug: ["A content item with this slug already exists"],
        });
      }
    }

    const revision = {
      id: randomUUID(),
      version: (current.revisions?.length ?? 0) + 1,
      title: current.title,
      bodyHtml: current.bodyHtml,
      blocks: current.blocks,
      seo: current.seo,
      savedAt: new Date(),
      savedBy: actor?.id,
      note: "Auto revision before update",
    };

    const revisions = [...(current.revisions || []), revision].slice(-20);

    logger.info("ContentService: updating content", { id: input.id });

    return this.repo.update(input.id, {
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      slug: nextSlug,
      ...(input.excerpt !== undefined ? { excerpt: input.excerpt || undefined } : {}),
      ...(input.bodyHtml !== undefined ? { bodyHtml: input.bodyHtml || undefined } : {}),
      ...(input.coverImage !== undefined ? { coverImage: input.coverImage || undefined } : {}),
      ...(input.blocks !== undefined ? { blocks: input.blocks } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.category !== undefined ? { category: input.category || undefined } : {}),
      ...(input.tags !== undefined ? { tags: input.tags } : {}),
      ...(input.seo !== undefined ? { seo: input.seo } : {}),
      ...(input.scheduledAt !== undefined ? { scheduledAt: input.scheduledAt } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      revisions,
      updatedBy: actor?.id,
    } as any);
  }

  async publish(id: string, scheduledAt?: Date | null): Promise<CmsContent> {
    const current = await this.repo.findById(id);
    if (!current) throw new NotFoundError("Content not found");

    if (scheduledAt && scheduledAt > new Date()) {
      return this.repo.update(id, {
        status: "scheduled" as ContentStatus,
        scheduledAt,
      } as any);
    }

    return this.repo.update(id, {
      status: "published" as ContentStatus,
      publishedAt: new Date(),
      scheduledAt: null,
    } as any);
  }

  async archive(id: string): Promise<CmsContent> {
    const current = await this.repo.findById(id);
    if (!current) throw new NotFoundError("Content not found");
    return this.repo.update(id, { status: "archived" as ContentStatus } as any);
  }

  async delete(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }

  async getById(id: string): Promise<CmsContent | null> {
    return this.repo.findById(id);
  }

  async getPublishedBySlug(type: ContentType, slug: string): Promise<CmsContent | null> {
    return this.repo.findPublishedBySlug(type, slug);
  }

  async list(
    filter: ContentFilter = {},
    pagination: PaginationParams = { page: 1, limit: 20 },
    sort?: SortParams,
  ): Promise<PaginatedResult<CmsContent>> {
    return this.repo.list(filter, pagination, sort ?? { sortBy: "updatedAt", sortOrder: "desc" });
  }

  async getOverview(): Promise<{
    byStatus: Record<string, number>;
    recent: CmsContent[];
  }> {
    const [byStatus, recent] = await Promise.all([
      this.repo.countByStatus(),
      this.repo.list({}, { page: 1, limit: 8 }, { sortBy: "updatedAt", sortOrder: "desc" }),
    ]);
    return { byStatus, recent: recent.items };
  }

  async restoreRevision(contentId: string, revisionId: string): Promise<CmsContent> {
    const current = await this.repo.findById(contentId);
    if (!current) throw new NotFoundError("Content not found");
    const rev = current.revisions.find((r) => r.id === revisionId);
    if (!rev) throw new NotFoundError("Revision not found");

    return this.repo.update(contentId, {
      title: rev.title,
      bodyHtml: rev.bodyHtml,
      blocks: rev.blocks,
      seo: rev.seo,
    } as any);
  }

  async listRelatedBlog(
    post: CmsContent,
    limit = 4,
  ): Promise<CmsContent[]> {
    const byCategory = post.category
      ? await this.repo.list(
          { type: "blog", status: "published", category: post.category },
          { page: 1, limit: limit + 4 },
          { sortBy: "publishedAt", sortOrder: "desc" },
        )
      : { items: [] as CmsContent[] };

    const byTags =
      post.tags?.length > 0
        ? await this.repo.list(
            { type: "blog", status: "published", tags: post.tags },
            { page: 1, limit: limit + 4 },
            { sortBy: "publishedAt", sortOrder: "desc" },
          )
        : { items: [] as CmsContent[] };

    const recent = await this.repo.list(
      { type: "blog", status: "published" },
      { page: 1, limit: limit + 6 },
      { sortBy: "publishedAt", sortOrder: "desc" },
    );

    const seen = new Set<string>([post.id]);
    const related: CmsContent[] = [];
    for (const item of [...byCategory.items, ...byTags.items, ...recent.items]) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      related.push(item);
      if (related.length >= limit) break;
    }
    return related;
  }

  async listBlogTaxonomy(): Promise<{ categories: string[]; tags: string[] }> {
    const result = await this.repo.list(
      { type: "blog", status: "published" },
      { page: 1, limit: 200 },
      { sortBy: "publishedAt", sortOrder: "desc" },
    );
    const categories = new Set<string>();
    const tags = new Set<string>();
    for (const item of result.items) {
      if (item.category) categories.add(item.category);
      for (const tag of item.tags ?? []) tags.add(tag);
    }
    return {
      categories: Array.from(categories).sort(),
      tags: Array.from(tags).sort(),
    };
  }

  async trackView(id: string): Promise<void> {
    await this.repo.incrementViews(id);
  }
}

export default ContentService;
