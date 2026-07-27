"use server";

import { cache } from "react";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { PublicCatalogService } from "../services/public-catalog-service";
import type { PublicProductDetail } from "../services/public-catalog-service";
import type {
  PublicActionResult,
  PublicAutocomplete,
  PublicBrandInfo,
  PublicBrandPage,
  PublicCatalogParams,
  PublicCategoryInfo,
  PublicCategoryPage,
  PublicCollectionInfo,
  PublicCollectionPage,
  PublicListResult,
  PublicProductCard,
} from "../domain/public-catalog-types";
import { logger } from "@/lib/utils/logger";
import { cachedQuery } from "@/lib/cache";
import { CACHE_TAGS, CACHE_TTL } from "@/config/cache-tags";

// ── Validation ───────────────────────────────────────────────────────────
const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .regex(/^[a-zA-Z0-9_-]+$/, "invalid slug");

const limitSchema = z.number().int().min(1).max(48);

const catalogParamsSchema = z
  .object({
    page: z.coerce.number().int().min(1).max(1000).optional(),
    limit: limitSchema.optional(),
    categorySlug: slugSchema.optional(),
    brandSlug: slugSchema.optional(),
    search: z.string().trim().min(1).max(200).optional(),
    minPrice: z.coerce.number().min(0).max(100_000_000).optional(),
    maxPrice: z.coerce.number().min(0).max(100_000_000).optional(),
    inStock: z.boolean().optional(),
    onSale: z.boolean().optional(),
    badge: z.enum(["featured", "trending", "new_arrival", "flash_sale"]).optional(),
    sort: z
      .enum(["newest", "price_asc", "price_desc", "featured", "name_asc", "relevance"])
      .optional(),
  })
  .strip();

const searchQuerySchema = z.string().trim().min(1).max(200);

function fail(context: string, error: unknown): { success: false; error: string } {
  logger.error(`public-actions ${context} failed`, error);
  return { success: false, error: "ডেটা লোড করা যায়নি। কিছুক্ষণ পরে আবার চেষ্টা করুন।" };
}

const service = () => new PublicCatalogService();

// ── Enterprise Next.js 16 Data Cache + React Request Memoization ─────────

const getCategoriesDataCache = cachedQuery(
  async () => service().getPublicCategories(),
  ["public-categories-all"],
  { tags: [CACHE_TAGS.CATEGORIES], revalidate: CACHE_TTL.TAXONOMY }
);
const cachedCategories = cache(async () => getCategoriesDataCache());

const getBrandsDataCache = cachedQuery(
  async () => service().getPublicBrands(),
  ["public-brands-all"],
  { tags: [CACHE_TAGS.BRANDS], revalidate: CACHE_TTL.TAXONOMY }
);
const cachedBrands = cache(async () => getBrandsDataCache());

const getCollectionsDataCache = cachedQuery(
  async () => service().getCollections(),
  ["public-collections-all"],
  { tags: [CACHE_TAGS.COLLECTIONS], revalidate: CACHE_TTL.TAXONOMY }
);
const cachedCollections = cache(async () => getCollectionsDataCache());

const getBadgeSectionDataCache = (badge: "featured" | "trending" | "new_arrival" | "flash_sale", limit: number) =>
  cachedQuery(
    async () => service().listBadgeSection(badge, limit),
    [`public-badge-section-${badge}-${limit}`],
    {
      tags: [
        CACHE_TAGS.PRODUCTS,
        badge === "featured"
          ? CACHE_TAGS.FEATURED_PRODUCTS
          : badge === "flash_sale"
            ? CACHE_TAGS.FLASH_DEALS
            : badge === "new_arrival"
              ? CACHE_TAGS.NEW_ARRIVALS
              : CACHE_TAGS.TRENDING_PRODUCTS,
      ],
      revalidate: CACHE_TTL.MERCHANDISING,
    }
  )();

const getCategoryPageDataCache = (slug: string, paramsKey: string) =>
  cachedQuery(
    async () => service().getCategoryPage(slug, JSON.parse(paramsKey) as PublicCatalogParams),
    [`public-category-page`, slug, paramsKey],
    {
      tags: [CACHE_TAGS.CATEGORIES, CACHE_TAGS.CATEGORY(slug), CACHE_TAGS.PRODUCTS],
      revalidate: CACHE_TTL.CATALOG,
    }
  )();
const cachedCategoryPage = cache(async (slug: string, paramsKey: string) =>
  getCategoryPageDataCache(slug, paramsKey)
);

const getBrandPageDataCache = (slug: string, paramsKey: string) =>
  cachedQuery(
    async () => service().getBrandPage(slug, JSON.parse(paramsKey) as PublicCatalogParams),
    [`public-brand-page`, slug, paramsKey],
    {
      tags: [CACHE_TAGS.BRANDS, CACHE_TAGS.BRAND(slug), CACHE_TAGS.PRODUCTS],
      revalidate: CACHE_TTL.CATALOG,
    }
  )();
const cachedBrandPage = cache(async (slug: string, paramsKey: string) =>
  getBrandPageDataCache(slug, paramsKey)
);

const getCollectionPageDataCache = (slug: string, paramsKey: string) =>
  cachedQuery(
    async () => service().getCollectionPage(slug, JSON.parse(paramsKey) as PublicCatalogParams),
    [`public-collection-page`, slug, paramsKey],
    {
      tags: [CACHE_TAGS.COLLECTIONS, CACHE_TAGS.COLLECTION(slug), CACHE_TAGS.PRODUCTS],
      revalidate: CACHE_TTL.CATALOG,
    }
  )();
const cachedCollectionPage = cache(async (slug: string, paramsKey: string) =>
  getCollectionPageDataCache(slug, paramsKey)
);

const getProductDetailDataCache = (slug: string, viewerKey: string) =>
  cachedQuery(
    async () => {
      const [isAdmin, isReseller, isWholesaler] = viewerKey.split(":").map((v) => v === "1");
      return service().getProductDetail(slug, { isAdmin, isReseller, isWholesaler });
    },
    [`public-product-detail`, slug, viewerKey],
    {
      tags: [CACHE_TAGS.PRODUCTS, CACHE_TAGS.PRODUCT_SLUG(slug)],
      revalidate: CACHE_TTL.CATALOG,
    }
  )();
const cachedProductDetail = cache(async (slug: string, viewerKey: string) =>
  getProductDetailDataCache(slug, viewerKey)
);

const getRelatedDataCache = (slug: string) =>
  cachedQuery(
    async () => service().getRelatedForProduct(slug),
    [`public-product-related`, slug],
    {
      tags: [CACHE_TAGS.PRODUCTS, CACHE_TAGS.PRODUCT_SLUG(slug)],
      revalidate: CACHE_TTL.CATALOG,
    }
  )();
const cachedRelated = cache(async (slug: string) => getRelatedDataCache(slug));

async function viewerKey(): Promise<string> {
  try {
    const session = await auth();
    const user = session?.user as { role?: string; memberships?: string[] } | undefined;
    if (!user) return "0:0:0";
    const role = (user.role ?? "").toLowerCase().replace(/\s+/g, "_");
    const memberships = user.memberships ?? [];
    const isAdmin = role === "admin" || role === "super_admin";
    const isReseller = memberships.includes("reseller") || role === "reseller";
    const isWholesaler = memberships.includes("wholesaler") || role === "wholesaler";
    return `${isAdmin ? 1 : 0}:${isReseller ? 1 : 0}:${isWholesaler ? 1 : 0}`;
  } catch {
    return "0:0:0";
  }
}

// ── Homepage / merchandising sections ────────────────────────────────────

async function badgeSection(
  badge: "featured" | "trending" | "new_arrival" | "flash_sale",
  limit: number,
): Promise<PublicActionResult<PublicProductCard[]>> {
  try {
    const safeLimit = limitSchema.parse(limit);
    const data = await getBadgeSectionDataCache(badge, safeLimit);
    return { success: true, data };
  } catch (error) {
    return fail(`badgeSection:${badge}`, error);
  }
}

export async function getPublicFeaturedProductsAction(
  limit = 8,
): Promise<PublicActionResult<PublicProductCard[]>> {
  return badgeSection("featured", limit);
}

export async function getPublicTrendingProductsAction(
  limit = 8,
): Promise<PublicActionResult<PublicProductCard[]>> {
  return badgeSection("trending", limit);
}

export async function getPublicNewArrivalsAction(
  limit = 8,
): Promise<PublicActionResult<PublicProductCard[]>> {
  return badgeSection("new_arrival", limit);
}

export async function getPublicFlashDealsAction(
  limit = 6,
): Promise<PublicActionResult<PublicProductCard[]>> {
  return badgeSection("flash_sale", limit);
}

// ── Catalog listing (/products) ──────────────────────────────────────────

export async function getPublicCatalogAction(
  params: PublicCatalogParams = {},
): Promise<PublicActionResult<PublicListResult>> {
  try {
    const parsed = catalogParamsSchema.parse(params);
    const data = await service().listCatalog(parsed);
    return { success: true, data };
  } catch (error) {
    return fail("getPublicCatalogAction", error);
  }
}

// ── Taxonomy ─────────────────────────────────────────────────────────────

export async function getPublicCategoriesAction(): Promise<
  PublicActionResult<PublicCategoryInfo[]>
> {
  try {
    return { success: true, data: await cachedCategories() };
  } catch (error) {
    return fail("getPublicCategoriesAction", error);
  }
}

export async function getPublicBrandsAction(): Promise<PublicActionResult<PublicBrandInfo[]>> {
  try {
    return { success: true, data: await cachedBrands() };
  } catch (error) {
    return fail("getPublicBrandsAction", error);
  }
}

export async function getPublicCategoryPageAction(
  slug: string,
  params: PublicCatalogParams = {},
): Promise<PublicActionResult<PublicCategoryPage | null>> {
  try {
    const safeSlug = slugSchema.parse(slug);
    const parsed = catalogParamsSchema.parse(params);
    const data = await cachedCategoryPage(safeSlug, JSON.stringify(parsed));
    return { success: true, data };
  } catch (error) {
    return fail("getPublicCategoryPageAction", error);
  }
}

export async function getPublicBrandPageAction(
  slug: string,
  params: PublicCatalogParams = {},
): Promise<PublicActionResult<PublicBrandPage | null>> {
  try {
    const safeSlug = slugSchema.parse(slug);
    const parsed = catalogParamsSchema.parse(params);
    const data = await cachedBrandPage(safeSlug, JSON.stringify(parsed));
    return { success: true, data };
  } catch (error) {
    return fail("getPublicBrandPageAction", error);
  }
}

// ── Collections ──────────────────────────────────────────────────────────

export async function getPublicCollectionsAction(): Promise<
  PublicActionResult<PublicCollectionInfo[]>
> {
  try {
    return { success: true, data: await cachedCollections() };
  } catch (error) {
    return fail("getPublicCollectionsAction", error);
  }
}

export async function getPublicCollectionPageAction(
  slug: string,
  params: PublicCatalogParams = {},
): Promise<PublicActionResult<PublicCollectionPage | null>> {
  try {
    const safeSlug = slugSchema.parse(slug);
    const parsed = catalogParamsSchema.parse(params);
    const data = await cachedCollectionPage(safeSlug, JSON.stringify(parsed));
    return { success: true, data };
  } catch (error) {
    return fail("getPublicCollectionPageAction", error);
  }
}

// ── Search ───────────────────────────────────────────────────────────────

export async function searchProductsAction(
  query: string,
  params: PublicCatalogParams = {},
): Promise<PublicActionResult<(PublicListResult & { query: string }) | null>> {
  try {
    const q = searchQuerySchema.safeParse(query);
    if (!q.success) return { success: true, data: null };
    const parsed = catalogParamsSchema.parse(params);
    const result = await service().listCatalog({
      ...parsed,
      search: q.data,
      sort: parsed.sort ?? "relevance",
    });
    return { success: true, data: { ...result, query: q.data } };
  } catch (error) {
    return fail("searchProductsAction", error);
  }
}

export async function searchAutocompleteAction(
  query: string,
): Promise<PublicActionResult<PublicAutocomplete>> {
  try {
    const q = searchQuerySchema.safeParse(query);
    if (!q.success) {
      return { success: true, data: { products: [], categories: [], brands: [], suggestions: [] } };
    }
    return { success: true, data: await service().autocomplete(q.data) };
  } catch (error) {
    return fail("searchAutocompleteAction", error);
  }
}

// ── Product detail ───────────────────────────────────────────────────────

export async function getPublicProductBySlugAction(
  slug: string,
): Promise<PublicActionResult<PublicProductDetail | null>> {
  try {
    const safeSlug = slugSchema.parse(slug);
    const viewer = await viewerKey();
    const data = await cachedProductDetail(safeSlug, viewer);
    return { success: true, data };
  } catch (error) {
    return fail("getPublicProductBySlugAction", error);
  }
}

export async function getPublicRelatedProductsAction(slug: string): Promise<
  PublicActionResult<{
    sameCategory: PublicProductCard[];
    recommended: PublicProductCard[];
    sameBrand: PublicProductCard[];
  } | null>
> {
  try {
    const safeSlug = slugSchema.parse(slug);
    return { success: true, data: await cachedRelated(safeSlug) };
  } catch (error) {
    return fail("getPublicRelatedProductsAction", error);
  }
}
