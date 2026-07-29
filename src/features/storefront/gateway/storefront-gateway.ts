import { HomepageService } from "../services/homepage-service";
import { NavigationService } from "../services/navigation-service";
import { FooterService } from "../services/footer-service";
import { ProductPageService } from "../services/product-page-service";
import { CategoryPageService } from "../services/category-page-service";
import { BrandPageService } from "../services/brand-page-service";
import { CollectionPageService } from "../services/collection-page-service";
import { SearchService } from "../services/search-service";
import { BlogService } from "../services/blog-service";
import { SeoService } from "../services/seo-service";

import type { PublicHomepageData } from "../domain/storefront-types";
import type { PublicNavigationData } from "../services/navigation-service";
import type { PublicFooterData } from "../services/footer-service";
import type { PublicProductPageData } from "../services/product-page-service";
import type { PublicCatalogParams } from "@/features/catalog/domain/public-catalog-types";

export class StorefrontGateway {
  private readonly homepageService = new HomepageService();
  private readonly navigationService = new NavigationService();
  private readonly footerService = new FooterService();
  private readonly productPageService = new ProductPageService();
  private readonly categoryPageService = new CategoryPageService();
  private readonly brandPageService = new BrandPageService();
  private readonly collectionPageService = new CollectionPageService();
  private readonly searchService = new SearchService();
  private readonly blogService = new BlogService();
  private readonly seoService = new SeoService();

  // ── Gateway Entry Points ──────────────────────────────────────────────────

  async getHomepageData(): Promise<PublicHomepageData> {
    return this.homepageService.getHomepageData();
  }

  async getNavigationData(): Promise<PublicNavigationData> {
    return this.navigationService.getNavigationData();
  }

  async getFooterData(): Promise<PublicFooterData> {
    return this.footerService.getFooterData();
  }

  async getProductPageData(
    slug: string,
    viewerContext: { isAdmin?: boolean; isReseller?: boolean; isWholesaler?: boolean } = {},
  ): Promise<PublicProductPageData> {
    return this.productPageService.getProductPageData(slug, viewerContext);
  }

  async getCategoryPageData(slug: string, params: PublicCatalogParams = {}) {
    return this.categoryPageService.getCategoryPageData(slug, params);
  }

  async getBrandPageData(slug: string, params: PublicCatalogParams = {}) {
    return this.brandPageService.getBrandPageData(slug, params);
  }

  async getCollectionPageData(slug: string, params: PublicCatalogParams = {}) {
    return this.collectionPageService.getCollectionPageData(slug, params);
  }

  async autocompleteSearch(query: string) {
    return this.searchService.autocomplete(query);
  }

  async searchCatalog(query: string, params: PublicCatalogParams = {}) {
    return this.searchService.searchCatalog(query, params);
  }

  async getBlogPosts(page = 1, limit = 10) {
    return this.blogService.listPublishedPosts(page, limit);
  }

  async getBlogPostBySlug(slug: string) {
    return this.blogService.getPublishedPostBySlug(slug);
  }

  getSeoService(): SeoService {
    return this.seoService;
  }
}

export const storefrontGateway = new StorefrontGateway();
