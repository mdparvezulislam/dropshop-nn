"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { ProductService } from "@/features/catalog/services/product-service";
import { PricingService } from "@/features/pricing/services/pricing-service";
import { PricingEngineService } from "@/features/pricing/services/pricing-engine-service";
import { InventoryService } from "@/features/inventory/services/inventory-service";
import type { CreateInventoryInput } from "@/features/inventory/types/validation";
import { createStudioProductSchema, updateStudioProductSchema } from "../types/validation";
import { checkPermission } from "@/lib/check-permission";
import { UnauthorizedError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";
import type { CreateStudioProductInput, UpdateStudioProductInput } from "../types/validation";
import { EventBus } from "@/lib/event-bus";
import { runImportPipeline } from "../utils/url-importer/import-pipeline";
import type { ImportResult } from "../utils/url-importer/types";

function getActor(session: any): { id: string; name?: string; role?: string } {
  if (!session?.user) throw new UnauthorizedError("Session expired or invalid");
  return session.user;
}

export async function saveStudioProductAction(
  formData: unknown,
  existingId?: string,
): Promise<{ success: boolean; data?: { id: string }; error?: string }> {
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

    /* Step 1: Create or update catalog product */
    if (existingId) {
      const updatePayload = mapStudioToCatalog(validated as CreateStudioProductInput);
      await productService.update(existingId, updatePayload as any, actor);
    } else {
      const catalogPayload = mapStudioToCatalog(validated as CreateStudioProductInput);
      const product = await productService.create(catalogPayload as any, actor);
      productId = product.id;
    }

    /* Step 2: Create pricing record if pricing data provided */
    const pricingData = "pricing" in validated ? validated.pricing : undefined;
    if (pricingData && productId && (pricingData.sellingPrice || pricingData.costPrice)) {
      try {
        const pricingService = new PricingService();
        const variantSku = (validated.variants?.[0]?.sku ||
          validated.sku ||
          `SKU-${Date.now()}`) as string;

        const costCents = pricingData.costPrice ? Math.round(pricingData.costPrice * 100) : 0;
        const manualOverrides: Record<string, boolean> =
          (pricingData as any).manualPriceOverrides ?? {};

        const pricingPayload = {
          productId,
          variantSku,
          baseCostPrice: costCents,
          purchasePrice: 0,
          supplierPrice: 0,
          sellingPrice: pricingData.sellingPrice ? Math.round(pricingData.sellingPrice * 100) : 0,
          wholesalePrice: pricingData.wholesalePrice
            ? Math.round(pricingData.wholesalePrice * 100)
            : 0,
          resellerPrice: pricingData.resellerPrice
            ? Math.round(pricingData.resellerPrice * 100)
            : 0,
          comparePrice: pricingData.comparePrice ? Math.round(pricingData.comparePrice * 100) : 0,
          discountAmount: 0,
          discountPercentage: 0,
          taxRate: 0,
          taxInclusive: false,
          commissionRate: 0,
          currency: "BDT",
          pricingRule: "fixed" as const,
          status: "active" as const,
        };

        await pricingService.createPricing(pricingPayload, actor.id);

        if (costCents > 0) {
          if (!manualOverrides.sellingPrice) {
            pricingPayload.sellingPrice = Math.round(costCents * 1.3);
          }
          if (!manualOverrides.wholesalePrice) {
            pricingPayload.wholesalePrice = Math.round(costCents * 1.12);
          }
          if (!manualOverrides.resellerPrice) {
            pricingPayload.resellerPrice = Math.round(costCents * 1.2);
          }
          if (
            !manualOverrides.sellingPrice ||
            !manualOverrides.wholesalePrice ||
            !manualOverrides.resellerPrice
          ) {
            await pricingService.updatePricing(
              productId,
              {
                sellingPrice: pricingPayload.sellingPrice,
                wholesalePrice: pricingPayload.wholesalePrice,
                resellerPrice: pricingPayload.resellerPrice,
              },
              actor.id,
            );
          }
        }
      } catch (err) {
        logger.error("StudioAction: pricing creation failed", err);
      }
    }

    /* Step 3: Create inventory record if stock data provided */
    const inventoryData = "inventory" in validated ? validated.inventory : undefined;
    if (inventoryData && productId && inventoryData.stock > 0) {
      try {
        const inventoryService = new InventoryService();
        const variantSku = (validated.variants?.[0]?.sku ||
          validated.sku ||
          `SKU-${Date.now()}`) as string;
        const inventoryPayload: CreateInventoryInput = {
          productId,
          variantSku,
          availableStock: inventoryData.stock,
          reservedStock: 0,
          incomingStock: 0,
          damagedStock: 0,
          returnedStock: 0,
          soldStock: 0,
          virtualStock: 0,
          safetyStock: 0,
          reorderLevel: inventoryData.lowStockThreshold || 5,
          lowStockThreshold: inventoryData.lowStockThreshold || 5,
          allowPreOrder: false,
          allowBackorder: false,
          status: "active",
        };
        await inventoryService.createInventory(inventoryPayload, productId);
      } catch (err) {
        logger.error("StudioAction: inventory creation failed", err);
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
    }

    return { success: true, data: { id: productId! } };
  } catch (error: unknown) {
    logger.error("saveStudioProductAction failed", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save product",
    };
  }
}

interface StudioProductData {
  product: unknown;
  pricing: unknown;
  inventory: unknown;
}

export async function getStudioProductAction(id: string): Promise<{
  success: boolean;
  data?: StudioProductData;
  error?: string;
}> {
  const session = await auth();
  getActor(session);

  const productService = new ProductService();
  const product = await productService.findById(id);
  let pricing = null;
  let inventory = null;

  try {
    const pricingService = new PricingService();
    pricing = await pricingService.getPricingByProduct(id);
  } catch {
    // Pricing not found
  }

  try {
    const inventoryService = new InventoryService();
    inventory = await inventoryService.getInventoryByProduct(id);
  } catch {
    // Inventory not found
  }

  return { success: true, data: { product, pricing, inventory } };
}

export async function publishStudioProductAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Product.Publish");
  const actor = getActor(session);

  const productService = new ProductService();
  await productService.publish(id, actor);

  revalidatePath(`/dashboard/products/${id}`);
  return { success: true };
}

export async function archiveStudioProductAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Product.Archive");
  const actor = getActor(session);

  const productService = new ProductService();
  await productService.archive(id, "Archived from Product Studio", actor);

  revalidatePath(`/dashboard/products/${id}`);
  return { success: true };
}

export async function deleteStudioProductAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Product.Delete");
  const actor = getActor(session);

  const productService = new ProductService();
  await productService.delete(id, actor);

  revalidatePath("/dashboard/products");
  return { success: true };
}

export async function getBrandsAction(): Promise<{
  success: boolean;
  data?: Array<{ id: string; name: string }>;
  error?: string;
}> {
  const session = await auth();
  getActor(session);

  const { BrandRepository } =
    await import("@/features/catalog/repositories/classification-repository");
  const repo = new BrandRepository();
  const brands = await repo.find({});
  return { success: true, data: brands.map((b: any) => ({ id: b.id, name: b.name })) };
}

export async function getCategoriesAction(): Promise<{
  success: boolean;
  data?: Array<{ id: string; name: string }>;
  error?: string;
}> {
  const session = await auth();
  getActor(session);

  const { CategoryRepository } =
    await import("@/features/catalog/repositories/classification-repository");
  const repo = new CategoryRepository();
  const categories = await repo.find({});
  return { success: true, data: categories.map((c: any) => ({ id: c.id, name: c.name })) };
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

function mapStudioToCatalog(input: CreateStudioProductInput): Record<string, unknown> {
  const p = input.pricing || {};
  return {
    productType: input.productType,
    name: input.name,
    sku: input.sku,
    shortDescription: input.shortDescription || undefined,
    description:
      (input as any).description || input.richDescription || input.shortDescription || undefined,
    notice: (input as any).notice || undefined,
    badges: (input as any).badges || [],
    specifications: (input as any).specifications || [],
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
    tags: input.tags || [],
    costPrice: p.costPrice || undefined,
    sellingPrice: p.sellingPrice || undefined,
    retailPrice: p.sellingPrice || undefined,
    wholesalePrice: p.wholesalePrice || undefined,
    resellerPrice: p.resellerPrice || undefined,
    comparePrice: p.comparePrice || undefined,
    metaTitle: input.seo?.metaTitle || (input as any).metaTitle || input.name,
    metaDescription:
      input.seo?.metaDescription || (input as any).metaDescription || input.shortDescription || "",
    variants: (input.variants || []).map((v: any) => ({
      id: v.id,
      name: v.name || [v.color, v.size, v.storage].filter(Boolean).join(" / "),
      attributes: v.attributes,
      sku: v.sku,
      priceAdjustment: v.priceAdjustment ?? 0,
      stock: v.stock ?? 0,
      image: v.image || (v.images && v.images.length > 0 ? v.images[0] : undefined),
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
    media: (input.media || []).map((m: any) => ({
      url: m.url,
      type: m.type || "image",
      isFeatured: m.isFeatured || false,
      altText: m.altText || undefined,
      sortOrder: 0,
    })),
    seo: input.seo
      ? {
          metaTitle: input.seo.metaTitle || undefined,
          metaDescription: input.seo.metaDescription || undefined,
          metaKeywords: input.seo.metaKeywords || undefined,
          ogImage: input.seo.ogImage || undefined,
        }
      : undefined,
    content: {
      richDescription: input.richDescription ? { html: input.richDescription } : undefined,
      warrantyInformation: input.warranty || undefined,
      returnPolicy: input.returnPolicy || undefined,
      specifications: (input as any).specifications || [],
    },
  };
}
