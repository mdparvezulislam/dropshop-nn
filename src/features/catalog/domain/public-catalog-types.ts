/**
 * Public storefront DTOs.
 *
 * These are the ONLY shapes the public website receives. They deliberately
 * exclude cost basis, tier prices, supplier links, audit fields, and any
 * other admin-only data. All monetary values are BDT major units — the
 * paisa→BDT conversion happens exactly once, in PublicCatalogService.
 */

export type PublicStockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface PublicProductCard {
  id: string;
  slug: string;
  name: string;
  /** Featured image URL; empty string when the product has no media. */
  image: string;
  /** Second gallery image for hover swap, when one exists. */
  hoverImage?: string;
  brandName?: string;
  brandSlug?: string;
  categoryName?: string;
  categorySlug?: string;
  /** Display price in BDT. 0 means "no price configured" — UI must show a contact CTA, never invent one. */
  price: number;
  /** Real strike-through price in BDT; present only when greater than `price`. */
  comparePrice?: number;
  /** Derived from real comparePrice only. */
  discountPercent?: number;
  stockStatus: PublicStockStatus;
  badges: string[];
  isNew: boolean;
  isFlashSale: boolean;
  /** REAL average from published reviews; undefined when the product has none. */
  rating?: number;
  /** REAL published review count; undefined when the product has none. */
  reviewCount?: number;
}

export interface PublicListResult {
  items: PublicProductCard[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type PublicCatalogSort =
  "newest" | "price_asc" | "price_desc" | "featured" | "name_asc" | "relevance";

export type PublicBadgeSection = "featured" | "trending" | "new_arrival" | "flash_sale";

export interface PublicCatalogParams {
  page?: number;
  limit?: number;
  categorySlug?: string;
  brandSlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  badge?: PublicBadgeSection;
  sort?: PublicCatalogSort;
}

export interface PublicCategoryInfo {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentCategoryId: string | null;
  productCount: number;
}

export interface PublicBrandInfo {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  productCount: number;
}

export interface PublicCollectionInfo {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount: number;
}

export interface PublicBreadcrumb {
  name: string;
  href: string;
}

export interface PublicCategoryPage {
  category: PublicCategoryInfo;
  breadcrumbs: PublicBreadcrumb[];
  children: PublicCategoryInfo[];
  products: PublicListResult;
}

export interface PublicBrandPage {
  brand: PublicBrandInfo;
  products: PublicListResult;
}

export interface PublicCollectionPage {
  collection: PublicCollectionInfo;
  products: PublicListResult;
}

export interface PublicAutocomplete {
  products: Array<Pick<PublicProductCard, "id" | "name" | "slug" | "image" | "price">>;
  categories: Array<{ id: string; name: string; slug: string }>;
  brands: Array<{ id: string; name: string; slug: string }>;
  suggestions: string[];
}

/**
 * Role-gated pricing block for the product detail page. Built server-side;
 * tier prices are present ONLY when the session's role/membership grants them.
 */
export interface PublicProductPricing {
  /** BDT. 0 = no price configured. */
  retailPrice: number;
  /** Real compare-at price in BDT; only when greater than retailPrice. */
  comparePrice?: number;
  /** Active promotional price in BDT, when lower than retailPrice. */
  campaignPrice?: number;
  /** Only present for sessions with the reseller membership (or admin). */
  resellerPrice?: number;
  /** Real reseller floor price, when configured. */
  minResellerPrice?: number;
  /** Only present for sessions with the wholesaler membership (or admin). */
  wholesalePrice?: number;
  /** Only present for admin sessions. */
  costPrice?: number;
  currency: string;
}

export interface ActionFailure {
  success: false;
  error: string;
}

export type PublicActionResult<T> = { success: true; data: T } | ActionFailure;

export interface SitemapEntry {
  slug: string;
  updatedAt?: Date;
}
