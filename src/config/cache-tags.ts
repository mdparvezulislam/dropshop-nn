/**
 * Enterprise Next.js 16 Cache Tag System
 *
 * Defines strongly typed cache tags and revalidation helper functions
 * for fine-grained cache invalidation across DropshopNN.
 */

export const CACHE_TAGS = {
  // Group A & B: Platform, CMS, Taxonomy
  SETTINGS: "settings",
  HOMEPAGE: "homepage",
  CATEGORIES: "categories",
  CATEGORY: (slug: string) => `category:${slug}`,
  BRANDS: "brands",
  BRAND: (slug: string) => `brand:${slug}`,
  COLLECTIONS: "collections",
  COLLECTION: (slug: string) => `collection:${slug}`,
  PAGES: "pages",
  PAGE: (slug: string) => `page:${slug}`,
  BLOG: "blog",
  BLOG_POST: (slug: string) => `blog:${slug}`,

  // Group C: Products, Merchandising & Reviews
  PRODUCTS: "products",
  PRODUCT_SLUG: (slug: string) => `product:slug:${slug}`,
  PRODUCT_ID: (id: string) => `product:id:${id}`,
  FEATURED_PRODUCTS: "products:featured",
  FLASH_DEALS: "products:flash_deals",
  NEW_ARRIVALS: "products:new_arrivals",
  TRENDING_PRODUCTS: "products:trending",
  REVIEWS: "reviews",
  PRODUCT_REVIEWS: (productId: string) => `reviews:${productId}`,

  // Global fallback tag
  ALL: "all",
} as const;

/**
 * Standard Cache TTLs (in seconds) according to Next.js 16 recommendations
 */
export const CACHE_TTL = {
  /** Group A: Almost Never Changes (24 hours) */
  STATIC: 86400,
  /** Group B: Rarely Changes (1 hour) */
  TAXONOMY: 3600,
  /** Group B: Homepage & Merchandising (15 minutes) */
  MERCHANDISING: 900,
  /** Group C: Products & Catalog (5 minutes) */
  CATALOG: 300,
  /** Group C: Reviews & Ratings (10 minutes) */
  REVIEWS: 600,
} as const;
