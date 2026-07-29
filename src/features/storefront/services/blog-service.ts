import { ContentService } from "@/features/cms/services/content-service";
import type { CmsContent } from "@/features/cms/domain/content-entity";
import { logger } from "@/lib/utils/logger";

export class BlogService {
  private readonly contentService = new ContentService();

  async getPublishedPostBySlug(slug: string): Promise<CmsContent | null> {
    try {
      const item = await this.contentService["repo"].findBySlug("blog", slug);
      if (!item || item.status !== "published" || item.isDeleted) return null;
      return item;
    } catch (error) {
      logger.error("BlogService getPublishedPostBySlug failed", error, { slug });
      return null;
    }
  }

  async listPublishedPosts(page = 1, limit = 10) {
    try {
      return await this.contentService["repo"].list(
        { type: "blog", status: "published" },
        { page, limit },
        { sortBy: "publishedAt", sortOrder: "desc" },
      );
    } catch (error) {
      logger.error("BlogService listPublishedPosts failed", error);
      return { items: [], totalCount: 0, page: 1, pageSize: limit, totalPages: 0 };
    }
  }
}
