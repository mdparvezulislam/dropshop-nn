import type { ParsedProductData } from "../smart-parser";

export interface PageMetadata {
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  locale?: string;
  siteName?: string;
}

export interface ExtractedImage {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  isFeatured?: boolean;
}

export interface JsonLdProduct {
  name?: string;
  description?: string;
  sku?: string;
  brand?: { name?: string };
  mpn?: string;
  gtin?: string;
  gtin8?: string;
  gtin12?: string;
  gtin13?: string;
  gtin14?: string;
  image?: string | string[];
  offers?: {
    price?: string | number;
    priceCurrency?: string;
    availability?: string;
  };
  category?: string;
  review?: unknown[];
  aggregateRating?: unknown;
}

export interface ExtractedData {
  metadata: PageMetadata;
  structuredData?: JsonLdProduct;
  pageTitle?: string;
  description?: string;
  features: string[];
  specifications: Array<{ key: string; value: string; group?: string }>;
  images: ExtractedImage[];
  breadcrumbs: string[];
  categoryHint?: string;
  brandHint?: string;
  priceHint?: string;
  cleanText: string;
}

export interface DuplicateWarning {
  type: "sku" | "slug" | "name" | "barcode" | "gtin";
  value: string;
  existingProductId: string;
  existingProductName: string;
}

export interface ImportResult {
  extracted: ExtractedData;
  parsed: ParsedProductData;
  summary: string[];
  duplicates: DuplicateWarning[];
  rawText: string;
}

export type ImportProgress =
  | { stage: "idle" }
  | { stage: "validating" }
  | { stage: "fetching"; url: string }
  | { stage: "extracting" }
  | { stage: "parsing" }
  | { stage: "detecting-duplicates" }
  | { stage: "complete"; result: ImportResult }
  | { stage: "error"; error: string };
