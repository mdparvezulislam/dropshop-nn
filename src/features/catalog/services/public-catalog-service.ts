import { ProductRepository } from "../repositories/product-repository";
import type {
  PublicCardPricingRow,
  PublicCardQueryParams,
} from "../repositories/product-repository";
import {
  BrandRepository,
  CategoryRepository,
  CollectionRepository,
} from "../repositories/classification-repository";
import { PricingService } from "@/features/pricing/services/pricing-service";
import type { Product } from "../domain/product-entity";
import type { Brand, Category, Collection } from "../domain/classification-entity";
import type {
  PublicAutocomplete,
  PublicBadgeSection,
  PublicBrandInfo,
  PublicBrandPage,
  PublicCatalogParams,
  PublicCatalogSort,
  PublicCategoryInfo,
  PublicCategoryPage,
  PublicCollectionInfo,
  PublicCollectionPage,
  PublicListResult,
  PublicProductCard,
  PublicProductPricing,
  PublicStockStatus,
} from "../domain/public-catalog-types";
import { LOW_STOCK_THRESHOLD } from "@/config/site";
import { logger } from "@/lib/utils/logger";

const NEW_ARRIVAL_WINDOW_DAYS = 30;
const MAX_PAGE_SIZE = 48;
const DEFAULT_PAGE_SIZE = 24;

/** Paisa (DB minor units) → BDT. The ONLY place this conversion happens for the storefront. */
function minorToBdt(minor: number): number {
  return Math.round(minor) / 100;
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface ListCardsInternal extends PublicCatalogParams {
  categoryIds?: string[];
  brandId?: string;
  productIds?: string[];
  excludeId?: string;
}

interface ViewerContext {
  isAdmin: boolean;
  isReseller: boolean;
  isWholesaler: boolean;
}

export interface PublicProductDetail {
  product: Product;
  pricing: PublicProductPricing;
  brandName?: string;
  brandSlug?: string;
  categoryName?: string;
  categorySlug?: string;
  stockStatus: PublicStockStatus;
  /** Summed available stock; null = untracked (dropship-sellable). */
  stockTotal: number | null;
  /** Real published-review aggregate; count 0 means "no reviews yet". */
  rating: { average: number; count: number };
}

/**
 * Read-side service for the public storefront. Owns the public data contract:
 * status/visibility gating, BDT conversion, real stock status, and taxonomy
 * name joins. Nothing here ever fabricates a value — missing data stays
 * missing and the UI must present it honestly.
 */
export class PublicCatalogService {
  private readonly products = new ProductRepository();
  private readonly brands = new BrandRepository();
  private readonly categories = new CategoryRepository();
  private readonly collections = new CollectionRepository();

  // ── Listing ────────────────────────────────────────────────────────────

  async listCards(params: ListCardsInternal): Promise<PublicListResult> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, params.limit ?? DEFAULT_PAGE_SIZE));

    const filter: Record<string, unknown> = {
      status: "active",
      visibility: "public",
    };

    if (params.badge) filter.$or = badgeFilter(params.badge);
    if (params.brandId) filter.brandId = params.brandId;
    if (params.categoryIds?.length) {
      filter.categoryId =
        params.categoryIds.length === 1 ? params.categoryIds[0] : { $in: params.categoryIds };
    }
    if (params.productIds) {
      if (params.productIds.length === 0) {
        return { items: [], totalCount: 0, page, pageSize: limit, totalPages: 0 };
      }
      filter._id = { $in: params.productIds };
    }
    if (params.excludeId) filter._id = { $ne: params.excludeId };

    const sort: PublicCatalogSort = params.sort ?? (params.search?.trim() ? "relevance" : "newest");

    const query: PublicCardQueryParams = {
      filter,
      textQuery: params.search?.trim() || undefined,
      minPriceMinor: params.minPrice !== undefined ? Math.round(params.minPrice * 100) : undefined,
      maxPriceMinor: params.maxPrice !== undefined ? Math.round(params.maxPrice * 100) : undefined,
      onSale: params.onSale,
      inStock: params.inStock,
      sort,
      page,
      limit,
    };

    const result = await this.products.findPublicCards(query);

    const products = result.items.map((r) => r.product);
    const [{ brandMap, categoryMap }, ratings] = await Promise.all([
      this.taxonomyMaps(products),
      this.ratingSummaries(products.map((p) => p.id)),
    ]);

    return {
      items: result.items.map((row) =>
        this.toCard(row.product, row.pricing, row.stockTotal, brandMap, categoryMap, ratings),
      ),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.limit,
      totalPages: Math.ceil(result.totalCount / result.limit),
    };
  }

  async listBadgeSection(badge: PublicBadgeSection, limit: number): Promise<PublicProductCard[]> {
    try {
      const result = await this.listCards({ badge, limit, page: 1, sort: "newest" });
      if (result.items.length === 0) {
        const fallback = await this.listCards({ limit, page: 1, sort: "newest" });
        return fallback.items;
      }
      return result.items;
    } catch (error) {
      logger.error(`PublicCatalogService listBadgeSection failed for badge: ${badge}`, error);
      try {
        const fallback = await this.listCards({ limit, page: 1, sort: "newest" });
        return fallback.items;
      } catch {
        return [];
      }
    }
  }

  /** Catalog listing with slug-based filters (the /products and /search entry point). */
  async listCatalog(params: PublicCatalogParams): Promise<PublicListResult> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, params.limit ?? DEFAULT_PAGE_SIZE));
    const empty: PublicListResult = {
      items: [],
      totalCount: 0,
      page,
      pageSize: limit,
      totalPages: 0,
    };

    let categoryIds: string[] | undefined;
    if (params.categorySlug) {
      const category = await this.categories.findOne({
        slug: params.categorySlug.toLowerCase().trim(),
        isActive: { $ne: false },
        isDeleted: { $ne: true },
      });
      if (!category) return empty;
      const children = await this.categories.find({
        parentCategoryId: category.id,
        isActive: { $ne: false },
        isDeleted: { $ne: true },
      });
      categoryIds = [category.id, ...children.map((c) => c.id)];
    }

    let brandId: string | undefined;
    if (params.brandSlug) {
      const brand = await this.brands.findOne({
        slug: params.brandSlug.toLowerCase().trim(),
        isActive: { $ne: false },
        isDeleted: { $ne: true },
      });
      if (!brand) return empty;
      brandId = brand.id;
    }

    return this.listCards({ ...params, categoryIds, brandId });
  }

  /** Slugs + timestamps for the XML sitemap — active/public entries only. */
  async getSitemapEntries(): Promise<{
    products: Array<{ slug: string; updatedAt?: Date }>;
    categories: Array<{ slug: string; updatedAt?: Date }>;
    brands: Array<{ slug: string; updatedAt?: Date }>;
  }> {
    const [products, categories, brands] = await Promise.all([
      this.products.findSlugsForSitemap(5000),
      this.categories.find({ isActive: { $ne: false }, isDeleted: { $ne: true } }),
      this.brands.find({ isActive: { $ne: false }, isDeleted: { $ne: true } }),
    ]);
    return {
      products,
      categories: categories.map((c) => ({ slug: c.slug, updatedAt: c.updatedAt })),
      brands: brands.map((b) => ({ slug: b.slug, updatedAt: b.updatedAt })),
    };
  }

  // ── Category ───────────────────────────────────────────────────────────

  async getCategoryPage(
    slug: string,
    params: PublicCatalogParams,
  ): Promise<PublicCategoryPage | null> {
    const category = await this.categories.findOne({
      slug: slug.toLowerCase().trim(),
      isActive: { $ne: false },
      isDeleted: { $ne: true },
    });
    if (!category) return null;

    const children = (
      await this.categories.find({
        parentCategoryId: category.id,
        isActive: { $ne: false },
        isDeleted: { $ne: true },
      })
    ).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    // Parent-chain breadcrumbs (bounded walk — hierarchy depth is capped at 12 upstream).
    const breadcrumbs: PublicCategoryPage["breadcrumbs"] = [];
    let parentId = category.parentCategoryId;
    let guard = 0;
    while (parentId && guard < 12) {
      const parent = await this.categories.findById(parentId);
      if (!parent || parent.isDeleted) break;
      breadcrumbs.unshift({ name: parent.name, href: `/category/${parent.slug}` });
      parentId = parent.parentCategoryId;
      guard += 1;
    }
    breadcrumbs.unshift({ name: "হোম", href: "/" });
    breadcrumbs.push({ name: category.name, href: `/category/${category.slug}` });

    const categoryIds = [category.id, ...children.map((c) => c.id)];
    const products = await this.listCards({ ...params, categoryIds });

    const counts = await this.publicProductCounts("categoryId");

    return {
      category: toCategoryInfo(category, counts),
      breadcrumbs,
      children: children.map((c) => toCategoryInfo(c, counts)),
      products,
    };
  }

  async getPublicCategories(): Promise<PublicCategoryInfo[]> {
    const [rows, counts] = await Promise.all([
      this.categories.find({ isActive: { $ne: false }, isDeleted: { $ne: true } }),
      this.publicProductCounts("categoryId"),
    ]);
    return rows
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((c) => toCategoryInfo(c, counts));
  }

  // ── Brand ──────────────────────────────────────────────────────────────

  async getBrandPage(slug: string, params: PublicCatalogParams): Promise<PublicBrandPage | null> {
    const brand = await this.brands.findOne({
      slug: slug.toLowerCase().trim(),
      isActive: { $ne: false },
      isDeleted: { $ne: true },
    });
    if (!brand) return null;

    const [products, counts] = await Promise.all([
      this.listCards({ ...params, brandId: brand.id }),
      this.publicProductCounts("brandId"),
    ]);

    return { brand: toBrandInfo(brand, counts), products };
  }

  async getPublicBrands(): Promise<PublicBrandInfo[]> {
    const [rows, counts] = await Promise.all([
      this.brands.find({ isActive: { $ne: false }, isDeleted: { $ne: true } }),
      this.publicProductCounts("brandId"),
    ]);
    return rows
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((b) => toBrandInfo(b, counts));
  }

  // ── Collections ────────────────────────────────────────────────────────

  async getCollections(): Promise<PublicCollectionInfo[]> {
    const rows = await this.collections.findActive();
    return rows.map(toCollectionInfo);
  }

  async getCollectionPage(
    slug: string,
    params: PublicCatalogParams,
  ): Promise<PublicCollectionPage | null> {
    const collection = await this.collections.findOne({
      slug: slug.toLowerCase().trim(),
      isActive: true,
      isDeleted: { $ne: true },
    });
    if (!collection) return null;

    const products = await this.listCards({ ...params, productIds: collection.productIds });
    return { collection: toCollectionInfo(collection), products };
  }

  // ── Search ─────────────────────────────────────────────────────────────

  async autocomplete(rawQuery: string): Promise<PublicAutocomplete> {
    const q = rawQuery.trim();
    if (!q) return { products: [], categories: [], brands: [], suggestions: [] };

    const regex = { $regex: escapeRegExp(q), $options: "i" };

    const [productResult, matchedCategories, matchedBrands] = await Promise.all([
      this.listCards({ search: q, limit: 6, page: 1 }),
      this.categories.find({ name: regex, isActive: { $ne: false }, isDeleted: { $ne: true } }),
      this.brands.find({ name: regex, isActive: { $ne: false }, isDeleted: { $ne: true } }),
    ]);

    return {
      products: productResult.items.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        image: p.image,
        price: p.price,
      })),
      categories: matchedCategories.slice(0, 3).map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      })),
      brands: matchedBrands.slice(0, 3).map((b) => ({ id: b.id, name: b.name, slug: b.slug })),
      // Suggestions come from real, publicly visible product names only —
      // never from hidden/supplier-only inventory.
      suggestions: productResult.items.slice(0, 5).map((p) => p.name),
    };
  }

  // ── Product detail (data fixes only — the PDP UI belongs to a later phase) ──

  async getProductDetail(slug: string, viewer: ViewerContext): Promise<PublicProductDetail | null> {
    const product = await this.products.findOne({
      slug: slug.toLowerCase().trim(),
      status: "active",
      visibility: "public",
      isDeleted: { $ne: true },
    });
    if (!product) return null;

    const pricingService = new PricingService();
    const record = await pricingService.getPricingByProduct(product.id).catch(() => null);

    const sellingBdt = record?.sellingPrice ? minorToBdt(record.sellingPrice) : 0;
    const promoBdt =
      record?.promotionalPrice &&
      record.promotionalPrice > 0 &&
      record.promotionalPrice < (record.sellingPrice ?? 0)
        ? minorToBdt(record.promotionalPrice)
        : undefined;
    const compareBdt =
      record?.comparePrice && record.comparePrice > (record.sellingPrice ?? 0)
        ? minorToBdt(record.comparePrice)
        : undefined;

    const pricing: PublicProductPricing = {
      retailPrice: sellingBdt,
      campaignPrice: promoBdt,
      comparePrice: compareBdt,
      currency: record?.currency && record.currency !== "USD" ? record.currency : "BDT",
      ...(viewer.isReseller || viewer.isAdmin
        ? { resellerPrice: record?.resellerPrice ? minorToBdt(record.resellerPrice) : undefined }
        : {}),
      ...(viewer.isWholesaler || viewer.isAdmin
        ? { wholesalePrice: record?.wholesalePrice ? minorToBdt(record.wholesalePrice) : undefined }
        : {}),
      ...(viewer.isAdmin
        ? { costPrice: record?.baseCostPrice ? minorToBdt(record.baseCostPrice) : undefined }
        : {}),
    };

    const [taxonomy, stock, ratings] = await Promise.all([
      this.taxonomyMaps([product]),
      this.stockTotalFor(product.id),
      this.ratingSummaries([product.id]),
    ]);

    return {
      product,
      pricing,
      brandName: product.brandId ? taxonomy.brandMap.get(product.brandId)?.name : undefined,
      brandSlug: product.brandId ? taxonomy.brandMap.get(product.brandId)?.slug : undefined,
      categoryName: product.categoryId
        ? taxonomy.categoryMap.get(product.categoryId)?.name
        : undefined,
      categorySlug: product.categoryId
        ? taxonomy.categoryMap.get(product.categoryId)?.slug
        : undefined,
      stockStatus: stockStatusOf(stock),
      stockTotal: stock,
      rating: ratings.get(product.id) ?? { average: 0, count: 0 },
    };
  }

  /**
   * Related rails for the product detail page — same category, same brand,
   * and curated (featured) recommendations, all deduplicated against each
   * other and the current product. Fetched separately from the main detail
   * payload so the PDP shell can stream first and the rails arrive behind a
   * Suspense boundary.
   */
  async getRelatedForProduct(slug: string): Promise<{
    sameCategory: PublicProductCard[];
    sameBrand: PublicProductCard[];
    recommended: PublicProductCard[];
  } | null> {
    const product = await this.products.findOne({
      slug: slug.toLowerCase().trim(),
      status: "active",
      visibility: "public",
      isDeleted: { $ne: true },
    });
    if (!product) return null;

    const [sameCategory, sameBrand, featured] = await Promise.all([
      product.categoryId
        ? this.listCards({
            categoryIds: [product.categoryId],
            excludeId: product.id,
            limit: 8,
            page: 1,
          }).then((r) => r.items)
        : Promise.resolve<PublicProductCard[]>([]),
      product.brandId
        ? this.listCards({
            brandId: product.brandId,
            excludeId: product.id,
            limit: 8,
            page: 1,
          }).then((r) => r.items)
        : Promise.resolve<PublicProductCard[]>([]),
      this.listCards({
        badge: "featured",
        excludeId: product.id,
        limit: 8,
        page: 1,
      }).then((r) => r.items),
    ]);

    const seen = new Set(sameCategory.map((c) => c.id));
    const brandRail = sameBrand.filter((c) => !seen.has(c.id));
    brandRail.forEach((c) => seen.add(c.id));

    return {
      sameCategory,
      sameBrand: brandRail,
      recommended: featured.filter((c) => !seen.has(c.id)),
    };
  }

  // ── Internals ──────────────────────────────────────────────────────────

  private async stockTotalFor(productId: string): Promise<number | null> {
    try {
      const { InventoryRepository } =
        await import("@/features/inventory/repositories/inventory-repository");
      const rows = await new InventoryRepository().find({ productId, status: "active" });
      if (rows.length === 0) return null;
      return rows.reduce((sum, row) => sum + (row.availableStock ?? 0), 0);
    } catch (error) {
      logger.error("PublicCatalogService stockTotalFor failed", error, { productId });
      return null;
    }
  }

  private async taxonomyMaps(products: Product[]): Promise<{
    brandMap: Map<string, { name: string; slug: string }>;
    categoryMap: Map<string, { name: string; slug: string }>;
  }> {
    const brandIds = [...new Set(products.map((p) => p.brandId).filter(Boolean))] as string[];
    const categoryIds = [...new Set(products.map((p) => p.categoryId).filter(Boolean))] as string[];

    const [brands, categories] = await Promise.all([
      brandIds.length ? this.brands.find({ _id: { $in: brandIds } }) : Promise.resolve<Brand[]>([]),
      categoryIds.length
        ? this.categories.find({ _id: { $in: categoryIds } })
        : Promise.resolve<Category[]>([]),
    ]);

    return {
      brandMap: new Map(brands.map((b) => [b.id, { name: b.name, slug: b.slug }])),
      categoryMap: new Map(categories.map((c) => [c.id, { name: c.name, slug: c.slug }])),
    };
  }

  private toCard(
    product: Product,
    pricing: PublicCardPricingRow | null,
    stockTotal: number | null,
    brandMap: Map<string, { name: string; slug: string }>,
    categoryMap: Map<string, { name: string; slug: string }>,
    ratings?: Map<string, { average: number; count: number }>,
  ): PublicProductCard {
    const media = [...(product.media ?? [])].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    );
    const featured = media.find((m) => m.isFeatured) ?? media[0];
    const hover = media.find((m) => m !== featured && m.type !== "video");

    const selling = pricing?.sellingPrice ?? 0;
    const promoValid =
      pricing?.promotionalPrice !== undefined &&
      pricing.promotionalPrice > 0 &&
      pricing.promotionalPrice < selling;

    const price = promoValid ? minorToBdt(pricing.promotionalPrice!) : minorToBdt(selling);
    const compareMinor = promoValid
      ? selling
      : pricing?.comparePrice && pricing.comparePrice > selling
        ? pricing.comparePrice
        : undefined;
    const comparePrice = compareMinor !== undefined ? minorToBdt(compareMinor) : undefined;
    const discountPercent =
      comparePrice !== undefined && comparePrice > 0 && price > 0
        ? Math.round(((comparePrice - price) / comparePrice) * 100)
        : undefined;

    const createdAt = product.createdAt ? new Date(product.createdAt) : undefined;
    const isRecent =
      createdAt !== undefined &&
      Date.now() - createdAt.getTime() < NEW_ARRIVAL_WINDOW_DAYS * 24 * 60 * 60 * 1000;

    const brand = product.brandId ? brandMap.get(product.brandId) : undefined;
    const category = product.categoryId ? categoryMap.get(product.categoryId) : undefined;
    const rating = ratings?.get(product.id);

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: featured?.url ?? "",
      hoverImage: hover?.url,
      brandName: brand?.name,
      brandSlug: brand?.slug,
      categoryName: category?.name,
      categorySlug: category?.slug,
      price,
      comparePrice,
      discountPercent: discountPercent && discountPercent > 0 ? discountPercent : undefined,
      stockStatus: stockStatusOf(stockTotal),
      badges: product.badges ?? [],
      isNew: (product.badges ?? []).includes("new_arrival") || isRecent,
      isFlashSale: (product.badges ?? []).includes("flash_sale"),
      // Real review data only — absent when the product has no reviews yet.
      rating: rating && rating.count > 0 ? rating.average : undefined,
      reviewCount: rating && rating.count > 0 ? rating.count : undefined,
    };
  }

  /** Batched published-review aggregates; failures degrade to "no ratings". */
  private async ratingSummaries(
    productIds: string[],
  ): Promise<Map<string, { average: number; count: number }>> {
    try {
      const { ReviewService } = await import("@/features/reviews/services/review-service");
      const summaries = await new ReviewService().getRatingSummaries(productIds);
      return new Map(
        [...summaries.entries()].map(([id, summary]) => [
          id,
          { average: summary.average, count: summary.count },
        ]),
      );
    } catch (error) {
      logger.error("PublicCatalogService ratingSummaries failed", error);
      return new Map();
    }
  }

  private async publicProductCounts(field: "categoryId" | "brandId"): Promise<Map<string, number>> {
    try {
      const rows = await this.products.groupCountBy(field, {
        status: "active",
        visibility: "public",
      });
      return new Map(rows.map((r) => [r.key, r.count]));
    } catch (error) {
      logger.error("PublicCatalogService publicProductCounts failed", error, { field });
      return new Map();
    }
  }
}

// ── Pure mappers ─────────────────────────────────────────────────────────

function badgeFilter(badge: PublicBadgeSection): Record<string, unknown>[] {
  const legacyFlag: Record<PublicBadgeSection, string> = {
    featured: "featured",
    trending: "trending",
    new_arrival: "newArrival",
    flash_sale: "flashSale",
  };
  return [{ badges: badge }, { [legacyFlag[badge]]: true }];
}

function stockStatusOf(stockTotal: number | null): PublicStockStatus {
  if (stockTotal === null) return "in_stock"; // untracked = dropship-sellable
  if (stockTotal <= 0) return "out_of_stock";
  if (stockTotal <= LOW_STOCK_THRESHOLD) return "low_stock";
  return "in_stock";
}

function toCategoryInfo(category: Category, counts: Map<string, number>): PublicCategoryInfo {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    parentCategoryId: category.parentCategoryId ?? null,
    productCount: counts.get(category.id) ?? 0,
  };
}

function toBrandInfo(brand: Brand, counts: Map<string, number>): PublicBrandInfo {
  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logo: brand.logo,
    description: brand.description,
    productCount: counts.get(brand.id) ?? 0,
  };
}

function toCollectionInfo(collection: Collection): PublicCollectionInfo {
  return {
    id: collection.id,
    name: collection.name,
    slug: collection.slug,
    description: collection.description,
    image: collection.image,
    productCount: collection.productIds?.length ?? 0,
  };
}

export default PublicCatalogService;
