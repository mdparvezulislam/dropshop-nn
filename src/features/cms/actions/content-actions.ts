"use server";

import { cache } from "react";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/check-permission";
import { ContentService } from "../services/content-service";
import {
  createContentSchema,
  updateContentSchema,
  publishContentSchema,
  contentListFilterSchema,
} from "../types/validation";
import { revalidatePath } from "next/cache";
import type { CmsContent, ContentType } from "../domain/content-entity";
import { cachedQuery, purgeTags } from "@/lib/cache";
import { CACHE_TAGS, CACHE_TTL } from "@/config/cache-tags";

function actorFromSession(session: unknown): {
  id: string;
  name?: string;
} {
  const user = (session as { user?: { id?: string; name?: string | null } } | null)?.user;
  return { id: user?.id ?? "system", name: user?.name ?? undefined };
}

export async function createContentAction(formData: unknown): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Content.Create");
    const validated = createContentSchema.parse(formData);
    const service = new ContentService();
    const result = await service.create(validated, actorFromSession(session));
    revalidatePath("/dashboard/content");
    revalidatePath("/blog");
    purgeTags(CACHE_TAGS.PAGES, CACHE_TAGS.BLOG, CACHE_TAGS.HOMEPAGE);
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create content",
    };
  }
}

export async function updateContentAction(formData: unknown): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Content.Update");
    const validated = updateContentSchema.parse(formData);
    const service = new ContentService();
    const result = await service.update(validated, actorFromSession(session));
    revalidatePath("/dashboard/content");
    revalidatePath(`/dashboard/content/pages`);
    revalidatePath(`/dashboard/content/blog`);
    if (result.slug) {
      revalidatePath(`/blog/${result.slug}`);
      revalidatePath(`/p/${result.slug}`);
      purgeTags(CACHE_TAGS.PAGE(result.slug), CACHE_TAGS.BLOG_POST(result.slug));
    }
    purgeTags(CACHE_TAGS.PAGES, CACHE_TAGS.BLOG, CACHE_TAGS.HOMEPAGE);
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update content",
    };
  }
}

export async function publishContentAction(formData: unknown): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Content.Publish");
    const validated = publishContentSchema.parse(formData);
    const service = new ContentService();
    const result = await service.publish(validated.id, validated.scheduledAt);
    revalidatePath("/dashboard/content");
    revalidatePath("/blog");
    revalidatePath("/");
    purgeTags(CACHE_TAGS.PAGES, CACHE_TAGS.BLOG, CACHE_TAGS.HOMEPAGE);
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to publish content",
    };
  }
}

export async function archiveContentAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Content.Archive");
    const service = new ContentService();
    await service.archive(id);
    revalidatePath("/dashboard/content");
    purgeTags(CACHE_TAGS.PAGES, CACHE_TAGS.BLOG, CACHE_TAGS.HOMEPAGE);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to archive content",
    };
  }
}

export async function deleteContentAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Content.Delete");
    const service = new ContentService();
    await service.delete(id);
    revalidatePath("/dashboard/content");
    purgeTags(CACHE_TAGS.PAGES, CACHE_TAGS.BLOG, CACHE_TAGS.HOMEPAGE);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete content",
    };
  }
}

export async function getContentAction(id: string): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Content.View");
    const service = new ContentService();
    const result = await service.getById(id);
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load content",
    };
  }
}

export async function listContentAction(filters: unknown = {}): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Content.View");
    const validated = contentListFilterSchema.parse(filters ?? {});
    const service = new ContentService();
    const result = await service.list(
      {
        type: validated.type as ContentType | ContentType[] | undefined,
        status: validated.status,
        category: validated.category,
        search: validated.search,
      },
      { page: validated.page, limit: validated.limit },
    );
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to list content",
    };
  }
}

export async function getCmsOverviewAction(): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Content.View");
    const service = new ContentService();
    const result = await service.getOverview();
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load CMS overview",
    };
  }
}

// ── Public Cache-Optimized Actions ───────────────────────────────────────

const getPublicContentBySlugDataCache = (type: ContentType, slug: string) =>
  cachedQuery(
    async () => new ContentService().getPublishedBySlug(type, slug),
    [`public-cms-content`, type, slug],
    {
      tags: [CACHE_TAGS.PAGES, CACHE_TAGS.PAGE(slug)],
      revalidate: CACHE_TTL.STATIC,
    }
  )();
const cachedPublicContentBySlug = cache(async (type: ContentType, slug: string) =>
  getPublicContentBySlugDataCache(type, slug)
);

export async function getPublicContentBySlugAction(
  type: ContentType,
  slug: string,
): Promise<{ success: boolean; data?: CmsContent | null; error?: string }> {
  try {
    const result = await cachedPublicContentBySlug(type, slug);
    if (!result) return { success: true, data: null };
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load content",
    };
  }
}

const listPublicBlogDataCache = (filtersKey: string) =>
  cachedQuery(
    async () => {
      const filters = JSON.parse(filtersKey) as {
        page?: number;
        limit?: number;
        category?: string;
        tag?: string;
        search?: string;
      };
      return new ContentService().list(
        {
          type: "blog",
          status: "published",
          category: filters.category,
          tags: filters.tag ? [filters.tag] : undefined,
          search: filters.search,
        },
        { page: filters.page ?? 1, limit: filters.limit ?? 12 },
        { sortBy: "publishedAt", sortOrder: "desc" },
      );
    },
    [`public-blog-list`, filtersKey],
    {
      tags: [CACHE_TAGS.BLOG],
      revalidate: CACHE_TTL.TAXONOMY,
    }
  )();
const cachedPublicBlogList = cache(async (filtersKey: string) => listPublicBlogDataCache(filtersKey));

export async function listPublicBlogAction(
  filters: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    search?: string;
  } = {},
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const data = await cachedPublicBlogList(JSON.stringify(filters));
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to list blog posts",
    };
  }
}

const getPublicBlogPostDataCache = (slug: string) =>
  cachedQuery(
    async () => {
      const service = new ContentService();
      const post = await service.getPublishedBySlug("blog", slug);
      if (!post) return null;
      const related = await service.listRelatedBlog(post, 4);
      service.trackView(post.id).catch(() => undefined);
      return { post, related };
    },
    [`public-blog-post`, slug],
    {
      tags: [CACHE_TAGS.BLOG, CACHE_TAGS.BLOG_POST(slug)],
      revalidate: CACHE_TTL.TAXONOMY,
    }
  )();
const cachedPublicBlogPost = cache(async (slug: string) => getPublicBlogPostDataCache(slug));

export async function getPublicBlogPostAction(slug: string): Promise<{
  success: boolean;
  data?: {
    post: unknown;
    related: unknown[];
  } | null;
  error?: string;
}> {
  try {
    const data = await cachedPublicBlogPost(slug);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load blog post",
    };
  }
}

const getBlogTaxonomyDataCache = cachedQuery(
  async () => new ContentService().listBlogTaxonomy(),
  ["public-blog-taxonomy"],
  { tags: [CACHE_TAGS.BLOG], revalidate: CACHE_TTL.TAXONOMY }
);
const cachedBlogTaxonomy = cache(async () => getBlogTaxonomyDataCache());

export async function getBlogTaxonomyAction(): Promise<{
  success: boolean;
  data?: { categories: string[]; tags: string[] };
  error?: string;
}> {
  try {
    const data = await cachedBlogTaxonomy();
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load taxonomy",
    };
  }
}

export async function restoreContentRevisionAction(
  contentId: string,
  revisionId: string,
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Content.Update");
    const service = new ContentService();
    const result = await service.restoreRevision(contentId, revisionId);
    revalidatePath("/dashboard/content");
    purgeTags(CACHE_TAGS.PAGES, CACHE_TAGS.BLOG, CACHE_TAGS.HOMEPAGE);
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to restore revision",
    };
  }
}
