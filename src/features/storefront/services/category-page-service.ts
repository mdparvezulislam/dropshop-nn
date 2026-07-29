import { PublicCatalogService } from "@/features/catalog/services/public-catalog-service";
import type { PublicCategoryPage, PublicCatalogParams } from "@/features/catalog/domain/public-catalog-types";
import { logger } from "@/lib/utils/logger";

export class CategoryPageService {
  private readonly catalogService = new PublicCatalogService();

  async getCategoryPageData(
    slug: string,
    params: PublicCatalogParams = {},
  ): Promise<PublicCategoryPage | null> {
    try {
      return await this.catalogService.getCategoryPage(slug, params);
    } catch (error) {
      logger.error("CategoryPageService getCategoryPageData failed", error, { slug });
      return null;
    }
  }
}
