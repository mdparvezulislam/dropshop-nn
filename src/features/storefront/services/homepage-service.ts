import { PublicCatalogService } from "@/features/catalog/services/public-catalog-service";
import { ContentService } from "@/features/cms/services/content-service";
import { BRAND } from "@/config/brand";
import { logger } from "@/lib/utils/logger";
import type {
  PublicBlogPostSummary,
  PublicHomepageData,
  PublicSiteSettings,
} from "../domain/storefront-types";

export class HomepageService {
  private readonly catalogService = new PublicCatalogService();
  private readonly contentService = new ContentService();

  /**
   * Enterprise Storefront Data Aggregation Layer
   *
   * Centralized single source of truth for all public homepage sections.
   * Executes section queries concurrently with failsafe error boundary handling.
   */
  async getHomepageData(): Promise<PublicHomepageData> {
    const startTime = performance.now();

    const [
      categoriesResult,
      featuredResult,
      flashDealsResult,
      newArrivalsResult,
      trendingResult,
      brandsResult,
      collectionsResult,
      blogResult,
    ] = await Promise.allSettled([
      this.catalogService.getPublicCategories(),
      this.catalogService.listBadgeSection("featured", 8),
      this.catalogService.listBadgeSection("flash_sale", 10),
      this.catalogService.listBadgeSection("new_arrival", 12),
      this.catalogService.listBadgeSection("trending", 8),
      this.catalogService.getPublicBrands(),
      this.catalogService.getCollections(),
      this.fetchBlogPosts(),
    ]);

    const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
    const featuredProducts = featuredResult.status === "fulfilled" ? featuredResult.value : [];
    const flashDeals = flashDealsResult.status === "fulfilled" ? flashDealsResult.value : [];
    const newArrivals = newArrivalsResult.status === "fulfilled" ? newArrivalsResult.value : [];
    const trendingProducts = trendingResult.status === "fulfilled" ? trendingResult.value : [];
    const brands = brandsResult.status === "fulfilled" ? brandsResult.value : [];
    const collections = collectionsResult.status === "fulfilled" ? collectionsResult.value : [];
    const blogPosts = blogResult.status === "fulfilled" ? blogResult.value : [];

    if (categoriesResult.status === "rejected") {
      logger.error("HomepageService: categories fetch failed", categoriesResult.reason);
    }
    if (featuredResult.status === "rejected") {
      logger.error("HomepageService: featured products fetch failed", featuredResult.reason);
    }
    if (flashDealsResult.status === "rejected") {
      logger.error("HomepageService: flash deals fetch failed", flashDealsResult.reason);
    }
    if (newArrivalsResult.status === "rejected") {
      logger.error("HomepageService: new arrivals fetch failed", newArrivalsResult.reason);
    }
    if (trendingResult.status === "rejected") {
      logger.error("HomepageService: trending products fetch failed", trendingResult.reason);
    }
    if (brandsResult.status === "rejected") {
      logger.error("HomepageService: brands fetch failed", brandsResult.reason);
    }
    if (collectionsResult.status === "rejected") {
      logger.error("HomepageService: collections fetch failed", collectionsResult.reason);
    }
    if (blogResult.status === "rejected") {
      logger.error("HomepageService: blog posts fetch failed", blogResult.reason);
    }

    const durationMs = Math.round(performance.now() - startTime);

    logger.info("HomepageService: aggregated homepage payload built", {
      durationMs,
      categoriesCount: categories.length,
      featuredCount: featuredProducts.length,
      flashDealsCount: flashDeals.length,
      newArrivalsCount: newArrivals.length,
      trendingCount: trendingProducts.length,
      brandsCount: brands.length,
      collectionsCount: collections.length,
      blogCount: blogPosts.length,
    });

    const siteSettings: PublicSiteSettings = {
      brandName: BRAND.publicName,
      tagline: BRAND.tagline,
      announcementText: "সারা বাংলাদেশে হোম ডেলিভারি — অর্ডার করুন এখনই!",
    };

    return {
      categories,
      featuredProducts,
      flashDeals,
      newArrivals,
      trendingProducts,
      brands,
      collections,
      blogPosts,
      siteSettings,
      telemetry: {
        builtAt: new Date().toISOString(),
        buildDurationMs: durationMs,
      },
    };
  }

  private async fetchBlogPosts(): Promise<PublicBlogPostSummary[]> {
    try {
      const res = await this.contentService["repo"].list(
        { type: "blog", status: "published" },
        { page: 1, limit: 6 },
        { sortBy: "publishedAt", sortOrder: "desc" },
      );
      return res.items.map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt,
        coverImage: item.coverImage,
        category: item.category,
        publishedAt: item.publishedAt,
      }));
    } catch (error) {
      logger.error("HomepageService: fetchBlogPosts failed", error);
      return [];
    }
  }
}
