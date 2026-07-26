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

// ── Validation ───────────────────────────────────────────────────────────
// Every public entry point validates its input here. Slugs are constrained
// to slug charset so nothing user-controlled ever reaches a Mongo operator.

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

// ── Request-deduped fetchers (generateMetadata + page share one fetch) ───

const cachedCategories = cache(async () => service().getPublicCategories());
const cachedBrands = cache(async () => service().getPublicBrands());
const cachedCollections = cache(async () => service().getCollections());
const cachedProductDetail = cache(async (slug: string, viewerKey: string) => {
  const [isAdmin, isReseller, isWholesaler] = viewerKey.split(":").map((v) => v === "1");
  return service().getProductDetail(slug, { isAdmin, isReseller, isWholesaler });
});
const cachedCategoryPage = cache(async (slug: string, paramsKey: string) =>
  service().getCategoryPage(slug, JSON.parse(paramsKey) as PublicCatalogParams),
);
const cachedBrandPage = cache(async (slug: string, paramsKey: string) =>
  service().getBrandPage(slug, JSON.parse(paramsKey) as PublicCatalogParams),
);
const cachedCollectionPage = cache(async (slug: string, paramsKey: string) =>
  service().getCollectionPage(slug, JSON.parse(paramsKey) as PublicCatalogParams),
);

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
    const data = await service().listBadgeSection(badge, safeLimit);
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

// ── Product detail (data layer only; PDP redesign is a later phase) ─────

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

const cachedRelated = cache(async (slug: string) => service().getRelatedForProduct(slug));

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
