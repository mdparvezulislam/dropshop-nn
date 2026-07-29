import { PublicCatalogService } from "@/features/catalog/services/public-catalog-service";
import type { PublicProductDetail } from "@/features/catalog/services/public-catalog-service";
import type { PublicProductCard } from "@/features/catalog/domain/public-catalog-types";
import { logger } from "@/lib/utils/logger";

export interface PublicProductPageData {
  detail: PublicProductDetail | null;
  related: {
    sameCategory: PublicProductCard[];
    recommended: PublicProductCard[];
    sameBrand: PublicProductCard[];
  };
}

export class ProductPageService {
  private readonly catalogService = new PublicCatalogService();

  async getProductPageData(
    slug: string,
    viewerContext: { isAdmin?: boolean; isReseller?: boolean; isWholesaler?: boolean } = {},
  ): Promise<PublicProductPageData> {
    try {
      const [detailRes, relatedRes] = await Promise.allSettled([
        this.catalogService.getProductDetail(slug, {
          isAdmin: viewerContext.isAdmin ?? false,
          isReseller: viewerContext.isReseller ?? false,
          isWholesaler: viewerContext.isWholesaler ?? false,
        }),
        this.catalogService.getRelatedForProduct(slug),
      ]);

      const detail = detailRes.status === "fulfilled" ? detailRes.value : null;
      const related =
        relatedRes.status === "fulfilled" && relatedRes.value
          ? relatedRes.value
          : { sameCategory: [], recommended: [], sameBrand: [] };

      return {
        detail,
        related,
      };
    } catch (error) {
      logger.error("ProductPageService getProductPageData failed", error, { slug });
      return {
        detail: null,
        related: { sameCategory: [], recommended: [], sameBrand: [] },
      };
    }
  }
}
