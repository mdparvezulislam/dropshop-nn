import { BaseDBEntity } from "@/shared/lib/database/types";

export interface Brand extends BaseDBEntity {
  name: string;
  slug: string;
  logo?: string;
}

export interface Category extends BaseDBEntity {
  name: string;
  slug: string;
  parentCategoryId?: string | null;
}

export interface ProductTag extends BaseDBEntity {
  name: string;
  slug: string;
}

export interface ProductVariant {
  color?: string;
  size?: string;
  storage?: string;
  ram?: string;
  capacity?: string;
  material?: string;
  sku: string;
  customAttributes?: Record<string, string>;
}

export interface ProductMedia {
  url: string;
  type: "image" | "video";
  isFeatured: boolean;
  altText?: string;
  sortOrder: number;
}

export interface ProductAttribute {
  key: string;
  value: string;
  group: "specification" | "technical" | "general";
}

export interface ProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
}

export interface Product extends BaseDBEntity {
  name: string;
  slug: string;
  shortDescription?: string;
  fullDescription?: string;
  productModel?: string;
  sku: string;
  barcode?: string;
  gtin?: string;
  brandId?: string;
  categoryId?: string;
  supplierId: string;
  status: "draft" | "pending_review" | "active" | "inactive" | "archived";
  visibility: "public" | "private" | "hidden" | "supplier_only";
  variants: ProductVariant[];
  media: ProductMedia[];
  attributes: ProductAttribute[];
  seo?: ProductSEO;
  tags: string[];
  isFeatured: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
}
export default Product;
