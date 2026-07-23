import { BaseDBEntity } from "@/lib/database/types";

export type ProductStatus = "draft" | "pending_review" | "active" | "inactive" | "archived";

export type ProductVisibility = "public" | "private" | "hidden" | "supplier_only";

export type ProductType = "simple" | "variant" | "bundle" | "digital" | "service" | "gift_card";

export interface ProductVariant {
  color?: string;
  size?: string;
  storage?: string;
  ram?: string;
  capacity?: string;
  material?: string;
  bundle?: string;
  sku: string;
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
  status: "active" | "inactive";
  sortOrder?: number;
  customAttributes?: Record<string, string>;
}

export interface ProductMedia {
  url: string;
  type: "image" | "video" | "document";
  isFeatured: boolean;
  altText?: string;
  caption?: string;
  sortOrder: number;
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
  group: "specification" | "technical" | "general";
}

export interface ProductContent {
  richDescription?: Record<string, unknown>;
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
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductSearchMetadata {
  searchKeywords?: string[];
  searchSynonyms?: string[];
  searchWeight?: number;
  popularityScore?: number;
  searchable?: boolean;
}

export interface Product extends BaseDBEntity {
  name: string;
  slug: string;
  sku: string;
  barcode?: string;
  gtin?: string;
  productType: ProductType;
  shortDescription?: string;
  productModel?: string;
  brandId?: string;
  categoryId?: string;
  supplierId?: string;
  status: ProductStatus;
  visibility: ProductVisibility;
  featured: boolean;
  trending: boolean;
  flashSale: boolean;
  newArrival: boolean;
  variants: ProductVariant[];
  media: ProductMedia[];
  seo?: ProductSEO;
  content?: ProductContent;
  suppliers: SupplierReference[];
  searchMetadata?: ProductSearchMetadata;
  tags: string[];
}

export default Product;
