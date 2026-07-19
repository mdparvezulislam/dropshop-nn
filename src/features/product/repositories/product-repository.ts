import { BaseRepository } from "@/shared/lib/database/generic-repository";
import {
  ProductModel,
  BrandModel,
  CategoryModel,
  ProductTagModel,
  ProductDocumentType,
} from "./product-model";
import { Product, Brand, Category, ProductTag } from "../domain/product-entity";
import { DatabaseQueryOptions } from "@/shared/lib/database/types";
import { logger } from "@/shared/utils/logger";
import { DatabaseError } from "@/shared/errors/app-error";

export class BrandRepository extends BaseRepository<any, Brand> {
  constructor() {
    super(BrandModel, BrandRepository.mapToDomain);
  }

  private static mapToDomain(doc: any): Brand {
    return {
      id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      logo: doc.logo,
      status: doc.status || "active",
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
    };
  }
}

export class CategoryRepository extends BaseRepository<any, Category> {
  constructor() {
    super(CategoryModel, CategoryRepository.mapToDomain);
  }

  private static mapToDomain(doc: any): Category {
    return {
      id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      parentCategoryId: doc.parentCategoryId?.toString() || null,
      status: doc.status || "active",
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
    };
  }
}

export class ProductTagRepository extends BaseRepository<any, ProductTag> {
  constructor() {
    super(ProductTagModel, ProductTagRepository.mapToDomain);
  }

  private static mapToDomain(doc: any): ProductTag {
    return {
      id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      status: doc.status || "active",
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
    };
  }
}

export class ProductRepository extends BaseRepository<ProductDocumentType, Product> {
  constructor() {
    super(ProductModel, ProductRepository.mapToDomain);
  }

  private static mapToDomain(doc: ProductDocumentType): Product {
    return {
      id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      shortDescription: doc.shortDescription,
      fullDescription: doc.fullDescription,
      productModel: doc.productModel,
      sku: doc.sku,
      barcode: doc.barcode,
      gtin: doc.gtin,
      brandId: doc.brandId?.toString(),
      categoryId: doc.categoryId?.toString(),
      supplierId: doc.supplierId.toString(),
      status: doc.status,
      visibility: doc.visibility,
      variants: doc.variants
        ? doc.variants.map((item: any) => ({
            color: item.color,
            size: item.size,
            storage: item.storage,
            ram: item.ram,
            capacity: item.capacity,
            material: item.material,
            sku: item.sku,
            customAttributes: item.customAttributes
              ? Object.fromEntries(item.customAttributes as any)
              : undefined,
          }))
        : [],
      media: doc.media
        ? doc.media.map((item: any) => ({
            url: item.url,
            type: item.type,
            isFeatured: item.isFeatured,
            altText: item.altText,
            sortOrder: item.sortOrder,
          }))
        : [],
      attributes: doc.attributes
        ? doc.attributes.map((item: any) => ({
            key: item.key,
            value: item.value,
            group: item.group,
          }))
        : [],
      seo: doc.seo
        ? {
            metaTitle: doc.seo.metaTitle,
            metaDescription: doc.seo.metaDescription,
            metaKeywords: doc.seo.metaKeywords,
            ogImage: doc.seo.ogImage,
            canonicalUrl: doc.seo.canonicalUrl,
          }
        : undefined,
      tags: doc.tags || [],
      isFeatured: doc.isFeatured || false,
      isTrending: doc.isTrending || false,
      isNewArrival: doc.isNewArrival || false,
      isBestSeller: doc.isBestSeller || false,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      metadata: doc.metadata ? Object.fromEntries(doc.metadata as any) : undefined,
    };
  }

  async findBySlug(slug: string, options?: DatabaseQueryOptions): Promise<Product | null> {
    try {
      return this.findOne({ slug: slug.toLowerCase().trim() }, options);
    } catch (error) {
      logger.error("ProductRepository findBySlug failed", error, { slug });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findBySku(sku: string, options?: DatabaseQueryOptions): Promise<Product | null> {
    try {
      return this.findOne({ sku: sku.toUpperCase().trim() }, options);
    } catch (error) {
      logger.error("ProductRepository findBySku failed", error, { sku });
      throw new DatabaseError("Database search error", error);
    }
  }
}
export default ProductRepository;
