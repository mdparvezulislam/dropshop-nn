import { BaseRepository } from "@/lib/database/generic-repository";
import { ProductModel, ProductDocument } from "./product-model";
import { Product } from "../domain/product-entity";
import { DatabaseQueryOptions } from "@/lib/database/types";
import { logger } from "@/lib/utils/logger";
import { DatabaseError } from "@/lib/errors/app-error";

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

  public static mapToDomain(doc: ProductDocument): Product {
    const rawBadges = Array.isArray(doc.badges) && doc.badges.length > 0 ? doc.badges : [];
    const inferredBadges: string[] = [...rawBadges];
    if (doc.featured && !inferredBadges.includes("featured")) inferredBadges.push("featured");
    if (doc.trending && !inferredBadges.includes("trending")) inferredBadges.push("trending");
    if (doc.flashSale && !inferredBadges.includes("flash_sale")) inferredBadges.push("flash_sale");
    if (doc.newArrival && !inferredBadges.includes("new_arrival")) inferredBadges.push("new_arrival");

    const description =
      doc.description ||
      doc.content?.description ||
      (typeof doc.content?.richDescription === "string" ? doc.content.richDescription : undefined);

    const metaTitle = doc.metaTitle || doc.seo?.metaTitle || doc.name;
    const metaDescription = doc.metaDescription || doc.seo?.metaDescription || doc.shortDescription || "";

    const specifications =
      Array.isArray(doc.specifications) && doc.specifications.length > 0
        ? doc.specifications.map((s: any) => ({
            key: s.key,
            value: s.value,
            group: s.group || "general",
          }))
        : doc.content?.specifications
        ? doc.content.specifications.map((s: any) => ({
            key: s.key,
            value: s.value,
            group: s.group || "general",
          }))
        : [];

    return {
      id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      sku: doc.sku,
      barcode: doc.barcode,
      gtin: doc.gtin,
      productType: (doc.productType as Product["productType"]) ?? "simple",
      shortDescription: doc.shortDescription,
      description,
      notice: doc.notice,
      productModel: doc.productModel,
      brandId: doc.brandId?.toString(),
      categoryId: doc.categoryId?.toString(),
      supplierId: doc.supplierId?.toString(),
      status: doc.status as Product["status"],
      visibility: doc.visibility as Product["visibility"],
      badges: inferredBadges,
      featured: doc.featured || inferredBadges.includes("featured"),
      trending: doc.trending || inferredBadges.includes("trending"),
      flashSale: doc.flashSale || inferredBadges.includes("flash_sale"),
      newArrival: doc.newArrival || inferredBadges.includes("new_arrival"),
      hasVariants: doc.hasVariants || (doc.variants && doc.variants.length > 0),
      variants: doc.variants
        ? doc.variants.map((v: any) => ({
            id: v.id || v._id?.toString(),
            name: v.name || [v.color, v.size, v.storage].filter(Boolean).join(" / "),
            attributes: v.attributes ? Object.fromEntries(v.attributes as any) : undefined,
            sku: v.sku,
            priceAdjustment: v.priceAdjustment ?? 0,
            stock: v.stock ?? 0,
            image: v.image || (v.images && v.images.length > 0 ? v.images[0] : undefined),
            status: v.status || "active",
            isActive: v.isActive ?? true,

            // Legacy attributes
            color: v.color,
            size: v.size,
            storage: v.storage,
            ram: v.ram,
            capacity: v.capacity,
            material: v.material,
            bundle: v.bundle,
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
            sortOrder: v.sortOrder,
            customAttributes: v.customAttributes
              ? Object.fromEntries(v.customAttributes as any)
              : undefined,
          }))
        : [],
      media: doc.media
        ? doc.media.map((m: any) => ({
            url: m.url,
            type: m.type || "image",
            isFeatured: m.isFeatured || false,
            altText: m.altText,
            caption: m.caption,
            sortOrder: m.sortOrder || 0,
            width: m.width,
            height: m.height,
            fileSize: m.fileSize,
            mimeType: m.mimeType,
          }))
        : [],
      specifications,
      metaTitle,
      metaDescription,
      seo: doc.seo
        ? {
            metaTitle: doc.seo.metaTitle || metaTitle,
            metaDescription: doc.seo.metaDescription || metaDescription,
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
        : { metaTitle, metaDescription },
      content: doc.content
        ? {
            richDescription: doc.content.richDescription || description,
            description,
            highlights: doc.content.highlights,
            includedItems: doc.content.includedItems,
            features: doc.content.features,
            specifications,
            technicalDetails: doc.content.technicalDetails,
            warrantyInformation: doc.content.warrantyInformation,
            returnPolicy: doc.content.returnPolicy,
          }
        : { description, specifications },
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
      isDeleted: doc.isDeleted || false,
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
