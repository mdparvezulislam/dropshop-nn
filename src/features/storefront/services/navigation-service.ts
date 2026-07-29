import { PublicCatalogService } from "@/features/catalog/services/public-catalog-service";
import type { PublicCategoryInfo } from "@/features/catalog/domain/public-catalog-types";
import { logger } from "@/lib/utils/logger";

export interface PublicNavigationData {
  categories: PublicCategoryInfo[];
  topCategories: PublicCategoryInfo[];
}

export class NavigationService {
  private readonly catalogService = new PublicCatalogService();

  async getNavigationData(): Promise<PublicNavigationData> {
    try {
      const categories = await this.catalogService.getPublicCategories();
      const topCategories = categories
        .filter((c) => c.parentCategoryId === null)
        .slice(0, 8);

      return {
        categories,
        topCategories,
      };
    } catch (error) {
      logger.error("NavigationService getNavigationData failed", error);
      return { categories: [], topCategories: [] };
    }
  }
}
