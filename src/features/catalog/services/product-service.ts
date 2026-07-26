import {
  ProductRepository,
  CursorPaginationParams,
  PaginatedCatalogResult,
} from "../repositories/product-repository";
import { BrandRepository } from "../repositories/classification-repository";
import { CategoryRepository } from "../repositories/classification-repository";
import type { Product, ProductMedia, ProductSEO, ProductVariant } from "../domain/product-entity";
import { ValidationError, NotFoundError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";
import { EventBus } from "@/lib/event-bus";
import { CATALOG_EVENTS } from "../domain/catalog-events";
import { generateSlug } from "@/lib/utils/slug-utils";
import type { ActorInfo } from "@/lib/core/types";
import type { CreateProductInput, UpdateProductInput } from "../types/validation";
import { ProductVersionService } from "./product-version-service";
import { ProductAuditService } from "./product-audit-service";
import { PricingService } from "@/features/pricing/services/pricing-service";
import { ProductAutomationEngine } from "./product-automation-engine";

/**
 * Transient pricing/stock hints that ride along with a product payload. They are consumed
 * by the automation engine and the pricing record, and are not persisted on the product
 * document itself (the Product schema has no such fields).
 */
export interface ProductWriteHints {
  costPrice?: number;
  sellingPrice?: number;
  wholesalePrice?: number;
  resellerPrice?: number;
  comparePrice?: number;
  stock?: number;
}

type CreateProductPayload = CreateProductInput & ProductWriteHints;
type UpdateProductPayload = UpdateProductInput & ProductWriteHints;

/** Converts a major-unit (BDT) amount into the integer minor units the pricing domain stores. */
function toMinorUnits(amount?: number | null): number {
  if (!amount || !Number.isFinite(amount) || amount <= 0) return 0;
  return Math.round(amount * 100);
}

/** Drops keys whose value is `undefined` so a merge never blanks an existing field. */
function stripUndefined<T extends object>(source: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(source).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

export class ProductService {
  private readonly productRepository: ProductRepository;
  private readonly brandRepository: BrandRepository;
  private readonly categoryRepository: CategoryRepository;
  private readonly versionService: ProductVersionService;
  private readonly auditService: ProductAuditService;
  private readonly pricingService: PricingService;
  private readonly automationEngine: ProductAutomationEngine;

  constructor() {
    this.productRepository = new ProductRepository();
    this.brandRepository = new BrandRepository();
    this.categoryRepository = new CategoryRepository();
    this.versionService = new ProductVersionService();
    this.auditService = new ProductAuditService();
    this.pricingService = new PricingService();
    this.automationEngine = new ProductAutomationEngine(
      this.productRepository,
      this.categoryRepository,
    );
  }

  async create(data: CreateProductPayload, actor?: ActorInfo): Promise<Product> {
    logger.info("ProductService: creating product", { name: data.name, actor: actor?.id });

    // ── Validate brand/category references ──
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

    // ── Automation engine: generates slug, SKU, SEO, pricing, badges ──
    const enriched = await this.automationEngine.generate({
      name: data.name,
      shortDescription: data.shortDescription,
      description: data.description,
      categoryId: data.categoryId,
      sku: data.sku,
      slug: data.slug,
      metaTitle: data.metaTitle || data.seo?.metaTitle,
      metaDescription: data.metaDescription || data.seo?.metaDescription,
      tags: data.tags,
      costPrice: data.costPrice ?? null,
      stock: data.stock ?? null,
      badges: data.badges,
    });

    // ── SKU collision guard (user-provided SKU) ──
    if (data.sku) {
      const dup = await this.productRepository.findBySku(enriched.finalSku);
      if (dup) {
        throw new ValidationError("SKU already exists", {
          sku: ["A product with this SKU is already registered"],
        });
      }
    }

    // ── Barcode uniqueness ──
    if (data.barcode) {
      const dup = await this.productRepository.findOne({ barcode: data.barcode });
      if (dup) {
        throw new ValidationError("Barcode already exists", {
          barcode: ["A product with this barcode is already registered"],
        });
      }
    }

    // ── Legacy badge consolidation ──
    const badges = [...enriched.finalBadges];
    if (data.featured && !badges.includes("featured")) badges.push("featured");
    if (data.trending && !badges.includes("trending")) badges.push("trending");
    if (data.flashSale && !badges.includes("flash_sale")) badges.push("flash_sale");
    if (data.newArrival && !badges.includes("new_arrival")) badges.push("new_arrival");

    // ── Build final document ──
    const product = await this.productRepository.create({
      ...data,
      sku: enriched.finalSku,
      slug: enriched.finalSlug,
      badges,
      metaTitle: enriched.finalMetaTitle,
      metaDescription: enriched.finalMetaDescription,
      tags: enriched.finalTags,
      status: data.status || "draft",
      visibility: data.visibility || "public",
    });

    // ── Auto-create pricing record ──
    if (enriched.finalPricing.sellingPrice && enriched.finalPricing.sellingPrice > 0) {
      try {
        const costCents = toMinorUnits(data.costPrice);
        await this.pricingService.createPricing(
          {
            productId: product.id,
            variantSku: product.sku,
            baseCostPrice: costCents,
            purchasePrice: 0,
            supplierPrice: 0,
            sellingPrice: Math.round(enriched.finalPricing.sellingPrice * 100),
            wholesalePrice: enriched.finalPricing.wholesalePrice
              ? Math.round(enriched.finalPricing.wholesalePrice * 100)
              : Math.round(enriched.finalPricing.sellingPrice * 100 * 0.9),
            resellerPrice: enriched.finalPricing.resellerPrice
              ? Math.round(enriched.finalPricing.resellerPrice * 100)
              : Math.round(enriched.finalPricing.sellingPrice * 100 * 0.85),
            comparePrice: toMinorUnits(data.comparePrice),
            discountAmount: 0,
            discountPercentage: 0,
            taxRate: 0,
            taxInclusive: false,
            commissionRate: 0,
            currency: "BDT",
            pricingRule: "fixed" as const,
            status: "active" as const,
          },
          actor?.id,
        );
      } catch (err) {
        logger.error("ProductService: auto-pricing record creation failed", {
          productId: product.id,
          error: err instanceof Error ? err.message : "unknown",
        });
      }
    }

    // ── Events ──
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

    await this.auditService.record({
      productId: product.id,
      action: "created",
      editorId: actor?.id,
      editorName: actor?.name,
      changedFields: Object.keys(data),
      summary: `Product ${product.name} created`,
    });
    await this.versionService.createVersion(
      product.id,
      Object.keys(data),
      actor?.id,
      actor?.name,
      "Initial version",
    );

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

  async update(id: string, data: UpdateProductPayload, actor?: ActorInfo): Promise<Product> {
    logger.info("ProductService: updating product", { id, actor: actor?.id });

    const existing = await this.productRepository.findById(id);
    if (!existing) throw new NotFoundError("Product not found");

    // ── Slug regeneration on name change ──
    let slug = existing.slug;
    if (data.name && data.name.trim().toLowerCase() !== existing.name.trim().toLowerCase()) {
      slug = data.slug
        ? data.slug.toLowerCase().trim()
        : await this.automationEngine.generateUniqueSlug(data.name);
    } else if (data.slug && data.slug !== existing.slug) {
      slug = data.slug.toLowerCase().trim();
    }

    // ── SKU collision guard ──
    if (data.sku && data.sku.toUpperCase().trim() !== existing.sku.toUpperCase().trim()) {
      const dup = await this.productRepository.findBySku(data.sku);
      if (dup) throw new ValidationError("SKU already exists", { sku: ["SKU is already in use"] });
    }

    // ── Barcode uniqueness ──
    if (data.barcode && data.barcode !== existing.barcode) {
      const dup = await this.productRepository.findOne({
        barcode: data.barcode,
        _id: { $ne: id },
      });
      if (dup)
        throw new ValidationError("Barcode already exists", {
          barcode: ["Barcode is already in use"],
        });
    }

    // ── Dynamic badges ──
    const inputBadges = Array.isArray(data.badges) ? data.badges : [...(existing.badges || [])];
    const inputStock = data.stock ?? null;
    const badges = this.automationEngine.assignDynamicBadges(
      new Date(),
      existing.createdAt,
      inputStock,
      inputBadges,
    );
    // Legacy flags still respected
    if (data.featured !== undefined) {
      if (data.featured && !badges.includes("featured")) badges.push("featured");
      else if (!data.featured && badges.includes("featured")) {
        const idx = badges.indexOf("featured");
        if (idx !== -1) badges.splice(idx, 1);
      }
    }

    // ── Auto-SEO on update (only fill empty fields) ──
    const metaTitle = data.metaTitle || data.seo?.metaTitle || existing.metaTitle || existing.name;
    const metaDescription =
      data.metaDescription ||
      data.seo?.metaDescription ||
      existing.metaDescription ||
      existing.shortDescription ||
      "";

    // ── Persist ──
    // `seo` and `content` are whole sub-documents: `$set` replaces them outright, so a
    // partial patch (e.g. SEO-only save) would drop unrelated stored keys. Merge first.
    const mergedSeo = data.seo ? { ...existing.seo, ...stripUndefined(data.seo) } : undefined;
    const mergedContent = data.content
      ? { ...existing.content, ...stripUndefined(data.content) }
      : undefined;

    const updated = await this.productRepository.update(id, {
      ...data,
      slug,
      badges,
      metaTitle,
      metaDescription,
      ...(mergedSeo ? { seo: mergedSeo } : {}),
      ...(mergedContent ? { content: mergedContent } : {}),
    });

    const changedFields = Object.keys(data);

    // ── Auto-pricing on costPrice change ──
    if (data.costPrice && data.costPrice > 0) {
      try {
        const pricing = await this.pricingService.getPricingByProduct(id);
        if (pricing) {
          await this.pricingService.updatePricing(
            pricing.id,
            {
              baseCostPrice: toMinorUnits(data.costPrice),
              sellingPrice: data.sellingPrice ? toMinorUnits(data.sellingPrice) : undefined,
              wholesalePrice: data.wholesalePrice ? toMinorUnits(data.wholesalePrice) : undefined,
              resellerPrice: data.resellerPrice ? toMinorUnits(data.resellerPrice) : undefined,
            },
            actor?.id,
          );
        }
      } catch (err) {
        logger.warn("ProductService: pricing update on cost change failed", {
          productId: id,
          error: err instanceof Error ? err.message : "unknown",
        });
      }
    }

    // ── Events ──
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

    // ── Audit & Versioning ──
    await this.auditService.record({
      productId: updated.id,
      action: "updated",
      editorId: actor?.id,
      editorName: actor?.name,
      changedFields,
      oldValues: Object.fromEntries(
        changedFields.map((k) => [k, (existing as unknown as Record<string, unknown>)[k]]),
      ),
      newValues: Object.fromEntries(
        changedFields.map((k) => [k, (data as unknown as Record<string, unknown>)[k]]),
      ),
      summary: `Product ${updated.name} updated`,
    });
    await this.versionService.createVersion(updated.id, changedFields, actor?.id, actor?.name);

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

    await this.auditService.record({
      productId: id,
      action: "deleted",
      editorId: actor?.id,
      editorName: actor?.name,
      changedFields: ["status", "isDeleted"],
      summary: `Product ${existing.name} deleted`,
    });

    return result;
  }

  async publish(id: string, actor?: ActorInfo): Promise<Product> {
    logger.info("ProductService: publishing product", { id, actor: actor?.id });

    const existing = await this.productRepository.findById(id);
    if (!existing) throw new NotFoundError("Product not found");

    if (existing.status === "archived")
      throw new ValidationError("Cannot publish an archived product");

    if (existing.status === "active") return existing;

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

    await this.auditService.record({
      productId: updated.id,
      action: "published",
      editorId: actor?.id,
      editorName: actor?.name,
      changedFields: ["status"],
      summary: `Product ${updated.name} published`,
    });
    await this.versionService.createVersion(
      updated.id,
      ["status"],
      actor?.id,
      actor?.name,
      "Published",
    );

    return updated;
  }

  async archive(id: string, reason?: string, actor?: ActorInfo): Promise<Product> {
    logger.info("ProductService: archiving product", { id, reason, actor: actor?.id });

    const existing = await this.productRepository.findById(id);
    if (!existing) throw new NotFoundError("Product not found");
    // Idempotent, mirroring `publish`: re-archiving is a no-op, not an error. Bulk
    // archive previously counted already-archived products as failures.
    if (existing.status === "archived") return existing;

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

    await this.auditService.record({
      productId: updated.id,
      action: "archived",
      editorId: actor?.id,
      editorName: actor?.name,
      changedFields: ["status"],
      summary: reason
        ? `Product ${updated.name} archived: ${reason}`
        : `Product ${updated.name} archived`,
    });
    await this.versionService.createVersion(
      updated.id,
      ["status"],
      actor?.id,
      actor?.name,
      reason || "Archived",
    );

    return updated;
  }

  /**
   * Restores an archived or soft-deleted product back to `draft`.
   * Restoring to `draft` (never straight to `active`) keeps an unpublish→republish
   * decision explicit rather than silently returning stale listings to the storefront.
   */
  async restore(id: string, actor?: ActorInfo): Promise<Product> {
    logger.info("ProductService: restoring product", { id, actor: actor?.id });

    const existing = await this.productRepository.findById(id, { showDeleted: true });
    if (!existing) throw new NotFoundError("Product not found");

    const updated = await this.productRepository.update(
      id,
      { status: "draft" as const, isDeleted: false, deletedAt: undefined },
      { showDeleted: true },
    );

    await EventBus.publish(
      CATALOG_EVENTS.PRODUCT_UPDATED,
      {
        productId: updated.id,
        sku: updated.sku,
        changedFields: ["status", "isDeleted"],
        updatedAt: new Date().toISOString(),
      },
      { actor, source: "catalog-service" },
    );

    await this.auditService.record({
      productId: updated.id,
      action: "restored",
      editorId: actor?.id,
      editorName: actor?.name,
      changedFields: ["status", "isDeleted"],
      oldValues: { status: existing.status, isDeleted: existing.isDeleted },
      newValues: { status: "draft", isDeleted: false },
      summary: `Product ${updated.name} restored`,
    });
    await this.versionService.createVersion(
      updated.id,
      ["status", "isDeleted"],
      actor?.id,
      actor?.name,
      "Restored",
    );

    return updated;
  }

  async duplicate(id: string, actor?: ActorInfo): Promise<Product> {
    logger.info("ProductService: duplicating product", { id, actor: actor?.id });

    const existing = await this.productRepository.findById(id);
    if (!existing) throw new NotFoundError("Product not found");

    const salt = Date.now().toString(36).slice(-5).toUpperCase();
    const newSku = `${existing.sku}-DUP-${salt}`;
    const name = `${existing.name} (Copy)`;

    const duplicated = await this.productRepository.create({
      name,
      // A copy must never collide with the source's URL or go live implicitly.
      slug: await this.automationEngine.generateUniqueSlug(name),
      sku: newSku,
      status: "draft" as const,
      barcode: existing.barcode ? `${existing.barcode}-DUP` : undefined,
      gtin: existing.gtin ? `${existing.gtin}-DUP` : undefined,
      shortDescription: existing.shortDescription,
      description: existing.description,
      notice: existing.notice,
      productModel: existing.productModel,
      brandId: existing.brandId,
      categoryId: existing.categoryId,
      supplierId: existing.supplierId,
      visibility: existing.visibility,
      badges: [...(existing.badges || [])],
      featured: false,
      trending: false,
      flashSale: false,
      newArrival: false,
      hasVariants: existing.hasVariants,
      // Index-salted so multiple variants copied within the same millisecond stay unique.
      variants: existing.variants.map((v, index) => ({
        ...v,
        id: undefined,
        sku: `${v.sku}-DUP-${salt}${index > 0 ? `-${index}` : ""}`,
      })),
      media: existing.media,
      specifications: existing.specifications,
      metaTitle: existing.metaTitle,
      metaDescription: existing.metaDescription,
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

    await this.auditService.record({
      productId: duplicated.id,
      action: "duplicated",
      editorId: actor?.id,
      editorName: actor?.name,
      changedFields: ["name", "sku", "slug"],
      summary: `Product duplicated from ${existing.name}`,
    });
    await this.versionService.createVersion(
      duplicated.id,
      ["name", "sku", "slug"],
      actor?.id,
      actor?.name,
      "Duplicated from original",
    );

    return duplicated;
  }

  async addVariant(
    productId: string,
    variant: ProductVariant,
    actor?: ActorInfo,
  ): Promise<Product> {
    logger.info("ProductService: adding variant", { productId, sku: variant.sku });

    const product = await this.productRepository.findById(productId);
    if (!product) throw new NotFoundError("Product not found");

    const existingVariant = product.variants.find((v) => v.sku === variant.sku);
    if (existingVariant) throw new ValidationError("Variant SKU already exists on this product");

    product.variants.push(variant);
    const updated = await this.productRepository.update(productId, {
      variants: product.variants,
      hasVariants: true,
    });

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

    await this.auditService.record({
      productId,
      action: "variant_added",
      editorId: actor?.id,
      editorName: actor?.name,
      changedFields: ["variants"],
      summary: `Variant ${variant.sku} added`,
    });
    await this.versionService.createVersion(
      productId,
      ["variants"],
      actor?.id,
      actor?.name,
      `Variant ${variant.sku} added`,
    );

    return updated;
  }

  async updateVariant(
    productId: string,
    sku: string,
    data: Partial<ProductVariant>,
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

    await this.auditService.record({
      productId,
      action: "variant_updated",
      editorId: actor?.id,
      editorName: actor?.name,
      changedFields: ["variants"],
      summary: `Variant ${sku} updated`,
    });
    await this.versionService.createVersion(
      productId,
      ["variants"],
      actor?.id,
      actor?.name,
      `Variant ${sku} updated`,
    );

    return updated;
  }

  async removeVariant(productId: string, sku: string, actor?: ActorInfo): Promise<Product> {
    logger.info("ProductService: removing variant", { productId, sku });

    const product = await this.productRepository.findById(productId);
    if (!product) throw new NotFoundError("Product not found");

    product.variants = product.variants.filter((v) => v.sku !== sku);
    const updated = await this.productRepository.update(productId, {
      variants: product.variants,
      hasVariants: product.variants.length > 0,
    });

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

    await this.auditService.record({
      productId,
      action: "variant_removed",
      editorId: actor?.id,
      editorName: actor?.name,
      changedFields: ["variants"],
      summary: `Variant ${sku} removed`,
    });
    await this.versionService.createVersion(
      productId,
      ["variants"],
      actor?.id,
      actor?.name,
      `Variant ${sku} removed`,
    );

    return updated;
  }

  async addMedia(productId: string, media: ProductMedia, actor?: ActorInfo): Promise<Product> {
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

    await this.auditService.record({
      productId,
      action: "media_added",
      editorId: actor?.id,
      editorName: actor?.name,
      changedFields: ["media"],
      summary: `Media ${media.url} added`,
    });
    await this.versionService.createVersion(
      productId,
      ["media"],
      actor?.id,
      actor?.name,
      `Media ${media.url} added`,
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

    await this.auditService.record({
      productId,
      action: "media_removed",
      editorId: actor?.id,
      editorName: actor?.name,
      changedFields: ["media"],
      summary: `Media removed`,
    });
    await this.versionService.createVersion(
      productId,
      ["media"],
      actor?.id,
      actor?.name,
      `Media removed`,
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

    await this.auditService.record({
      productId,
      action: "featured_media_set",
      editorId: actor?.id,
      editorName: actor?.name,
      changedFields: ["media"],
      summary: `Featured media set to ${mediaUrl}`,
    });
    await this.versionService.createVersion(
      productId,
      ["media"],
      actor?.id,
      actor?.name,
      `Featured media set`,
    );

    return updated;
  }

  async updateSEO(id: string, seo: ProductSEO, actor?: ActorInfo): Promise<Product> {
    logger.info("ProductService: updating SEO", { id, actor: actor?.id });

    const existing = await this.productRepository.findById(id);
    if (!existing) throw new NotFoundError("Product not found");

    const updated = await this.productRepository.update(id, {
      metaTitle: seo.metaTitle || existing.metaTitle,
      metaDescription: seo.metaDescription || existing.metaDescription,
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

    const seoChangedFields = Object.keys(seo);
    await this.auditService.record({
      productId: id,
      action: "seo_updated",
      editorId: actor?.id,
      editorName: actor?.name,
      changedFields: seoChangedFields,
      summary: `SEO updated for product ${updated.name}`,
    });
    await this.versionService.createVersion(id, ["seo"], actor?.id, actor?.name, "SEO updated");

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

    await this.auditService.record({
      productId: id,
      action: "visibility_changed",
      editorId: actor?.id,
      editorName: actor?.name,
      changedFields: ["visibility"],
      oldValues: { visibility: oldVisibility },
      newValues: { visibility },
      summary: `Visibility changed from ${oldVisibility} to ${visibility}`,
    });
    await this.versionService.createVersion(
      id,
      ["visibility"],
      actor?.id,
      actor?.name,
      `Visibility changed to ${visibility}`,
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
