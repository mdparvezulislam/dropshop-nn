import type { SearchProvider, SearchResultItem } from "@/lib/platform/platform-types";
import { logger } from "@/lib/utils/logger";

const SEARCH_PROVIDERS = new Map<string, SearchProvider>();

export class GlobalSearch {
  private constructor() {}

  static registerProvider(provider: SearchProvider): void {
    if (SEARCH_PROVIDERS.has(provider.entityType)) {
      throw new Error(`Search provider for "${provider.entityType}" is already registered`);
    }
    SEARCH_PROVIDERS.set(provider.entityType, provider);
    logger.info(`GlobalSearch: registered provider for "${provider.entityType}"`);
  }

  static getProvider(entityType: string): SearchProvider | undefined {
    return SEARCH_PROVIDERS.get(entityType);
  }

  static getAllProviders(): SearchProvider[] {
    return Array.from(SEARCH_PROVIDERS.values());
  }

  static isRegistered(entityType: string): boolean {
    return SEARCH_PROVIDERS.has(entityType);
  }

  static async searchAll(query: string, limit: number = 5): Promise<SearchResultItem[]> {
    if (!query.trim()) return [];

    const results: SearchResultItem[] = [];
    const providers = SEARCH_PROVIDERS.values();

    for (const provider of providers) {
      try {
        const items = await provider.search(query, limit);
        results.push(...items);
      } catch (error) {
        logger.error(`GlobalSearch: provider "${provider.entityType}" search failed`, error);
      }
    }

    return results
      .sort((a, b) => a.title.localeCompare(b.title))
      .slice(0, limit * SEARCH_PROVIDERS.size);
  }

  static async searchByType(
    entityType: string,
    query: string,
    limit: number = 10,
  ): Promise<SearchResultItem[]> {
    const provider = SEARCH_PROVIDERS.get(entityType);
    if (!provider) return [];
    try {
      return await provider.search(query, limit);
    } catch (error) {
      logger.error(`GlobalSearch: provider "${entityType}" search failed`, error);
      return [];
    }
  }

  static clear(): void {
    SEARCH_PROVIDERS.clear();
  }
}
