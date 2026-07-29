import type { PipelineStage } from "mongoose";
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

export interface PublicCardPricingRow {
  sellingPrice?: number;
  comparePrice?: number;
  promotionalPrice?: number;
  currency?: string;
}

export interface PublicCardQueryParams {
  filter: Record<string, unknown>;
  textQuery?: string;
  minPriceMinor?: number;
  maxPriceMinor?: number;
  onSale?: boolean;
  inStock?: boolean;
  sort: "newest" | "price_asc" | "price_desc" | "featured" | "name_asc" | "relevance";
  page: number;
  limit: number;
}

export interface PublicCardQueryResult {
  items: Array<{
    product: Product;
    pricing: PublicCardPricingRow | null;
    /** Summed available stock across active inventory rows; null = untracked. */
    stockTotal: number | null;
  }>;
  totalCount: number;
  page: number;
  limit: number;
}

export class ProductRepository extends BaseRepository<ProductDocument, Product> {
  constructor() {
    super(ProductModel, ProductRepository.mapToDomain);
  }

  async getDashboardStats(): Promise<{
    totalProducts: number;
    recentlyCreated: number;
    recentlyUpdated: number;
    draftProducts: number;
    scheduledProducts: number;
    activeProducts: number;
    archivedProducts: number;
    missingImages: number;
    missingSEO: number;
    lowHealthProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    hasVariants: number;
    noCategory: number;
  }> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalProducts,
      recentlyCreated,
      recentlyUpdated,
      draftProducts,
      activeProducts,
      archivedProducts,
      missingImages,
      missingSEO,
      lowHealthProducts,
      lowStockProducts,
      outOfStockProducts,
      hasVariants,
      noCategory,
      scheduledProducts,
    ] = await Promise.all([
      this.count({ isDeleted: { $ne: true } }),
      this.count({ createdAt: { $gte: sevenDaysAgo }, isDeleted: { $ne: true } }),
      this.count({ updatedAt: { $gte: sevenDaysAgo }, isDeleted: { $ne: true } }),
      this.count({ status: "draft", isDeleted: { $ne: true } }),
      this.count({ status: "active", isDeleted: { $ne: true } }),
      this.count({ status: "archived", isDeleted: { $ne: true } }),
      ProductModel.countDocuments({
        isDeleted: { $ne: true },
        $or: [{ media: { $exists: false } }, { media: { $size: 0 } }],
      }).exec(),
      ProductModel.countDocuments({
        isDeleted: { $ne: true },
        $or: [
          { "seo.metaTitle": { $exists: false } },
          { "seo.metaTitle": "" },
          { "seo.metaTitle": null },
          { "seo.metaDescription": { $exists: false } },
          { "seo.metaDescription": "" },
          { "seo.metaDescription": null },
        ],
      }).exec(),
      ProductModel.countDocuments({
        isDeleted: { $ne: true },
        $and: [
          {
            $or: [{ media: { $exists: false } }, { media: { $size: 0 } }],
          },
          {
            $or: [
              { "seo.metaTitle": { $exists: false } },
              { "seo.metaTitle": "" },
              { "seo.metaTitle": null },
              { "seo.metaDescription": { $exists: false } },
              { "seo.metaDescription": "" },
              { "seo.metaDescription": null },
            ],
          },
        ],
      }).exec(),
      this.count({
        isDeleted: { $ne: true },
        $expr: {
          $and: [
            { $gte: [{ $ifNull: ["$stockQuantity", "$stock", 0] }, 1] },
            { $lte: [{ $ifNull: ["$stockQuantity", "$stock", 0] }, 10] },
          ],
        },
      }),
      this.count({
        isDeleted: { $ne: true },
        $expr: { $lte: [{ $ifNull: ["$stockQuantity", "$stock", 0] }, 0] },
      }),
      this.count({ variants: { $not: { $size: 0 } }, isDeleted: { $ne: true } }),
      this.count({ categoryId: { $exists: false }, isDeleted: { $ne: true } }),
      ProductModel.countDocuments({
        isDeleted: { $ne: true },
        publishSchedule: { $exists: true, $ne: null },
      }).exec(),
    ]);

    return {
      totalProducts,
      recentlyCreated,
      recentlyUpdated,
      draftProducts,
      scheduledProducts,
      activeProducts,
      archivedProducts,
      missingImages,
      missingSEO,
      lowHealthProducts,
      lowStockProducts,
      outOfStockProducts,
      hasVariants,
      noCategory,
    };
  }

  public static mapToDomain(doc: ProductDocument): Product {
    const rawBadges = Array.isArray(doc.badges) && doc.badges.length > 0 ? doc.badges : [];
    const inferredBadges: string[] = [...rawBadges];
    if (doc.featured && !inferredBadges.includes("featured")) inferredBadges.push("featured");
    if (doc.trending && !inferredBadges.includes("trending")) inferredBadges.push("trending");
    if (doc.flashSale && !inferredBadges.includes("flash_sale")) inferredBadges.push("flash_sale");
    if (doc.newArrival && !inferredBadges.includes("new_arrival"))
      inferredBadges.push("new_arrival");

    const description =
      doc.description ||
      doc.content?.description ||
      (typeof doc.content?.richDescription === "string" ? doc.content.richDescription : undefined);

    const metaTitle = doc.metaTitle || doc.seo?.metaTitle || doc.name;
    const metaDescription =
      doc.metaDescription || doc.seo?.metaDescription || doc.shortDescription || "";

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
      // Counted against the same predicate as the page itself — counting `filter`
      // alone included soft-deleted products and over-reported the total.
      const totalCount = await this.model
        .countDocuments({ ...filter, isDeleted: { $ne: true } })
        .exec();

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

  /** Minimal projection for the XML sitemap: slug + updatedAt of publicly visible products. */
  async findSlugsForSitemap(limit = 5000): Promise<Array<{ slug: string; updatedAt?: Date }>> {
    try {
      await this.ensureConnected();
      const docs = await this.model
        .find({ status: "active", visibility: "public", isDeleted: { $ne: true } })
        .select("slug updatedAt")
        .sort({ updatedAt: -1 })
        .limit(limit)
        .lean()
        .exec();
      return docs.map((doc: any) => ({ slug: doc.slug, updatedAt: doc.updatedAt }));
    } catch (error) {
      logger.error("ProductRepository findSlugsForSitemap failed", error);
      throw new DatabaseError("Database query error", error);
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

  /**
   * Product counts grouped by a reference field (`categoryId`, `brandId`, …).
   * One aggregation for the whole taxonomy instead of a count query per row.
   */
  async groupCountBy(
    field: "categoryId" | "brandId" | "supplierId",
    match: Record<string, unknown> = {},
  ): Promise<{ key: string; count: number }[]> {
    try {
      await this.ensureConnected();
      const rows = await this.model
        .aggregate<{ _id: unknown; count: number }>([
          { $match: { ...match, isDeleted: { $ne: true }, [field]: { $ne: null } } },
          { $group: { _id: `$${field}`, count: { $sum: 1 } } },
        ])
        .exec();
      return rows
        .filter((row) => row._id !== null && row._id !== undefined)
        .map((row) => ({ key: String(row._id), count: row.count }));
    } catch (error) {
      logger.error("ProductRepository groupCountBy failed", error, { field });
      throw new DatabaseError("Database count error", error);
    }
  }

  /**
   * Public storefront listing query: joins the base pricing row and the
   * inventory total in ONE aggregation so lists never fan out into
   * per-product queries, price sorting/filtering happens in the database
   * (pre-pagination), and stock is real.
   *
   * Monetary inputs/outputs here are MINOR units (paisa) — conversion to BDT
   * is the PublicCatalogService's job.
   */
  async findPublicCards(params: PublicCardQueryParams): Promise<PublicCardQueryResult> {
    try {
      await this.ensureConnected();

      const match: Record<string, unknown> = { ...params.filter, isDeleted: { $ne: true } };
      if (params.textQuery) match.$text = { $search: params.textQuery };

      const pipeline: PipelineStage[] = [
        { $match: match },
        // Base pricing row: prefer the product-level row (no variantSku).
        // Missing values sort before strings, so the variantSku-less row wins.
        {
          $lookup: {
            from: "productpricings",
            let: { pid: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$productId", "$$pid"] } } },
              { $sort: { variantSku: 1 } },
              { $limit: 1 },
              {
                $project: {
                  _id: 0,
                  sellingPrice: 1,
                  comparePrice: 1,
                  promotionalPrice: 1,
                  currency: 1,
                },
              },
            ],
            as: "pricingRows",
          },
        },
        {
          $lookup: {
            from: "productinventories",
            let: { pid: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$productId", "$$pid"] } } },
              { $match: { status: "active" } },
              { $group: { _id: null, total: { $sum: "$availableStock" } } },
            ],
            as: "stockRows",
          },
        },
        {
          $addFields: {
            publicPricing: { $first: "$pricingRows" },
            publicStockTotal: { $first: "$stockRows.total" },
            publicStockTracked: { $gt: [{ $size: "$stockRows" }, 0] },
          },
        },
        {
          $addFields: {
            publicEffectivePrice: {
              $cond: [
                {
                  $and: [
                    { $gt: ["$publicPricing.promotionalPrice", 0] },
                    { $lt: ["$publicPricing.promotionalPrice", "$publicPricing.sellingPrice"] },
                  ],
                },
                "$publicPricing.promotionalPrice",
                "$publicPricing.sellingPrice",
              ],
            },
          },
        },
      ];

      if (params.minPriceMinor !== undefined || params.maxPriceMinor !== undefined) {
        const range: Record<string, number> = {};
        if (params.minPriceMinor !== undefined) range.$gte = params.minPriceMinor;
        if (params.maxPriceMinor !== undefined) range.$lte = params.maxPriceMinor;
        pipeline.push({ $match: { publicEffectivePrice: range } });
      }

      if (params.onSale) {
        pipeline.push({
          $match: {
            $expr: {
              $or: [
                {
                  $and: [
                    { $gt: ["$publicPricing.promotionalPrice", 0] },
                    { $lt: ["$publicPricing.promotionalPrice", "$publicPricing.sellingPrice"] },
                  ],
                },
                { $gt: ["$publicPricing.comparePrice", "$publicPricing.sellingPrice"] },
              ],
            },
          },
        });
      }

      if (params.inStock) {
        // Untracked products (no inventory rows) count as sellable —
        // dropship items are not stock-managed locally.
        pipeline.push({
          $match: {
            $or: [{ publicStockTracked: false }, { publicStockTotal: { $gt: 0 } }],
          },
        });
      }

      const sortStage: Record<string, 1 | -1 | { $meta: "textScore" }> =
        params.textQuery && params.sort === "relevance"
          ? { score: { $meta: "textScore" }, createdAt: -1 }
          : params.sort === "price_asc"
            ? { publicEffectivePrice: 1, _id: 1 }
            : params.sort === "price_desc"
              ? { publicEffectivePrice: -1, _id: -1 }
              : params.sort === "featured"
                ? { featured: -1, createdAt: -1, _id: -1 }
                : params.sort === "name_asc"
                  ? { name: 1, _id: 1 }
                  : { createdAt: -1, _id: -1 };

      const page = Math.max(1, params.page);
      const limit = params.limit;

      pipeline.push({
        $facet: {
          items: [{ $sort: sortStage }, { $skip: (page - 1) * limit }, { $limit: limit }],
          total: [{ $count: "n" }],
        },
      });

      const [result] = await this.model.aggregate(pipeline).exec();
      const docs: Array<
        ProductDocument & {
          publicPricing?: PublicCardPricingRow | null;
          publicStockTotal?: number | null;
          publicStockTracked?: boolean;
        }
      > = result?.items ?? [];
      const totalCount: number = result?.total?.[0]?.n ?? 0;

      return {
        items: docs.map((doc) => ({
          product: ProductRepository.mapToDomain(doc as ProductDocument),
          pricing: doc.publicPricing ?? null,
          stockTotal: doc.publicStockTracked ? (doc.publicStockTotal ?? 0) : null,
        })),
        totalCount,
        page,
        limit,
      };
    } catch (error) {
      logger.error("ProductRepository findPublicCards failed", error);
      throw new DatabaseError("Database query error", error);
    }
  }

  /**
   * Live catalog counters. Computed in the database rather than by paging documents
   * into memory, so the dashboard KPIs reflect the whole catalog and not just page 1.
   */
  async countCatalogStatuses(): Promise<{
    total: number;
    active: number;
    draft: number;
    archived: number;
  }> {
    try {
      await this.ensureConnected();
      const rows = await this.model.aggregate<{ _id: string; count: number }>([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      const map = new Map<string, number>(rows.map((r) => [r._id, r.count]));
      const active = map.get("active") ?? 0;
      const draft = map.get("draft") ?? 0;
      const archived = map.get("archived") ?? 0;
      const total = Array.from(map.values()).reduce((sum, val) => sum + val, 0);

      return { total, active, draft, archived };
    } catch (error) {
      logger.error("ProductRepository countCatalogStatuses failed", error);
      throw new DatabaseError("Database count error", error);
    }
  }
}

export default ProductRepository;
