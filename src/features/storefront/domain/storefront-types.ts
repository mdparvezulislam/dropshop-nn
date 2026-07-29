import type {
  PublicBrandInfo,
  PublicCategoryInfo,
  PublicCollectionInfo,
  PublicProductCard,
} from "@/features/catalog/domain/public-catalog-types";

export interface PublicBlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  publishedAt?: Date | string | null;
}

export interface PublicSiteSettings {
  brandName: string;
  tagline: string;
  announcementText?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface PublicHomepageTelemetry {
  builtAt: string;
  buildDurationMs: number;
}

export interface PublicHomepageData {
  categories: PublicCategoryInfo[];
  featuredProducts: PublicProductCard[];
  flashDeals: PublicProductCard[];
  newArrivals: PublicProductCard[];
  trendingProducts: PublicProductCard[];
  brands: PublicBrandInfo[];
  collections: PublicCollectionInfo[];
  blogPosts: PublicBlogPostSummary[];
  siteSettings: PublicSiteSettings;
  telemetry: PublicHomepageTelemetry;
}

export type PublicHomepageResult =
  | { success: true; data: PublicHomepageData }
  | { success: false; error: string; data?: PublicHomepageData };
