import { PublicCatalogService } from "@/features/catalog/services/public-catalog-service";
import type { PublicCollectionPage, PublicCatalogParams } from "@/features/catalog/domain/public-catalog-types";
import { logger } from "@/lib/utils/logger";

export class CollectionPageService {
  private readonly catalogService = new PublicCatalogService();

  async getCollectionPageData(
    slug: string,
    params: PublicCatalogParams = {},
  ): Promise<PublicCollectionPage | null> {
    try {
      return await this.catalogService.getCollectionPage(slug, params);
    } catch (error) {
      logger.error("CollectionPageService getCollectionPageData failed", error, { slug });
      return null;
    }
  }
}
