"use server";

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
    }
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

export async function getPublicContentBySlugAction(
  type: ContentType,
  slug: string,
): Promise<{ success: boolean; data?: CmsContent | null; error?: string }> {
  try {
    const service = new ContentService();
    const result = await service.getPublishedBySlug(type, slug);
    if (!result) return { success: true, data: null };
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load content",
    };
  }
}

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
    const service = new ContentService();
    const result = await service.list(
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
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to list blog posts",
    };
  }
}

export async function getPublicBlogPostAction(slug: string): Promise<{
  success: boolean;
  data?: {
    post: unknown;
    related: unknown[];
  } | null;
  error?: string;
}> {
  try {
    const service = new ContentService();
    const post = await service.getPublishedBySlug("blog", slug);
    if (!post) return { success: true, data: null };
    const related = await service.listRelatedBlog(post, 4);
    service.trackView(post.id).catch(() => undefined);
    return { success: true, data: { post, related } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load blog post",
    };
  }
}

export async function getBlogTaxonomyAction(): Promise<{
  success: boolean;
  data?: { categories: string[]; tags: string[] };
  error?: string;
}> {
  try {
    const service = new ContentService();
    const data = await service.listBlogTaxonomy();
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
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to restore revision",
    };
  }
}
