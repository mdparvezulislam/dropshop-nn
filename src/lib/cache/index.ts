import { unstable_cache, revalidateTag, updateTag, revalidatePath } from "next/cache";
import { logger } from "@/lib/utils/logger";

interface CacheOptions {
  tags?: string[];
  revalidate?: number | false;
}

/**
 * Enterprise Next.js 16 Data Cache Wrapper (`unstable_cache`)
 *
 * Wraps async database queries/service functions into Next.js Data Cache.
 */
export function cachedQuery<T, P extends unknown[]>(
  fn: (...args: P) => Promise<T>,
  keyParts: string[],
  options: CacheOptions = {},
): (...args: P) => Promise<T> {
  return unstable_cache(fn, keyParts, {
    tags: options.tags,
    revalidate: options.revalidate,
  });
}

/**
 * Safely invalidates specified cache tags across Next.js 16 Data Cache.
 */
export function purgeTags(...tags: string[]): void {
  for (const tag of tags) {
    if (!tag) continue;
    try {
      updateTag(tag);
      revalidateTag(tag, "default");
      logger.info(`[Cache] Invalidated cache tag: "${tag}"`);
    } catch (error) {
      logger.error(`[Cache] Failed to invalidate cache tag: "${tag}"`, error);
    }
  }
}

/**
 * Safely invalidates specified route paths.
 */
export function purgePaths(...paths: string[]): void {
  for (const path of paths) {
    if (!path) continue;
    try {
      revalidatePath(path);
      logger.info(`[Cache] Invalidated path: "${path}"`);
    } catch (error) {
      logger.error(`[Cache] Failed to invalidate path: "${path}"`, error);
    }
  }
}
