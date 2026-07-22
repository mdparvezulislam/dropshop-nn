import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { ProductModel, ProductDocument } from "./product-model";
import { Product } from "../domain/product-entity";
import { DatabaseQueryOptions } from "@/shared/lib/database/types";
import { logger } from "@/shared/utils/logger";
import { DatabaseError } from "@/shared/errors/app-error";

export interface CursorPaginationParams {
  cursor?: string;
  limit: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedCatalogResult<T> {
  items: T[];
  totalCount: number;
  cursor?: string | null;
  hasMore: boolean;
  limit: number;
}

export class ProductRepository extends BaseRepository<ProductDocument, Product> {
  constructor() {
    super(ProductModel, ProductRepository.mapToDomain);
  }

  private static mapToDomain(doc: ProductDocument): Product {
    return {
      id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      sku: doc.sku,
      barcode: doc.barcode,
      gtin: doc.gtin,
      shortDescription: doc.shortDescription,
      productModel: doc.productModel,
      brandId: doc.brandId?.toString(),
      categoryId: doc.categoryId?.toString(),
      supplierId: doc.supplierId?.toString(),
      status: doc.status as Product["status"],
      visibility: doc.visibility as Product["visibility"],
      featured: doc.featured || false,
      trending: doc.trending || false,
      flashSale: doc.flashSale || false,
      newArrival: doc.newArrival || false,
      variants: doc.variants
        ? doc.variants.map((v: any) => ({
            color: v.color,
            size: v.size,
            storage: v.storage,
            ram: v.ram,
            capacity: v.capacity,
            material: v.material,
            bundle: v.bundle,
            sku: v.sku,
            barcode: v.barcode,
            weight: v.weight,
            weightUnit: v.weightUnit,
            dimensions: v.dimensions
              ? {
                  length: v.dimensions.length,
                  width: v.dimensions.width,
                  height: v.dimensions.height,
                  unit: v.dimensions.unit,
                }
              : undefined,
            images: v.images,
            status: v.status,
            sortOrder: v.sortOrder,
            customAttributes: v.customAttributes
              ? Object.fromEntries(v.customAttributes as any)
              : undefined,
          }))
        : [],
      media: doc.media
        ? doc.media.map((m: any) => ({
            url: m.url,
            type: m.type,
            isFeatured: m.isFeatured,
            altText: m.altText,
            caption: m.caption,
            sortOrder: m.sortOrder,
            width: m.width,
            height: m.height,
            fileSize: m.fileSize,
            mimeType: m.mimeType,
          }))
        : [],
      seo: doc.seo
        ? {
            metaTitle: doc.seo.metaTitle,
            metaDescription: doc.seo.metaDescription,
            metaKeywords: doc.seo.metaKeywords,
            canonicalUrl: doc.seo.canonicalUrl,
            ogTitle: doc.seo.ogTitle,
            ogDescription: doc.seo.ogDescription,
            ogImage: doc.seo.ogImage,
            ogType: doc.seo.ogType,
            twitterTitle: doc.seo.twitterTitle,
            twitterDescription: doc.seo.twitterDescription,
            twitterImage: doc.seo.twitterImage,
            twitterCardType: doc.seo.twitterCardType,
          }
        : undefined,
      content: doc.content
        ? {
            richDescription: doc.content.richDescription,
            highlights: doc.content.highlights,
            includedItems: doc.content.includedItems,
            features: doc.content.features,
            specifications: doc.content.specifications
              ? doc.content.specifications.map((s: any) => ({
                  key: s.key,
                  value: s.value,
                  group: s.group,
                }))
              : undefined,
            technicalDetails: doc.content.technicalDetails,
            warrantyInformation: doc.content.warrantyInformation,
            returnPolicy: doc.content.returnPolicy,
          }
        : undefined,
      suppliers: doc.suppliers
        ? doc.suppliers.map((s: any) => ({
            supplierId: s.supplierId,
            supplierSku: s.supplierSku,
            isPrimary: s.isPrimary,
            sortOrder: s.sortOrder,
          }))
        : [],
      searchMetadata: doc.searchMetadata
        ? {
            searchKeywords: doc.searchMetadata.searchKeywords,
            searchSynonyms: doc.searchMetadata.searchSynonyms,
            searchWeight: doc.searchMetadata.searchWeight,
            popularityScore: doc.searchMetadata.popularityScore,
            searchable: doc.searchMetadata.searchable,
          }
        : undefined,
      tags: doc.tags || [],
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

  async findWithCursor(
    params: CursorPaginationParams,
    filter: Record<string, unknown> = {},
  ): Promise<PaginatedCatalogResult<Product>> {
    try {
      await this.ensureConnected();
      const query: Record<string, unknown> = { ...filter, isDeleted: { $ne: true } };

      if (params.cursor) {
        const sortOp = params.order === "asc" ? "$gt" : "$lt";
        query._id = { [sortOp]: params.cursor };
      }

      const sortField = params.sort || "createdAt";
      const sortOrder = params.order === "asc" ? 1 : -1;

      const docs = await this.model
        .find(query)
        .sort({ [sortField]: sortOrder, _id: sortOrder } as any)
        .limit(params.limit + 1)
        .lean()
        .exec();

      const hasMore = docs.length > params.limit;
      const items = docs.slice(0, params.limit);
      const totalCount = await this.model.countDocuments(filter).exec();

      return {
        items: items.map((doc: any) => ProductRepository.mapToDomain(doc as ProductDocument)),
        totalCount,
        cursor: hasMore && items.length > 0 ? items[items.length - 1]._id.toString() : null,
        hasMore,
        limit: params.limit,
      };
    } catch (error) {
      logger.error("ProductRepository findWithCursor failed", error);
      throw new DatabaseError("Database query error", error);
    }
  }

  async findByCategory(
    categoryId: string,
    params: CursorPaginationParams,
  ): Promise<PaginatedCatalogResult<Product>> {
    return this.findWithCursor(params, { categoryId });
  }

  async findByBrand(
    brandId: string,
    params: CursorPaginationParams,
  ): Promise<PaginatedCatalogResult<Product>> {
    return this.findWithCursor(params, { brandId });
  }

  async findByCollection(
    collectionProductIds: string[],
    params: CursorPaginationParams,
  ): Promise<PaginatedCatalogResult<Product>> {
    return this.findWithCursor(params, { _id: { $in: collectionProductIds } });
  }

  async search(
    query: string,
    params: CursorPaginationParams,
    filters: Record<string, unknown> = {},
  ): Promise<PaginatedCatalogResult<Product>> {
    try {
      await this.ensureConnected();
      const searchFilter: Record<string, unknown> = {
        ...filters,
        $text: { $search: query },
        isDeleted: { $ne: true },
      };

      const sortField = params.sort || "createdAt";
      const sortOrder = params.order === "asc" ? 1 : -1;

      const docs = await this.model
        .find(searchFilter)
        .sort({ score: { $meta: "textScore" }, [sortField]: sortOrder } as any)
        .limit(params.limit + 1)
        .lean()
        .exec();

      const hasMore = docs.length > params.limit;
      const items = docs.slice(0, params.limit);
      const totalCount = await this.model.countDocuments(searchFilter).exec();

      return {
        items: items.map((doc: any) => ProductRepository.mapToDomain(doc as ProductDocument)),
        totalCount,
        cursor: hasMore && items.length > 0 ? items[items.length - 1]._id.toString() : null,
        hasMore,
        limit: params.limit,
      };
    } catch (error) {
      logger.error("ProductRepository search failed", error, { query });
      throw new DatabaseError("Database search error", error);
    }
  }

  async countByStatus(status: string): Promise<number> {
    try {
      return this.count({ status });
    } catch (error) {
      logger.error("ProductRepository countByStatus failed", error, { status });
      throw new DatabaseError("Database count error", error);
    }
  }
}

export default ProductRepository;
