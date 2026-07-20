import {
  ProductRepository,
  CursorPaginationParams,
  PaginatedCatalogResult,
} from "../repositories/product-repository";
import { BrandRepository } from "../repositories/classification-repository";
import { CategoryRepository } from "../repositories/classification-repository";
import { Product } from "../domain/product-entity";
import { ValidationError, NotFoundError } from "@/shared/errors/app-error";
import { logger } from "@/shared/utils/logger";
import { EventBus } from "@/shared/lib/event-bus";
import { CATALOG_EVENTS } from "../domain/catalog-events";
import { generateSlug } from "@/shared/utils/slug-utils";
import type { ActorInfo } from "@/shared/core/types";
import type { CreateProductInput, UpdateProductInput } from "../types/validation";

export class ProductService {
  private readonly productRepository: ProductRepository;
  private readonly brandRepository: BrandRepository;
  private readonly categoryRepository: CategoryRepository;

  constructor() {
    this.productRepository = new ProductRepository();
    this.brandRepository = new BrandRepository();
    this.categoryRepository = new CategoryRepository();
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = generateSlug(name);
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await this.productRepository.findBySlug(uniqueSlug);
      if (!existing) break;
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    return uniqueSlug;
  }

  async create(data: CreateProductInput, actor?: ActorInfo): Promise<Product> {
    logger.info("ProductService: creating product", { name: data.name, actor: actor?.id });

    const existingSku = await this.productRepository.findBySku(data.sku);
    if (existingSku) {
      throw new ValidationError("SKU already exists", {
        sku: ["A product with this SKU is already registered"],
      });
    }

    if (data.barcode) {
      const existingBarcode = await this.productRepository.findOne({ barcode: data.barcode });
      if (existingBarcode) {
        throw new ValidationError("Barcode already exists", {
          barcode: ["A product with this barcode is already registered"],
        });
      }
    }

    const slug = await this.generateUniqueSlug(data.name);

    if (data.brandId) {
      const brand = await this.brandRepository.findById(data.brandId);
      if (!brand)
        throw new ValidationError("Brand not found", { brandId: ["Brand does not exist"] });
    }
    if (data.categoryId) {
      const category = await this.categoryRepository.findById(data.categoryId);
      if (!category)
        throw new ValidationError("Category not found", {
          categoryId: ["Category does not exist"],
        });
    }

    const product = await this.productRepository.create({
      ...data,
      slug,
      status: "draft",
    });

    await EventBus.publish(
      CATALOG_EVENTS.PRODUCT_CREATED,
      {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        slug: product.slug,
        brandId: product.brandId,
        categoryId: product.categoryId,
        status: product.status,
        visibility: product.visibility,
        createdAt: new Date().toISOString(),
      },
      { actor, source: "catalog-service" },
    );

    logger.info("ProductService: product created", { productId: product.id, sku: product.sku });
    return product;
  }

  async findById(id: string): Promise<Product | null> {
    return this.productRepository.findById(id);
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return this.productRepository.findBySlug(slug);
  }

  async findBySku(sku: string): Promise<Product | null> {
    return this.productRepository.findBySku(sku);
  }

  async update(id: string, data: UpdateProductInput, actor?: ActorInfo): Promise<Product> {
    logger.info("ProductService: updating product", { id, actor: actor?.id });

    const existing = await this.productRepository.findById(id);
    if (!existing) throw new NotFoundError("Product not found");

    let slug = existing.slug;
    if (data.name && data.name.trim().toLowerCase() !== existing.name.trim().toLowerCase()) {
      slug = await this.generateUniqueSlug(data.name);
    }

    if (data.sku && data.sku.toUpperCase().trim() !== existing.sku.toUpperCase().trim()) {
      const dup = await this.productRepository.findBySku(data.sku);
      if (dup) throw new ValidationError("SKU already exists", { sku: ["SKU is already in use"] });
    }

    if (data.barcode && data.barcode !== existing.barcode) {
      const dup = await this.productRepository.findOne({ barcode: data.barcode, _id: { $ne: id } });
      if (dup)
        throw new ValidationError("Barcode already exists", {
          barcode: ["Barcode is already in use"],
        });
    }

    const updated = await this.productRepository.update(id, { ...data, slug });

    const changedFields = Object.keys(data);
    await EventBus.publish(
      CATALOG_EVENTS.PRODUCT_UPDATED,
      {
        productId: updated.id,
        sku: updated.sku,
        changedFields,
        updatedAt: new Date().toISOString(),
      },
      { actor, source: "catalog-service" },
    );

    if (data.visibility && data.visibility !== existing.visibility) {
      await EventBus.publish(
        CATALOG_EVENTS.VISIBILITY_CHANGED,
        {
          productId: updated.id,
          oldVisibility: existing.visibility,
          newVisibility: data.visibility,
        },
        { actor, source: "catalog-service" },
      );
    }

    if (data.seo && JSON.stringify(data.seo) !== JSON.stringify(existing.seo)) {
      await EventBus.publish(
        CATALOG_EVENTS.SEO_UPDATED,
        {
          productId: updated.id,
          changedFields: Object.keys(data.seo),
        },
        { actor, source: "catalog-service" },
      );
    }

    if (data.brandId !== existing.brandId || data.categoryId !== existing.categoryId) {
      await EventBus.publish(
        CATALOG_EVENTS.CLASSIFICATION_CHANGED,
        {
          productId: updated.id,
          brandId: data.brandId || existing.brandId,
          categoryId: data.categoryId || existing.categoryId,
        },
        { actor, source: "catalog-service" },
      );
    }

    return updated;
  }

  async delete(id: string, actor?: ActorInfo): Promise<boolean> {
    logger.info("ProductService: deleting product", { id, actor: actor?.id });

    const existing = await this.productRepository.findById(id);
    if (!existing) throw new NotFoundError("Product not found");

    const result = await this.productRepository.delete(id);

    await EventBus.publish(
      CATALOG_EVENTS.PRODUCT_DELETED,
      {
        productId: id,
        sku: existing.sku,
        deletedAt: new Date().toISOString(),
      },
      { actor, source: "catalog-service" },
    );

    return result;
  }

  async publish(id: string, actor?: ActorInfo): Promise<Product> {
    logger.info("ProductService: publishing product", { id, actor: actor?.id });

    const existing = await this.productRepository.findById(id);
    if (!existing) throw new NotFoundError("Product not found");

    if (existing.status === "active") throw new ValidationError("Product is already published");
    if (existing.status === "archived")
      throw new ValidationError("Cannot publish an archived product");

    if (existing.variants.length === 0) {
      throw new ValidationError("Product must have at least one variant before publishing");
    }

    const updated = await this.productRepository.update(id, { status: "active" as const });

    await EventBus.publish(
      CATALOG_EVENTS.PRODUCT_PUBLISHED,
      {
        productId: updated.id,
        name: updated.name,
        sku: updated.sku,
        visibility: updated.visibility,
        publishedAt: new Date().toISOString(),
      },
      { actor, source: "catalog-service" },
    );

    return updated;
  }

  async archive(id: string, reason?: string, actor?: ActorInfo): Promise<Product> {
    logger.info("ProductService: archiving product", { id, reason, actor: actor?.id });

    const existing = await this.productRepository.findById(id);
    if (!existing) throw new NotFoundError("Product not found");
    if (existing.status === "archived") throw new ValidationError("Product is already archived");

    const updated = await this.productRepository.update(id, { status: "archived" as const });

    await EventBus.publish(
      CATALOG_EVENTS.PRODUCT_ARCHIVED,
      {
        productId: updated.id,
        name: updated.name,
        sku: updated.sku,
        reason,
        archivedAt: new Date().toISOString(),
      },
      { actor, source: "catalog-service" },
    );

    return updated;
  }

  async duplicate(id: string, actor?: ActorInfo): Promise<Product> {
    logger.info("ProductService: duplicating product", { id, actor: actor?.id });

    const existing = await this.productRepository.findById(id);
    if (!existing) throw new NotFoundError("Product not found");

    const newSku = `${existing.sku}-DUP-${Date.now().toString().slice(-4)}`;
    const name = `${existing.name} (Copy)`;

    const duplicated = await this.productRepository.create({
      name,
      slug: await this.generateUniqueSlug(name),
      sku: newSku,
      barcode: existing.barcode ? `${existing.barcode}-DUP` : undefined,
      gtin: existing.gtin ? `${existing.gtin}-DUP` : undefined,
      shortDescription: existing.shortDescription,
      productModel: existing.productModel,
      brandId: existing.brandId,
      categoryId: existing.categoryId,
      supplierId: existing.supplierId,
      visibility: existing.visibility,
      featured: false,
      trending: false,
      flashSale: false,
      newArrival: false,
      variants: existing.variants.map((v) => ({
        ...v,
        sku: `${v.sku}-DUP-${Date.now().toString().slice(-4)}`,
      })),
      media: existing.media,
      seo: existing.seo,
      content: existing.content,
      suppliers: existing.suppliers,
      searchMetadata: existing.searchMetadata,
      tags: existing.tags,
    });

    await EventBus.publish(
      CATALOG_EVENTS.PRODUCT_CREATED,
      {
        productId: duplicated.id,
        name: duplicated.name,
        sku: duplicated.sku,
        slug: duplicated.slug,
        brandId: duplicated.brandId,
        categoryId: duplicated.categoryId,
        status: duplicated.status,
        visibility: duplicated.visibility,
        createdAt: new Date().toISOString(),
      },
      { actor, source: "catalog-service" },
    );

    return duplicated;
  }

  async addVariant(productId: string, variant: any, actor?: ActorInfo): Promise<Product> {
    logger.info("ProductService: adding variant", { productId, sku: variant.sku });

    const product = await this.productRepository.findById(productId);
    if (!product) throw new NotFoundError("Product not found");

    const existingVariant = product.variants.find((v) => v.sku === variant.sku);
    if (existingVariant) throw new ValidationError("Variant SKU already exists on this product");

    product.variants.push(variant);
    const updated = await this.productRepository.update(productId, { variants: product.variants });

    await EventBus.publish(
      CATALOG_EVENTS.VARIANT_CREATED,
      {
        productId,
        variantSku: variant.sku,
        dimensions: Object.fromEntries(
          Object.entries(variant).filter(
            ([k, v]) =>
              ["color", "size", "storage", "ram", "capacity", "material", "bundle"].includes(k) &&
              v,
          ),
        ) as Record<string, string>,
      },
      { actor, source: "catalog-service" },
    );

    return updated;
  }

  async updateVariant(
    productId: string,
    sku: string,
    data: any,
    actor?: ActorInfo,
  ): Promise<Product> {
    logger.info("ProductService: updating variant", { productId, sku });

    const product = await this.productRepository.findById(productId);
    if (!product) throw new NotFoundError("Product not found");

    const index = product.variants.findIndex((v) => v.sku === sku);
    if (index === -1) throw new NotFoundError("Variant not found");

    product.variants[index] = { ...product.variants[index], ...data };
    const updated = await this.productRepository.update(productId, { variants: product.variants });

    await EventBus.publish(
      CATALOG_EVENTS.VARIANT_UPDATED,
      {
        productId,
        variantSku: sku,
        changedFields: Object.keys(data),
      },
      { actor, source: "catalog-service" },
    );

    return updated;
  }

  async removeVariant(productId: string, sku: string, actor?: ActorInfo): Promise<Product> {
    logger.info("ProductService: removing variant", { productId, sku });

    const product = await this.productRepository.findById(productId);
    if (!product) throw new NotFoundError("Product not found");

    product.variants = product.variants.filter((v) => v.sku !== sku);
    const updated = await this.productRepository.update(productId, { variants: product.variants });

    await EventBus.publish(
      CATALOG_EVENTS.PRODUCT_UPDATED,
      {
        productId,
        sku: product.sku,
        changedFields: ["variants"],
        updatedAt: new Date().toISOString(),
      },
      { actor, source: "catalog-service" },
    );

    return updated;
  }

  async addMedia(productId: string, media: any, actor?: ActorInfo): Promise<Product> {
    logger.info("ProductService: adding media", { productId });

    const product = await this.productRepository.findById(productId);
    if (!product) throw new NotFoundError("Product not found");

    if (media.isFeatured) {
      product.media = product.media.map((m) => ({ ...m, isFeatured: false }));
    }

    product.media.push(media);
    const updated = await this.productRepository.update(productId, { media: product.media });

    await EventBus.publish(
      CATALOG_EVENTS.MEDIA_UPDATED,
      {
        productId,
        mediaCount: updated.media.length,
      },
      { actor, source: "catalog-service" },
    );

    return updated;
  }

  async removeMedia(productId: string, mediaUrl: string, actor?: ActorInfo): Promise<Product> {
    logger.info("ProductService: removing media", { productId });

    const product = await this.productRepository.findById(productId);
    if (!product) throw new NotFoundError("Product not found");

    product.media = product.media.filter((m) => m.url !== mediaUrl);
    const updated = await this.productRepository.update(productId, { media: product.media });

    await EventBus.publish(
      CATALOG_EVENTS.MEDIA_UPDATED,
      {
        productId,
        mediaCount: updated.media.length,
      },
      { actor, source: "catalog-service" },
    );

    return updated;
  }

  async setFeaturedMedia(productId: string, mediaUrl: string, actor?: ActorInfo): Promise<Product> {
    logger.info("ProductService: setting featured media", { productId, mediaUrl });

    const product = await this.productRepository.findById(productId);
    if (!product) throw new NotFoundError("Product not found");

    const mediaExists = product.media.some((m) => m.url === mediaUrl);
    if (!mediaExists) throw new ValidationError("Media not found on this product");

    product.media = product.media.map((m) => ({
      ...m,
      isFeatured: m.url === mediaUrl,
    }));
    const updated = await this.productRepository.update(productId, { media: product.media });

    await EventBus.publish(
      CATALOG_EVENTS.MEDIA_UPDATED,
      {
        productId,
        mediaCount: updated.media.length,
      },
      { actor, source: "catalog-service" },
    );

    return updated;
  }

  async updateSEO(id: string, seo: any, actor?: ActorInfo): Promise<Product> {
    logger.info("ProductService: updating SEO", { id, actor: actor?.id });

    const existing = await this.productRepository.findById(id);
    if (!existing) throw new NotFoundError("Product not found");

    const updated = await this.productRepository.update(id, {
      seo: { ...existing.seo, ...seo },
    });

    await EventBus.publish(
      CATALOG_EVENTS.SEO_UPDATED,
      {
        productId: id,
        changedFields: Object.keys(seo),
      },
      { actor, source: "catalog-service" },
    );

    return updated;
  }

  async changeVisibility(
    id: string,
    visibility: Product["visibility"],
    actor?: ActorInfo,
  ): Promise<Product> {
    logger.info("ProductService: changing visibility", { id, visibility, actor: actor?.id });

    const existing = await this.productRepository.findById(id);
    if (!existing) throw new NotFoundError("Product not found");

    const oldVisibility = existing.visibility;
    const updated = await this.productRepository.update(id, { visibility });

    await EventBus.publish(
      CATALOG_EVENTS.VISIBILITY_CHANGED,
      {
        productId: id,
        oldVisibility,
        newVisibility: visibility,
      },
      { actor, source: "catalog-service" },
    );

    return updated;
  }

  async list(
    filter: Record<string, unknown> = {},
    pagination: CursorPaginationParams = { limit: 20 },
  ): Promise<PaginatedCatalogResult<Product>> {
    return this.productRepository.findWithCursor(pagination, filter);
  }

  async countByStatus(status: string): Promise<number> {
    return this.productRepository.countByStatus(status);
  }
}

export default ProductService;
