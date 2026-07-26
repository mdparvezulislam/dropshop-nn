import { BaseDBEntity } from "@/lib/database/types";

export type ProductStatus = "draft" | "pending_review" | "active" | "inactive" | "archived";

export type ProductVisibility =
  "public" | "private" | "hidden" | "supplier_only" | "reseller_only" | "wholesale_only";

export type ProductType = "simple" | "variant" | "bundle" | "digital" | "service" | "gift_card";

export type ProductBadge =
  "featured" | "trending" | "flash_sale" | "new_arrival" | "best_seller" | "limited" | string;

export interface ProductVariant {
  id?: string;
  name?: string;
  attributes?: Record<string, string>;
  sku: string;
  priceAdjustment?: number;
  stock?: number;
  image?: string;
  status?: "active" | "inactive";
  isActive?: boolean;

  // Legacy fields kept for backward compatibility
  color?: string;
  size?: string;
  storage?: string;
  ram?: string;
  capacity?: string;
  material?: string;
  bundle?: string;
  barcode?: string;
  weight?: number;
  weightUnit?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  images?: string[];
  sortOrder?: number;
  customAttributes?: Record<string, string>;
}

export interface ProductMedia {
  url: string;
  type?: "image" | "video" | "document";
  isFeatured?: boolean;
  altText?: string;
  caption?: string;
  sortOrder?: number;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
}

export interface ProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCardType?: string;
}

export interface ProductSpecification {
  key: string;
  value: string;
  group?: "specification" | "technical" | "general" | string;
}

export interface ProductContent {
  richDescription?: Record<string, unknown> | string | unknown;
  description?: string;
  highlights?: string[];
  includedItems?: string[];
  features?: string[];
  specifications?: ProductSpecification[];
  technicalDetails?: Record<string, unknown>;
  warrantyInformation?: string;
  returnPolicy?: string;
}

export interface SupplierReference {
  supplierId: string;
  supplierSku?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface ProductSearchMetadata {
  searchKeywords?: string[];
  searchSynonyms?: string[];
  searchWeight?: number;
  popularityScore?: number;
  searchable?: boolean;
}

export interface Product extends BaseDBEntity {
  // Section 01: Identity
  name: string;
  slug: string;
  sku: string;
  barcode?: string;

  // Section 02: Classification
  categoryId?: string;
  brandId?: string;
  supplierId?: string;
  tags: string[];
  visibility: ProductVisibility;
  status: ProductStatus;
  badges: string[];

  // Section 03: Content
  shortDescription?: string;
  description?: string;
  notice?: string;
  specifications: ProductSpecification[];

  // Section 04: Media
  media: ProductMedia[];

  // Section 05: Variants
  hasVariants?: boolean;
  variants: ProductVariant[];

  // Section 06: Minimal SEO
  metaTitle?: string;
  metaDescription?: string;

  // Legacy Fields (kept with optional access & backward compatibility)
  gtin?: string;
  productType?: ProductType;
  productModel?: string;
  featured?: boolean;
  trending?: boolean;
  flashSale?: boolean;
  newArrival?: boolean;
  seo?: ProductSEO;
  content?: ProductContent;
  suppliers?: SupplierReference[];
  searchMetadata?: ProductSearchMetadata;
}

export default Product;
