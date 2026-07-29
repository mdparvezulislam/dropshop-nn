import { PublicCatalogService } from "@/features/catalog/services/public-catalog-service";
import type { PublicBrandPage, PublicCatalogParams } from "@/features/catalog/domain/public-catalog-types";
import { logger } from "@/lib/utils/logger";

export class BrandPageService {
  private readonly catalogService = new PublicCatalogService();

  async getBrandPageData(
    slug: string,
    params: PublicCatalogParams = {},
  ): Promise<PublicBrandPage | null> {
    try {
      return await this.catalogService.getBrandPage(slug, params);
    } catch (error) {
      logger.error("BrandPageService getBrandPageData failed", error, { slug });
      return null;
    }
  }
}
