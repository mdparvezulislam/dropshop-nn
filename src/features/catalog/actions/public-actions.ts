"use server";

import { auth } from "@/lib/auth";
import { ProductService } from "../services/product-service";
import { BrandRepository, CategoryRepository } from "../repositories/classification-repository";
import { PricingService } from "@/features/pricing/services/pricing-service";
import { PricingEngineService } from "@/features/pricing/services/pricing-engine-service";
import type { Product } from "../domain/product-entity";
import type { Brand, Category } from "../domain/classification-entity";
import type { ProductPricing } from "@/features/pricing/domain/pricing-entity";
import type { ProductCardData } from "@/components/website/product-card";

interface PublicProductsResult {
  success: boolean;
  data: ProductCardData[];
}

interface PublicBrandsResult {
  success: boolean;
  data: Brand[];
}

interface PublicCategoriesResult {
  success: boolean;
  data: Category[];
}

interface ProductPricingData {
  retailPrice: number;
  resellerPrice?: number;
  wholesalePrice?: number;
  costPrice?: number;
  comparePrice?: number;
  moq?: number;
  currency: string;
}

interface ProductDetailResult {
  success: boolean;
  data: {
    product: Product;
    pricing: ProductPricingData;
    relatedProducts: ProductCardData[];
  } | null;
}

function mapProductToCard(product: Product, pricing?: ProductPricing | null): ProductCardData {
  const featuredMedia = product.media?.find((m) => m.isFeatured);
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    image: featuredMedia?.url ?? product.media?.[0]?.url ?? "",
    retailPrice: pricing?.sellingPrice ?? 0,
    resellerPrice: pricing?.resellerPrice,
    wholesalePrice: pricing?.wholesalePrice,
    costPrice: pricing?.baseCostPrice,
    comparePrice: pricing?.comparePrice,
    brand: product.brandId,
    category: product.categoryId,
    stockStatus: "in_stock",
    isNew: product.newArrival ?? false,
    isFlashSale: product.flashSale ?? false,
    rating: product.searchMetadata?.popularityScore
      ? Math.min(5, Math.round((product.searchMetadata.popularityScore / 20) * 5))
      : undefined,
  };
}

async function resolvePricingByRole(
  productId: string,
  pricing: ProductPricing | null,
  role?: string,
  memberships: string[] = [],
  product?: Product | null,
): Promise<ProductPricingData> {
  const pAny = (product || {}) as any;
  const rawCost = pAny.costPrice ? parseFloat(String(pAny.costPrice)) : undefined;
  const rawSelling =
    pAny.sellingPrice || pAny.retailPrice || pAny.price
      ? parseFloat(String(pAny.sellingPrice || pAny.retailPrice || pAny.price))
      : undefined;

  let retailPrice =
    pricing?.sellingPrice || rawSelling || (rawCost ? Math.round(rawCost * 1.3) : 1200);
  let resellerPrice =
    pricing?.resellerPrice || (rawCost ? Math.round(rawCost * 1.2) : Math.round(retailPrice * 0.8));
  let wholesalePrice =
    pricing?.wholesalePrice ||
    (rawCost ? Math.round(rawCost * 1.12) : Math.round(retailPrice * 0.7));
  let costPrice = pricing?.baseCostPrice || rawCost || Math.round(retailPrice * 0.65);
  let comparePrice = pricing?.comparePrice || Math.round(retailPrice * 1.25);

  const base = {
    retailPrice,
    resellerPrice,
    wholesalePrice,
    comparePrice,
    costPrice,
    moq: 10,
    currency: pricing?.currency ?? "BDT",
  };

  try {
    const engine = new PricingEngineService();
    const effectiveCost = costPrice > 0 ? costPrice : Math.round(retailPrice * 0.7);

    const isAdmin = role === "admin" || role === "super_admin";
    const isReseller = memberships.includes("reseller") || role === "reseller";
    const isWholesaler = memberships.includes("wholesaler") || role === "wholesaler";

    if (isAdmin || (isReseller && isWholesaler)) {
      const [retail, reseller, wholesale] = await Promise.all([
        engine.calculatePrice({
          productId,
          costPrice: effectiveCost,
          quantity: 1,
          role: "customer",
        }),
        engine.calculatePrice({
          productId,
          costPrice: effectiveCost,
          quantity: 1,
          role: "reseller",
        }),
        engine.calculatePrice({
          productId,
          costPrice: effectiveCost,
          quantity: 1,
          role: "wholesaler",
        }),
      ]);
      return {
        retailPrice: retail.unitPrice || retailPrice,
        resellerPrice: reseller.unitPrice || resellerPrice,
        wholesalePrice: wholesale.unitPrice || wholesalePrice,
        comparePrice,
        costPrice: effectiveCost,
        moq: 10,
        currency: pricing?.currency ?? "BDT",
      };
    }

    if (isReseller) {
      const result = await engine.calculatePrice({
        productId,
        costPrice: effectiveCost,
        quantity: 1,
        role: "reseller",
      });
      return {
        ...base,
        retailPrice,
        resellerPrice: result.unitPrice || resellerPrice,
      };
    }

    if (isWholesaler) {
      const result = await engine.calculatePrice({
        productId,
        costPrice: effectiveCost,
        quantity: 1,
        role: "wholesaler",
      });
      return {
        ...base,
        retailPrice,
        wholesalePrice: result.unitPrice || wholesalePrice,
        moq: 10,
      };
    }

    const result = await engine.calculatePrice({
      productId,
      costPrice: effectiveCost,
      quantity: 1,
      role: "customer",
    });
    return { ...base, retailPrice: result.unitPrice || retailPrice };
  } catch {
    return base;
  }
}

export async function getPublicFeaturedProductsAction(limit = 8): Promise<PublicProductsResult> {
  try {
    const service = new ProductService();
    const result = await service.list(
      { featured: true, status: "active", visibility: "public" },
      { limit },
    );
    return {
      success: true,
      data: result.items.map((p) => mapProductToCard(p)),
    };
  } catch {
    return { success: true, data: [] };
  }
}

export async function getPublicTrendingProductsAction(limit = 8): Promise<PublicProductsResult> {
  try {
    const service = new ProductService();
    const result = await service.list(
      { trending: true, status: "active", visibility: "public" },
      { limit },
    );
    return {
      success: true,
      data: result.items.map((p) => mapProductToCard(p)),
    };
  } catch {
    return { success: true, data: [] };
  }
}

export async function getPublicNewArrivalsAction(limit = 8): Promise<PublicProductsResult> {
  try {
    const service = new ProductService();
    const result = await service.list(
      { newArrival: true, status: "active", visibility: "public" },
      { limit, sort: "createdAt", order: "desc" },
    );
    return {
      success: true,
      data: result.items.map((p) => mapProductToCard(p)),
    };
  } catch {
    return { success: true, data: [] };
  }
}

export async function getPublicFlashDealsAction(limit = 6): Promise<PublicProductsResult> {
  try {
    const service = new ProductService();
    const result = await service.list(
      { flashSale: true, status: "active", visibility: "public" },
      { limit },
    );
    return {
      success: true,
      data: result.items.map((p) => mapProductToCard(p)),
    };
  } catch {
    return { success: true, data: [] };
  }
}

export async function getPublicBrandsAction(): Promise<PublicBrandsResult> {
  try {
    const repo = new BrandRepository();
    const result = await repo.find({});
    return { success: true, data: result };
  } catch {
    return { success: true, data: [] };
  }
}

export async function getPublicCategoriesAction(): Promise<PublicCategoriesResult> {
  try {
    const repo = new CategoryRepository();
    const result = await repo.getTree();
    return { success: true, data: result };
  } catch {
    return { success: true, data: [] };
  }
}

export async function getPublicProductBySlugAction(slug: string): Promise<ProductDetailResult> {
  try {
    const session = await auth();
    const user = session?.user as { role?: string; memberships?: string[] } | undefined;
    const role = user?.role;
    const memberships = user?.memberships || [];

    const productService = new ProductService();
    const product = await productService.findBySlug(slug);
    if (!product) return { success: true, data: null };

    const pricingService = new PricingService();
    const pricing = await pricingService.getPricingByProduct(product.id);

    const pricingData = await resolvePricingByRole(product.id, pricing, role, memberships, product);

    const relatedResult = await productService.list(
      {
        status: "active",
        visibility: "public",
        ...(product.categoryId ? { categoryId: product.categoryId } : {}),
        _id: { $ne: product.id },
      },
      { limit: 4 },
    );

    const pricingServiceBatch = new PricingService();
    const relatedProducts = await Promise.all(
      relatedResult.items.map(async (p) => {
        const pPricing = await pricingServiceBatch.getPricingByProduct(p.id);
        return mapProductToCard(p, pPricing);
      }),
    );

    return {
      success: true,
      data: {
        product,
        pricing: pricingData,
        relatedProducts,
      },
    };
  } catch {
    return { success: true, data: null };
  }
}

export interface PublicCategoryProductsResult {
  success: boolean;
  data: {
    items: ProductCardData[];
    totalCount: number;
    cursor: string | null;
    hasMore: boolean;
  } | null;
}

export async function getPublicCategoryProductsAction(
  slug: string,
  pagination: { cursor?: string; limit?: number } = {},
  filters: {
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    onSale?: boolean;
    minRating?: number;
    brand?: string;
  } = {},
  sort?: "newest" | "price_asc" | "price_desc" | "rating" | "featured",
): Promise<PublicCategoryProductsResult> {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;

    const categoryRepo = new CategoryRepository();
    const category = await categoryRepo.findBySlug(slug);
    if (!category) return { success: true, data: null };

    const productService = new ProductService();
    const dbFilter: Record<string, unknown> = {
      categoryId: category.id,
      status: "active",
      visibility: "public",
      isDeleted: { $ne: true },
    };

    if (filters.inStock) dbFilter["media.0"] = { $exists: true };
    if (filters.brand) dbFilter.brandId = filters.brand;

    const sortMap: Record<string, { sort: string; order: "asc" | "desc" }> = {
      newest: { sort: "createdAt", order: "desc" },
      price_asc: { sort: "createdAt", order: "asc" },
      price_desc: { sort: "createdAt", order: "desc" },
      rating: { sort: "createdAt", order: "desc" },
      featured: { sort: "featured", order: "desc" },
    };
    const sortParams = sortMap[sort ?? "newest"] ?? sortMap.newest;

    const result = await productService.list(dbFilter, {
      cursor: pagination.cursor,
      limit: pagination.limit || 20,
      ...sortParams,
    });

    const pricingService = new PricingService();
    const items = await Promise.all(
      result.items.map(async (p) => {
        const pricing = await pricingService.getPricingByProduct(p.id);
        const card = mapProductToCard(p, pricing);

        if (filters.minPrice !== undefined && card.retailPrice < filters.minPrice) return null;
        if (filters.maxPrice !== undefined && card.retailPrice > filters.maxPrice) return null;

        if (filters.onSale && (!card.comparePrice || card.comparePrice <= card.retailPrice)) {
          return null;
        }

        if (filters.minRating !== undefined && (card.rating ?? 0) < filters.minRating) return null;

        return card;
      }),
    );

    const filtered = items.filter((item): item is ProductCardData => item !== null);

    return {
      success: true,
      data: {
        items: filtered,
        totalCount: filtered.length,
        cursor: result.cursor ?? null,
        hasMore: (result.hasMore ?? false) && filtered.length >= (pagination.limit || 20),
      },
    };
  } catch {
    return { success: true, data: null };
  }
}

export async function getPublicCategoryBySlugAction(slug: string): Promise<{
  success: boolean;
  data?: Category | null;
}> {
  try {
    const repo = new CategoryRepository();
    const category = await repo.findBySlug(slug);
    return { success: true, data: category };
  } catch {
    return { success: true, data: null };
  }
}

export interface SearchProductsResult {
  success: boolean;
  data: {
    items: ProductCardData[];
    totalCount: number;
    cursor: string | null;
    hasMore: boolean;
    query: string;
    categoryId?: string;
  } | null;
}

export async function searchProductsAction(
  query: string,
  pagination: { cursor?: string; limit?: number } = {},
  filters: {
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    onSale?: boolean;
    minRating?: number;
    brand?: string;
    category?: string;
    sort?: "newest" | "price_asc" | "price_desc" | "rating" | "featured";
  } = {},
): Promise<SearchProductsResult> {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;

    if (!query.trim()) {
      return { success: true, data: null };
    }

    const searchService = new (
      await import("../services/catalog-search-service")
    ).CatalogSearchService();

    const dbFilters: Record<string, unknown> = {
      status: "active",
      visibility: "public",
      isDeleted: { $ne: true },
    };

    if (filters.inStock) dbFilters["media.0"] = { $exists: true };
    if (filters.brand) dbFilters.brandId = filters.brand;
    if (filters.category) dbFilters.categoryId = filters.category;

    const sortMap: Record<string, { sort: string; order: "asc" | "desc" }> = {
      newest: { sort: "createdAt", order: "desc" },
      price_asc: { sort: "createdAt", order: "asc" },
      price_desc: { sort: "createdAt", order: "desc" },
      rating: { sort: "createdAt", order: "desc" },
      featured: { sort: "featured", order: "desc" },
    };
    const sortParams = sortMap[filters.sort ?? "newest"] ?? sortMap.newest;

    const result = await searchService.search(
      query.trim(),
      {
        cursor: pagination.cursor,
        limit: pagination.limit || 20,
        ...sortParams,
      },
      dbFilters,
    );

    const pricingService = new PricingService();
    const items = await Promise.all(
      result.items.map(async (p) => {
        const pricing = await pricingService.getPricingByProduct(p.id);
        const card = mapProductToCard(p, pricing);

        if (filters.minPrice !== undefined && card.retailPrice < filters.minPrice) return null;
        if (filters.maxPrice !== undefined && card.retailPrice > filters.maxPrice) return null;
        if (filters.onSale && (!card.comparePrice || card.comparePrice <= card.retailPrice))
          return null;
        if (filters.minRating !== undefined && (card.rating ?? 0) < filters.minRating) return null;

        return card;
      }),
    );

    const filtered = items.filter((item): item is ProductCardData => item !== null);

    return {
      success: true,
      data: {
        items: filtered,
        totalCount: result.totalCount,
        cursor: result.cursor ?? null,
        hasMore: result.hasMore && filtered.length >= (pagination.limit || 20),
        query: query.trim(),
        categoryId: filters.category,
      },
    };
  } catch {
    return { success: true, data: null };
  }
}

export interface AutocompleteResult {
  success: boolean;
  data?: {
    products: ProductCardData[];
    categories: { id: string; name: string; slug: string }[];
    brands: { id: string; name: string; slug: string }[];
    suggestions: string[];
  };
}

export async function searchAutocompleteAction(query: string): Promise<AutocompleteResult> {
  try {
    if (!query.trim()) {
      return { success: true, data: { products: [], categories: [], brands: [], suggestions: [] } };
    }

    const searchService = new (
      await import("../services/catalog-search-service")
    ).CatalogSearchService();
    const pricingService = new PricingService();
    const categoryRepo = new CategoryRepository();
    const brandRepo = new BrandRepository();

    const [productResults, autocompleteResults, allCategories, allBrands] = await Promise.all([
      searchService.search(query.trim(), { limit: 5 }, { status: "active", visibility: "public" }),
      searchService.autocomplete(query.trim(), 8),
      categoryRepo.find({ status: "active" }),
      brandRepo.find({ status: "active" }),
    ]);

    const products = await Promise.all(
      productResults.items.map(async (p) => {
        const pricing = await pricingService.getPricingByProduct(p.id);
        return mapProductToCard(p, pricing);
      }),
    );

    const q = query.toLowerCase();
    const matchedCategories = allCategories
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map((c) => ({ id: c.id, name: c.name, slug: c.slug }));

    const matchedBrands = allBrands
      .filter((b) => b.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map((b) => ({ id: b.id, name: b.name, slug: b.slug }));

    return {
      success: true,
      data: {
        products,
        categories: matchedCategories,
        brands: matchedBrands,
        suggestions: autocompleteResults.suggestions,
      },
    };
  } catch {
    return { success: true, data: { products: [], categories: [], brands: [], suggestions: [] } };
  }
}

export interface PublicProductsCatalogResult {
  success: boolean;
  data: {
    items: ProductCardData[];
    totalCount: number;
    cursor: string | null;
    hasMore: boolean;
  };
}

export async function getPublicProductsCatalogAction(
  params: {
    cursor?: string;
    limit?: number;
    category?: string;
    brand?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    flashSale?: boolean;
    minRating?: number;
    sort?: "newest" | "price_asc" | "price_desc" | "rating" | "featured";
  } = {},
): Promise<PublicProductsCatalogResult> {
  try {
    const productService = new ProductService();
    const pricingService = new PricingService();

    const dbFilter: Record<string, unknown> = {
      status: "active",
      visibility: "public",
      isDeleted: { $ne: true },
    };

    if (params.category) dbFilter.categoryId = params.category;
    if (params.brand) dbFilter.brandId = params.brand;
    if (params.flashSale) dbFilter.flashSale = true;

    if (params.search?.trim()) {
      const q = params.search.trim();
      dbFilter.$or = [
        { name: { $regex: q, $options: "i" } },
        { shortDescription: { $regex: q, $options: "i" } },
        { sku: { $regex: q, $options: "i" } },
      ];
    }

    const sortMap: Record<string, { sort: string; order: "asc" | "desc" }> = {
      newest: { sort: "createdAt", order: "desc" },
      price_asc: { sort: "createdAt", order: "asc" },
      price_desc: { sort: "createdAt", order: "desc" },
      rating: { sort: "ratingAverage", order: "desc" },
      featured: { sort: "featured", order: "desc" },
    };
    const sortParams = sortMap[params.sort ?? "newest"] ?? sortMap.newest;

    const result = await productService.list(dbFilter, {
      cursor: params.cursor,
      limit: params.limit || 24,
      ...sortParams,
    });

    const items = await Promise.all(
      result.items.map(async (p) => {
        const pricing = await pricingService.getPricingByProduct(p.id);
        const card = mapProductToCard(p, pricing);

        if (params.minPrice !== undefined && card.retailPrice < params.minPrice) return null;
        if (params.maxPrice !== undefined && card.retailPrice > params.maxPrice) return null;
        if (params.minRating !== undefined && (card.rating ?? 0) < params.minRating) return null;

        return card;
      }),
    );

    const filtered = items.filter((item): item is ProductCardData => item !== null);

    return {
      success: true,
      data: {
        items: filtered,
        totalCount: result.totalCount,
        cursor: result.cursor ?? null,
        hasMore: (result.hasMore ?? false) && filtered.length >= (params.limit || 24),
      },
    };
  } catch {
    return {
      success: true,
      data: { items: [], totalCount: 0, cursor: null, hasMore: false },
    };
  }
}

export async function getPublicBrandProductsAction(slug: string): Promise<{
  success: boolean;
  data: { brand: Brand; products: ProductCardData[] } | null;
}> {
  try {
    const brandRepo = new BrandRepository();
    const brand = await brandRepo.findBySlug(slug);
    if (!brand) return { success: true, data: null };

    const productService = new ProductService();
    const pricingService = new PricingService();

    const result = await productService.list({
      brandId: brand.id,
      status: "active",
      visibility: "public",
      isDeleted: { $ne: true },
    });

    const products = await Promise.all(
      result.items.map(async (p) => {
        const pricing = await pricingService.getPricingByProduct(p.id);
        return mapProductToCard(p, pricing);
      }),
    );

    return {
      success: true,
      data: { brand, products },
    };
  } catch {
    return { success: true, data: null };
  }
}
