import { PublicCatalogService } from "@/features/catalog/services/public-catalog-service";
import type { PublicAutocomplete, PublicCatalogParams, PublicListResult } from "@/features/catalog/domain/public-catalog-types";
import { logger } from "@/lib/utils/logger";

export class SearchService {
  private readonly catalogService = new PublicCatalogService();

  async autocomplete(query: string): Promise<PublicAutocomplete> {
    try {
      return await this.catalogService.autocomplete(query);
    } catch (error) {
      logger.error("SearchService autocomplete failed", error, { query });
      return { products: [], categories: [], brands: [], suggestions: [] };
    }
  }

  async searchCatalog(
    query: string,
    params: PublicCatalogParams = {},
  ): Promise<(PublicListResult & { query: string }) | null> {
    try {
      const result = await this.catalogService.listCatalog({
        ...params,
        search: query,
        sort: params.sort ?? "relevance",
      });
      return { ...result, query };
    } catch (error) {
      logger.error("SearchService searchCatalog failed", error, { query });
      return null;
    }
  }
}
