import { Product, ProductVariant, ProductSpecification, ProductMedia, ProductStatus, ProductVisibility } from "./product-entity";

export type FinalCleanProductEntity = Product;
export type ProductVariantEntity = ProductVariant;
export type ProductSpecificationEntity = ProductSpecification;
export type ProductMediaEntity = ProductMedia;

export interface ProductCreateDTO {
  name: string;
  slug?: string;
  sku?: string;
  barcode?: string;
  categoryId?: string;
  brandId?: string;
  supplierId?: string;
  status?: ProductStatus;
  visibility?: ProductVisibility;
  badges?: string[];
  shortDescription?: string;
  description?: string;
  notice?: string;
  specifications?: ProductSpecificationEntity[];
  media?: ProductMediaEntity[];
  hasVariants?: boolean;
  variants?: ProductVariantEntity[];
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
}

export interface ProductUpdateDTO extends Partial<ProductCreateDTO> {
  id?: string;
}

export interface ProductSearchDTO {
  query?: string;
  categoryId?: string;
  brandId?: string;
  status?: ProductStatus;
  visibility?: ProductVisibility;
  badge?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface ProductResponseDTO {
  id: string;
  name: string;
  slug: string;
  sku: string;
  barcode?: string;
  categoryId?: string;
  brandId?: string;
  supplierId?: string;
  status: ProductStatus;
  visibility: ProductVisibility;
  badges: string[];
  shortDescription?: string;
  description?: string;
  notice?: string;
  specifications: ProductSpecificationEntity[];
  media: ProductMediaEntity[];
  hasVariants: boolean;
  variants: ProductVariantEntity[];
  metaTitle?: string;
  metaDescription?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
