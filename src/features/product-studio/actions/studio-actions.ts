"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { ProductService } from "@/features/catalog/services/product-service";
import type { ProductWriteHints } from "@/features/catalog/services/product-service";
import type { CreateProductInput, UpdateProductInput } from "@/features/catalog/types/validation";
import type { Product } from "@/features/catalog/domain/product-entity";
import { PricingService } from "@/features/pricing/services/pricing-service";
import { PricingEngineService } from "@/features/pricing/services/pricing-engine-service";
import type { ProductPricing } from "@/features/pricing/domain/pricing-entity";
import { InventoryService } from "@/features/inventory/services/inventory-service";
import type { ProductInventory } from "@/features/inventory/domain/inventory-entity";
import type { CreateInventoryInput } from "@/features/inventory/types/validation";
import { createStudioProductSchema, updateStudioProductSchema } from "../types/validation";
import { checkPermission, type Session } from "@/lib/check-permission";
import { UnauthorizedError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";
import type { CreateStudioProductInput, UpdateStudioProductInput } from "../types/validation";
import { EventBus } from "@/lib/event-bus";
import { runImportPipeline } from "../utils/url-importer/import-pipeline";
import type { ImportResult } from "../utils/url-importer/types";

/** Catalog-domain payload projected from the studio form. All keys are optional: the edit
 * path sends a partial patch and the mapper drops keys the studio did not supply. */
type CatalogWritePayload = Partial<CreateProductInput & UpdateProductInput & ProductWriteHints>;

function getActor(session: Session): { id: string; name?: string; role?: string } {
  const user = session?.user;
  if (!user?.id) throw new UnauthorizedError("Session expired or invalid");
  return { id: user.id, name: user.name ?? undefined, role: user.role };
}

/** Converts a major-unit (BDT) amount into the integer minor units the pricing domain stores. */
function toCents(amount: number | undefined | null): number {
  if (!amount || !Number.isFinite(amount) || amount <= 0) return 0;
  return Math.round(amount * 100);
}

export async function saveStudioProductAction(
  formData: unknown,
  existingId?: string,
): Promise<{ success: boolean; data?: { id: string }; error?: string; warnings?: string[] }> {
  try {
    const session = await auth();
    const actor = getActor(session);

    if (existingId) {
      checkPermission(session, "Product.Update");
    } else {
      checkPermission(session, "Product.Create");
    }

    const validated = existingId
      ? updateStudioProductSchema.parse(formData)
      : createStudioProductSchema.parse(formData);

    const productService = new ProductService();
    let productId = existingId;
    const warnings: string[] = [];

    /* Step 1: Create or update catalog product */
    const catalogPayload = mapStudioToCatalog(validated);
    if (existingId) {
      await productService.update(existingId, catalogPayload, actor);
    } else {
      const product = await productService.create(
        catalogPayload as Parameters<ProductService["create"]>[0],
        actor,
      );
      productId = product.id;
    }

    /**
     * The pricing/inventory records are keyed by (productId, variantSku). Both must be
     * upserted: on the edit path a record already exists, and the previous
     * create-only implementation threw "already exists" and swallowed the error,
     * so price and stock edits silently never persisted.
     */
    // Keyed on the product SKU, matching the record ProductService.create seeds. Using the
    // first variant's SKU here produced a second, orphaned pricing row on every create.
    const variantSku = validated.sku || undefined;

    /* Step 2: Upsert pricing */
    const pricingData = validated.pricing;
    if (pricingData && productId && (pricingData.sellingPrice || pricingData.costPrice)) {
      try {
        const pricingService = new PricingService();
        const manualOverrides = pricingData.manualPriceOverrides ?? {};
        const costCents = toCents(pricingData.costPrice);

        // Tier prices the admin did not explicitly override are derived from cost.
        const sellingCents =
          manualOverrides.sellingPrice || !costCents
            ? toCents(pricingData.sellingPrice)
            : Math.round(costCents * 1.3);
        const wholesaleCents =
          manualOverrides.wholesalePrice || !costCents
            ? toCents(pricingData.wholesalePrice)
            : Math.round(costCents * 1.12);
        const resellerCents =
          manualOverrides.resellerPrice || !costCents
            ? toCents(pricingData.resellerPrice)
            : Math.round(costCents * 1.2);

        const existingPricing = await pricingService.getPricingByProduct(productId, variantSku);

        if (existingPricing) {
          await pricingService.updatePricing(
            existingPricing.id,
            {
              baseCostPrice: costCents,
              sellingPrice: sellingCents,
              wholesalePrice: wholesaleCents,
              resellerPrice: resellerCents,
              comparePrice: toCents(pricingData.comparePrice),
            },
            actor.id,
          );
        } else {
          await pricingService.createPricing(
            {
              productId,
              variantSku,
              baseCostPrice: costCents,
              purchasePrice: 0,
              supplierPrice: 0,
              sellingPrice: sellingCents,
              wholesalePrice: wholesaleCents,
              resellerPrice: resellerCents,
              comparePrice: toCents(pricingData.comparePrice),
              discountAmount: 0,
              discountPercentage: 0,
              taxRate: 0,
              taxInclusive: false,
              commissionRate: 0,
              currency: "BDT",
              pricingRule: "fixed" as const,
              status: "active" as const,
            },
            actor.id,
          );
        }
      } catch (err) {
        logger.error("StudioAction: pricing persistence failed", err);
        warnings.push("Product saved, but pricing could not be updated.");
      }
    }

    /* Step 3: Upsert inventory */
    const inventoryData = validated.inventory;
    if (inventoryData && productId) {
      try {
        const inventoryService = new InventoryService();
        const existingInventory = await inventoryService.getInventoryByProduct(
          productId,
          variantSku,
        );
        const lowStockThreshold = inventoryData.lowStockThreshold ?? 5;

        if (existingInventory) {
          await inventoryService.updateInventory(
            existingInventory.id,
            {
              availableStock: inventoryData.stock,
              reservedStock: inventoryData.reservedStock,
              incomingStock: inventoryData.incomingStock,
              reorderLevel: lowStockThreshold,
              lowStockThreshold,
            },
            actor.id,
          );
        } else if (inventoryData.stock > 0 || inventoryData.incomingStock > 0) {
          const inventoryPayload: CreateInventoryInput = {
            productId,
            variantSku,
            availableStock: inventoryData.stock,
            reservedStock: inventoryData.reservedStock,
            incomingStock: inventoryData.incomingStock,
            damagedStock: 0,
            returnedStock: 0,
            soldStock: 0,
            virtualStock: 0,
            safetyStock: 0,
            reorderLevel: lowStockThreshold,
            lowStockThreshold,
            allowPreOrder: false,
            allowBackorder: false,
            status: "active",
          };
          await inventoryService.createInventory(inventoryPayload, actor.id);
        }
      } catch (err) {
        logger.error("StudioAction: inventory persistence failed", err);
        warnings.push("Product saved, but stock could not be updated.");
      }
    }

    /* Step 4: Publish event */
    if (!existingId && productId) {
      await EventBus.publish(
        "product.created",
        {
          productId,
          productName: validated.name,
          actorId: actor.id,
        },
        {
          actor,
          source: "product-studio",
        },
      );
    }

    revalidatePath("/dashboard/products");
    if (productId) {
      revalidatePath(`/dashboard/products/${productId}`);
      revalidatePath(`/dashboard/products/${productId}/edit`);
    }

    if (!productId) {
      return { success: false, error: "Product was saved but no identifier was returned" };
    }

    return {
      success: true,
      data: { id: productId },
      ...(warnings.length > 0 ? { warnings } : {}),
    };
  } catch (error: unknown) {
    logger.error("saveStudioProductAction failed", error);
    return { success: false, error: toActionError(error, "Failed to save product") };
  }
}

/** Normalizes thrown errors (including Zod issues) into a single admin-readable message. */
function toActionError(error: unknown, fallback: string): string {
  if (error instanceof z.ZodError) {
    const issue = error.issues[0];
    if (issue) {
      const path = issue.path.join(".");
      return path ? `${path}: ${issue.message}` : issue.message;
    }
  }
  return error instanceof Error ? error.message : fallback;
}

export interface StudioProductData {
  product: Product | null;
  pricing: ProductPricing | null;
  inventory: ProductInventory | null;
}

export async function getStudioProductAction(id: string): Promise<{
  success: boolean;
  data?: StudioProductData;
  error?: string;
}> {
  try {
    const session = await auth();
    getActor(session);
    checkPermission(session, "Product.View");

    const productService = new ProductService();
    const product = await productService.findById(id);
    if (!product) {
      return { success: false, error: "Product not found" };
    }

    const variantSku = product.variants?.[0]?.sku || product.sku;
    const [pricing, inventory] = await Promise.all([
      new PricingService()
        .getPricingByProduct(id, variantSku)
        .catch(() => null)
        .then((p) => p ?? new PricingService().getPricingByProduct(id).catch(() => null)),
      new InventoryService()
        .getInventoryByProduct(id, variantSku)
        .catch(() => null)
        .then((i) => i ?? new InventoryService().getInventoryByProduct(id).catch(() => null)),
    ]);

    return { success: true, data: { product, pricing, inventory } };
  } catch (error: unknown) {
    logger.error("getStudioProductAction failed", error, { id });
    return { success: false, error: toActionError(error, "Failed to load product") };
  }
}

export interface ProductDetailView extends StudioProductData {
  categoryName: string;
  brandName: string;
}

/**
 * Read model for the admin product detail page, which needs resolved taxonomy names,
 * pricing and stock — it previously rendered raw `categoryId`/`brandId` ObjectIds and had
 * no access to price or stock at all.
 */
export async function getProductDetailAction(id: string): Promise<{
  success: boolean;
  data?: ProductDetailView;
  error?: string;
}> {
  try {
    const base = await getStudioProductAction(id);
    if (!base.success || !base.data?.product) {
      return { success: false, error: base.error ?? "Product not found" };
    }

    const { product } = base.data;
    const { BrandRepository, CategoryRepository } =
      await import("@/features/catalog/repositories/classification-repository");

    const [category, brand] = await Promise.all([
      product.categoryId
        ? new CategoryRepository().findById(product.categoryId).catch(() => null)
        : Promise.resolve(null),
      product.brandId
        ? new BrandRepository().findById(product.brandId).catch(() => null)
        : Promise.resolve(null),
    ]);

    return {
      success: true,
      data: {
        ...base.data,
        categoryName: category?.name ?? "",
        brandName: brand?.name ?? "",
      },
    };
  } catch (error: unknown) {
    logger.error("getProductDetailAction failed", error, { id });
    return { success: false, error: toActionError(error, "Failed to load product") };
  }
}

export async function publishStudioProductAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Publish");
    const actor = getActor(session);

    await new ProductService().publish(id, actor);

    revalidatePath("/dashboard/products");
    revalidatePath(`/dashboard/products/${id}`);
    return { success: true };
  } catch (error: unknown) {
    logger.error("publishStudioProductAction failed", error, { id });
    return { success: false, error: toActionError(error, "Failed to publish product") };
  }
}

export async function archiveStudioProductAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Archive");
    const actor = getActor(session);

    await new ProductService().archive(id, "Archived from Product Studio", actor);

    revalidatePath("/dashboard/products");
    revalidatePath(`/dashboard/products/${id}`);
    return { success: true };
  } catch (error: unknown) {
    logger.error("archiveStudioProductAction failed", error, { id });
    return { success: false, error: toActionError(error, "Failed to archive product") };
  }
}

export async function deleteStudioProductAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Delete");
    const actor = getActor(session);

    await new ProductService().delete(id, actor);

    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error: unknown) {
    logger.error("deleteStudioProductAction failed", error, { id });
    return { success: false, error: toActionError(error, "Failed to delete product") };
  }
}

export async function getBrandsAction(): Promise<{
  success: boolean;
  data?: Array<{ id: string; name: string }>;
  error?: string;
}> {
  try {
    const session = await auth();
    getActor(session);

    const { BrandRepository } =
      await import("@/features/catalog/repositories/classification-repository");
    const brands = await new BrandRepository().find({});
    return { success: true, data: brands.map((b) => ({ id: b.id, name: b.name })) };
  } catch (error: unknown) {
    logger.error("getBrandsAction failed", error);
    return { success: false, error: toActionError(error, "Failed to load brands") };
  }
}

export async function getCategoriesAction(): Promise<{
  success: boolean;
  data?: Array<{ id: string; name: string }>;
  error?: string;
}> {
  try {
    const session = await auth();
    getActor(session);

    const { CategoryRepository } =
      await import("@/features/catalog/repositories/classification-repository");
    const categories = await new CategoryRepository().find({});
    return { success: true, data: categories.map((c) => ({ id: c.id, name: c.name })) };
  } catch (error: unknown) {
    logger.error("getCategoriesAction failed", error);
    return { success: false, error: toActionError(error, "Failed to load categories") };
  }
}

export async function autoCalculateStudioPricingAction(input: {
  costPrice: number;
  categoryId?: string;
  brandId?: string;
  supplierId?: string;
  profileId?: string;
}): Promise<{
  success: boolean;
  data?: {
    retailPrice: number;
    wholesalePrice: number;
    resellerPrice: number;
    distributorPrice: number;
    profit: number;
    margin: number;
  };
  error?: string;
}> {
  const session = await auth();
  getActor(session);

  try {
    const engine = new PricingEngineService();
    const result = await engine.simulatePrice({
      costPrice: Math.round(input.costPrice * 100),
      quantity: 1,
      role: "customer",
      categoryId: input.categoryId,
      brandId: input.brandId,
      supplierId: input.supplierId,
      profileId: input.profileId,
    });
    return {
      success: true,
      data: {
        retailPrice: result.retailPrice,
        wholesalePrice: result.wholesalePrice,
        resellerPrice: result.resellerPrice,
        distributorPrice: result.distributorPrice,
        profit: result.profit,
        margin: result.margin,
      },
    };
  } catch (err) {
    logger.error("StudioAction: auto-pricing failed", err);
    return { success: false, error: "Auto-pricing computation failed" };
  }
}

const importUrlSchema = z.object({
  url: z.string().url("Invalid URL format").min(1, "URL is required"),
});

export async function importFromUrlAction(rawUrl: string): Promise<{
  success: boolean;
  data?: ImportResult;
  error?: string;
}> {
  try {
    const session = await auth();
    getActor(session);
    checkPermission(session, "Product.Create");

    const { url } = importUrlSchema.parse({ url: rawUrl });

    const result = await runImportPipeline(url);

    return { success: true, data: result };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Invalid URL" };
    }
    const message = error instanceof Error ? error.message : "Failed to import from URL";
    logger.error("importFromUrlAction failed", error);
    return { success: false, error: message };
  }
}

/**
 * Projects the studio form onto the catalog domain payload.
 *
 * Only keys the studio actually supplied are emitted — on the edit path the schema is
 * `.partial()`, and emitting `undefined` for an absent key used to overwrite stored
 * values (tags, media and content sub-fields were being wiped on every save).
 */
function mapStudioToCatalog(
  input: CreateStudioProductInput | UpdateStudioProductInput,
): CatalogWritePayload {
  const p = input.pricing;

  const payload: Record<string, unknown> = {
    productType: input.productType,
    name: input.name,
    sku: input.sku,
    slug: input.seo?.slug || undefined,
    shortDescription: input.shortDescription || undefined,
    description: input.description || input.richDescription || input.shortDescription || undefined,
    notice: input.notice || undefined,
    badges: input.badges,
    specifications: input.specifications,
    productModel: input.productModel || undefined,
    barcode: input.barcode || undefined,
    brandId: input.brandId || undefined,
    categoryId: input.categoryId || undefined,
    supplierId: input.supplierId || undefined,
    visibility: input.visibility,
    status: input.status,
    featured: input.featured,
    trending: input.trending,
    flashSale: input.flashSale,
    newArrival: input.newArrival,
    tags: input.tags,
    // Consumed by ProductAutomationEngine for tier derivation; not persisted on the product doc.
    costPrice: p?.costPrice || undefined,
    sellingPrice: p?.sellingPrice || undefined,
    wholesalePrice: p?.wholesalePrice || undefined,
    resellerPrice: p?.resellerPrice || undefined,
    comparePrice: p?.comparePrice || undefined,
    metaTitle: input.seo?.metaTitle || input.name || undefined,
    metaDescription: input.seo?.metaDescription || input.shortDescription || undefined,
    variants: input.variants?.map((v) => ({
      id: v.id,
      name: v.name || [v.color, v.size, v.storage].filter(Boolean).join(" / "),
      attributes: v.attributes,
      sku: v.sku,
      priceAdjustment: v.priceAdjustment ?? 0,
      stock: v.stock ?? 0,
      image: v.image || undefined,
      status: v.status || "active",
      isActive: v.isActive ?? true,
      color: v.color || undefined,
      size: v.size || undefined,
      storage: v.storage || undefined,
      ram: v.ram || undefined,
      capacity: v.capacity || undefined,
      material: v.material || undefined,
      weight: v.weight,
    })),
    media: input.media?.map((m, index) => ({
      url: m.url,
      type: m.type || "image",
      isFeatured: m.isFeatured || false,
      altText: m.altText || undefined,
      sortOrder: index,
    })),
    seo: input.seo
      ? {
          metaTitle: input.seo.metaTitle || undefined,
          metaDescription: input.seo.metaDescription || undefined,
          metaKeywords: input.seo.metaKeywords || undefined,
          ogImage: input.seo.ogImage || undefined,
        }
      : undefined,
    content: buildContentPatch(input),
  };

  for (const key of Object.keys(payload)) {
    if (payload[key] === undefined) delete payload[key];
  }

  return payload as CatalogWritePayload;
}

/** Builds the `content` sub-document, omitting it entirely when the studio sent nothing for it. */
function buildContentPatch(
  input: CreateStudioProductInput | UpdateStudioProductInput,
): Record<string, unknown> | undefined {
  const content: Record<string, unknown> = {};
  if (input.richDescription) content.richDescription = { html: input.richDescription };
  if (input.warranty) content.warrantyInformation = input.warranty;
  if (input.returnPolicy) content.returnPolicy = input.returnPolicy;
  if (input.specifications) content.specifications = input.specifications;
  return Object.keys(content).length > 0 ? content : undefined;
}
