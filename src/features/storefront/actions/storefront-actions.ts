"use server";

import { cache } from "react";
import { storefrontGateway } from "../gateway/storefront-gateway";
import type { PublicHomepageData, PublicHomepageResult } from "../domain/storefront-types";
import type { PublicNavigationData } from "../services/navigation-service";
import type { PublicFooterData } from "../services/footer-service";
import type { PublicProductPageData } from "../services/product-page-service";
import type { PublicCatalogParams } from "@/features/catalog/domain/public-catalog-types";
import { cachedQuery } from "@/lib/cache";
import { CACHE_TAGS, CACHE_TTL } from "@/config/cache-tags";
import { logger } from "@/lib/utils/logger";

// ── Caching Definitions ──────────────────────────────────────────────────

const getHomepageDataCache = cachedQuery(
  async (): Promise<PublicHomepageData> => storefrontGateway.getHomepageData(),
  ["public-homepage-aggregated"],
  {
    tags: [
      CACHE_TAGS.HOMEPAGE,
      CACHE_TAGS.PRODUCTS,
      CACHE_TAGS.CATEGORIES,
      CACHE_TAGS.BRANDS,
      CACHE_TAGS.COLLECTIONS,
      CACHE_TAGS.FEATURED_PRODUCTS,
      CACHE_TAGS.FLASH_DEALS,
      CACHE_TAGS.NEW_ARRIVALS,
      CACHE_TAGS.TRENDING_PRODUCTS,
      CACHE_TAGS.BLOG,
    ],
    revalidate: CACHE_TTL.MERCHANDISING,
  },
);
const cachedHomepageData = cache(async () => getHomepageDataCache());

const getNavigationDataCache = cachedQuery(
  async (): Promise<PublicNavigationData> => storefrontGateway.getNavigationData(),
  ["public-navigation-aggregated"],
  {
    tags: [CACHE_TAGS.CATEGORIES, CACHE_TAGS.HOMEPAGE],
    revalidate: CACHE_TTL.TAXONOMY,
  },
);
const cachedNavigationData = cache(async () => getNavigationDataCache());

const getFooterDataCache = cachedQuery(
  async (): Promise<PublicFooterData> => storefrontGateway.getFooterData(),
  ["public-footer-aggregated"],
  {
    tags: [CACHE_TAGS.CATEGORIES, CACHE_TAGS.BRANDS, CACHE_TAGS.SETTINGS],
    revalidate: CACHE_TTL.TAXONOMY,
  },
);
const cachedFooterData = cache(async () => getFooterDataCache());

// ── Public Storefront Server Actions ─────────────────────────────────────

export async function getPublicHomepageDataAction(): Promise<PublicHomepageResult> {
  try {
    const data = await cachedHomepageData();
    return { success: true, data };
  } catch (error) {
    logger.error("getPublicHomepageDataAction failed", error);
    return {
      success: false,
      error: "ডেটা লোড করা যায়নি। কিছুক্ষণ পরে আবার চেষ্টা করুন।",
      data: {
        categories: [],
        featuredProducts: [],
        flashDeals: [],
        newArrivals: [],
        trendingProducts: [],
        brands: [],
        collections: [],
        blogPosts: [],
        siteSettings: {
          brandName: "NN Enterprise",
          tagline: "Commerce OS",
        },
        telemetry: {
          builtAt: new Date().toISOString(),
          buildDurationMs: 0,
        },
      },
    };
  }
}

export async function getStorefrontNavigationAction(): Promise<{
  success: boolean;
  data: PublicNavigationData;
}> {
  try {
    const data = await cachedNavigationData();
    return { success: true, data };
  } catch (error) {
    logger.error("getStorefrontNavigationAction failed", error);
    return { success: false, data: { categories: [], topCategories: [] } };
  }
}

export async function getStorefrontFooterAction(): Promise<{
  success: boolean;
  data: PublicFooterData;
}> {
  try {
    const data = await cachedFooterData();
    return { success: true, data };
  } catch (error) {
    logger.error("getStorefrontFooterAction failed", error);
    return {
      success: false,
      data: { categories: [], brands: [], siteInfo: { name: "NN Enterprise", tagline: "Commerce OS" } },
    };
  }
}

export async function getStorefrontProductAction(
  slug: string,
  viewerContext: { isAdmin?: boolean; isReseller?: boolean; isWholesaler?: boolean } = {},
): Promise<{ success: boolean; data: PublicProductPageData }> {
  try {
    const data = await storefrontGateway.getProductPageData(slug, viewerContext);
    return { success: true, data };
  } catch (error) {
    logger.error("getStorefrontProductAction failed", error, { slug });
    return {
      success: false,
      data: { detail: null, related: { sameCategory: [], recommended: [], sameBrand: [] } },
    };
  }
}

export async function getStorefrontCategoryAction(slug: string, params: PublicCatalogParams = {}) {
  try {
    const data = await storefrontGateway.getCategoryPageData(slug, params);
    return { success: true, data };
  } catch (error) {
    logger.error("getStorefrontCategoryAction failed", error, { slug });
    return { success: false, data: null };
  }
}

export async function getStorefrontBrandAction(slug: string, params: PublicCatalogParams = {}) {
  try {
    const data = await storefrontGateway.getBrandPageData(slug, params);
    return { success: true, data };
  } catch (error) {
    logger.error("getStorefrontBrandAction failed", error, { slug });
    return { success: false, data: null };
  }
}

export async function getStorefrontCollectionAction(slug: string, params: PublicCatalogParams = {}) {
  try {
    const data = await storefrontGateway.getCollectionPageData(slug, params);
    return { success: true, data };
  } catch (error) {
    logger.error("getStorefrontCollectionAction failed", error, { slug });
    return { success: false, data: null };
  }
}

export async function getStorefrontSearchAction(query: string, params: PublicCatalogParams = {}) {
  try {
    const data = await storefrontGateway.searchCatalog(query, params);
    return { success: true, data };
  } catch (error) {
    logger.error("getStorefrontSearchAction failed", error, { query });
    return { success: false, data: null };
  }
}
