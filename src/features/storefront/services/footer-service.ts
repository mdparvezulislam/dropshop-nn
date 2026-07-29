import { PublicCatalogService } from "@/features/catalog/services/public-catalog-service";
import type { PublicBrandInfo, PublicCategoryInfo } from "@/features/catalog/domain/public-catalog-types";
import { BRAND } from "@/config/brand";
import { logger } from "@/lib/utils/logger";

export interface PublicFooterData {
  categories: PublicCategoryInfo[];
  brands: PublicBrandInfo[];
  siteInfo: {
    name: string;
    tagline: string;
    contactPhone?: string;
    contactEmail?: string;
  };
}

export class FooterService {
  private readonly catalogService = new PublicCatalogService();

  async getFooterData(): Promise<PublicFooterData> {
    try {
      const [categoriesRes, brandsRes] = await Promise.allSettled([
        this.catalogService.getPublicCategories(),
        this.catalogService.getPublicBrands(),
      ]);

      const categories = categoriesRes.status === "fulfilled" ? categoriesRes.value : [];
      const brands = brandsRes.status === "fulfilled" ? brandsRes.value : [];

      return {
        categories,
        brands,
        siteInfo: {
          name: BRAND.publicName,
          tagline: BRAND.tagline,
          contactPhone: "+880 1700-000000",
          contactEmail: "support@nnenterprise.com",
        },
      };
    } catch (error) {
      logger.error("FooterService getFooterData failed", error);
      return {
        categories: [],
        brands: [],
        siteInfo: { name: BRAND.publicName, tagline: BRAND.tagline },
      };
    }
  }
}
