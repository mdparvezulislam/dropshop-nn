"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { ProductService } from "../services/product-service";
import { ProductRepository } from "../repositories/product-repository";
import { BrandRepository, CategoryRepository } from "../repositories/classification-repository";
import type { Product } from "../domain/product-entity";
import { PricingService } from "@/features/pricing/services/pricing-service";
import { PricingRepository } from "@/features/pricing/repositories/pricing-repository";
import { InventoryService } from "@/features/inventory/services/inventory-service";
import { InventoryRepository } from "@/features/inventory/repositories/inventory-repository";
import { checkPermission, sessionActor } from "@/lib/check-permission";
import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";

export interface CatalogSummaryStats {
  total: number;
  active: number;
  draft: number;
  archived: number;
  outOfStock: number;
  lowStock: number;
}

export async function getCatalogSummaryStatsAction(): Promise<{
  success: boolean;
  data?: CatalogSummaryStats;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Product.View");

    const productRepository = new ProductRepository();
    const inventoryService = new InventoryService();

    const [statusCounts, lowStock, outOfStock] = await Promise.all([
      productRepository.countCatalogStatuses(),
      inventoryService.getLowStockList().catch(() => []),
      inventoryService.getOutOfStockList().catch(() => []),
    ]);

    return {
      success: true,
      data: {
        total: statusCounts.total,
        active: statusCounts.active,
        draft: statusCounts.draft,
        archived: statusCounts.archived,
        outOfStock: outOfStock.length,
        lowStock: lowStock.length,
      },
    };
  } catch (err: unknown) {
    // Previously returned `success: true` with zeroes, presenting a failed query as an
    // empty-but-healthy catalog. Report the failure so the UI can say so.
    logger.error("Failed to fetch catalog summary stats", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load catalog statistics",
    };
  }
}

const catalogListQuerySchema = z.object({
  tab: z
    .enum(["all", "active", "draft", "low_stock", "out_of_stock", "campaign", "archived"])
    .default("all"),
  search: z.string().trim().max(200).optional(),
  categoryId: z.string().trim().max(64).optional(),
  brandId: z.string().trim().max(64).optional(),
  limit: z.number().int().min(1).max(200).default(50),
  cursor: z.string().trim().max(64).optional(),
});

export type CatalogListQuery = z.input<typeof catalogListQuerySchema>;

export interface CatalogListItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  price: number;
  costPrice: number;
  stock: number;
  status: string;
  image: string;
  updatedAt?: string;
}

export interface CatalogListResult {
  items: CatalogListItem[];
  totalCount: number;
  cursor: string | null;
  hasMore: boolean;
}

/**
 * Product List data source.
 *
 * Replaces the previous flow, which forwarded an arbitrary client-supplied object
 * straight into the Mongo query (so `{ search: "x" }` matched a non-existent `search`
 * field and always returned nothing) and then padded absent prices/stock with invented
 * placeholder numbers. Filters are now validated, search hits real fields, and price and
 * stock are read from the pricing and inventory engines.
 */
export async function listCatalogProductsAction(query: CatalogListQuery): Promise<{
  success: boolean;
  data?: CatalogListResult;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Product.View");

    const { tab, search, categoryId, brandId, limit, cursor } = catalogListQuerySchema.parse(query);

    const filter: Record<string, unknown> = {};
    if (tab === "active" || tab === "draft" || tab === "archived") filter.status = tab;
    if (tab === "campaign") filter.badges = { $in: ["flash_sale", "featured"] };
    if (categoryId) filter.categoryId = categoryId;
    if (brandId) filter.brandId = brandId;
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(escaped, "i");
      filter.$or = [{ name: pattern }, { sku: pattern }, { slug: pattern }, { tags: pattern }];
    }

    const productRepository = new ProductRepository();
    const page = await productRepository.findWithCursor({ limit, cursor }, filter);

    const enriched = await enrichCatalogItems(page.items);

    // Stock-derived tabs are resolved after the inventory join, since stock lives in the
    // inventory engine rather than on the product document.
    const items =
      tab === "low_stock"
        ? enriched.filter((item) => item.stock > 0 && item.stock <= 10)
        : tab === "out_of_stock"
          ? enriched.filter((item) => item.stock <= 0)
          : enriched;

    return {
      success: true,
      data: {
        items,
        totalCount: page.totalCount,
        cursor: page.cursor ?? null,
        hasMore: page.hasMore,
      },
    };
  } catch (err: unknown) {
    logger.error("Failed to list catalog products", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load product catalog",
    };
  }
}

/** Joins pricing, inventory and taxonomy names onto a page of products in bulk. */
async function enrichCatalogItems(products: Product[]): Promise<CatalogListItem[]> {
  if (products.length === 0) return [];

  const productIds = products.map((p) => p.id);
  const categoryIds = [...new Set(products.map((p) => p.categoryId).filter(Boolean))] as string[];
  const brandIds = [...new Set(products.map((p) => p.brandId).filter(Boolean))] as string[];

  const [pricingRows, inventoryRows, categories, brands] = await Promise.all([
    new PricingRepository().find({ productId: { $in: productIds } }).catch(() => []),
    new InventoryRepository().find({ productId: { $in: productIds } }).catch(() => []),
    categoryIds.length > 0
      ? new CategoryRepository().find({ _id: { $in: categoryIds } }).catch(() => [])
      : Promise.resolve([]),
    brandIds.length > 0
      ? new BrandRepository().find({ _id: { $in: brandIds } }).catch(() => [])
      : Promise.resolve([]),
  ]);

  const pricingByProduct = new Map(pricingRows.map((row) => [row.productId, row]));
  const stockByProduct = new Map<string, number>();
  for (const row of inventoryRows) {
    stockByProduct.set(
      row.productId,
      (stockByProduct.get(row.productId) ?? 0) + row.availableStock,
    );
  }
  const categoryNames = new Map(categories.map((c) => [c.id, c.name]));
  const brandNames = new Map(brands.map((b) => [b.id, b.name]));

  return products.map((product) => {
    const pricing = pricingByProduct.get(product.id);
    const featured = product.media.find((m) => m.isFeatured) ?? product.media[0];

    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      // Empty string, never a fabricated placeholder — the UI renders its own "—".
      category: product.categoryId ? (categoryNames.get(product.categoryId) ?? "") : "",
      brand: product.brandId ? (brandNames.get(product.brandId) ?? "") : "",
      price: pricing ? pricing.sellingPrice / 100 : 0,
      costPrice: pricing ? pricing.baseCostPrice / 100 : 0,
      stock: stockByProduct.get(product.id) ?? 0,
      status: product.status,
      image: featured?.url ?? "",
      updatedAt:
        product.updatedAt instanceof Date ? product.updatedAt.toISOString() : product.updatedAt,
    };
  });
}

const bulkUpdateSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one product ID is required").max(500),
  changes: z.object({
    status: z.enum(["draft", "pending_review", "active", "inactive", "archived"]).optional(),
    priceAdjustment: z
      .object({
        type: z.enum(["percent_add", "percent_sub", "fixed"]),
        value: z.number().nonnegative(),
      })
      .optional(),
    stockAdjustment: z
      .object({ type: z.enum(["set", "add", "sub"]), value: z.number().int().nonnegative() })
      .optional(),
    categoryId: z.string().min(1).optional(),
    brandId: z.string().min(1).optional(),
  }),
});

export type BulkProductChanges = z.infer<typeof bulkUpdateSchema>["changes"];

export async function bulkUpdateProductsAction(
  ids: string[],
  changes: BulkProductChanges,
): Promise<{ success: boolean; updatedCount?: number; failedCount?: number; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Update");
    const actor = sessionActor(session);
    const validated = bulkUpdateSchema.parse({ ids, changes });

    const service = new ProductService();
    const pricingService = new PricingService();
    const inventoryService = new InventoryService();

    let updated = 0;
    let failed = 0;

    for (const id of validated.ids) {
      try {
        const existing = await service.findById(id);
        if (!existing) {
          failed++;
          continue;
        }

        const { status, categoryId, brandId, priceAdjustment, stockAdjustment } = validated.changes;

        if (status || categoryId || brandId) {
          await service.update(
            id,
            {
              ...(status ? { status } : {}),
              ...(categoryId ? { categoryId } : {}),
              ...(brandId ? { brandId } : {}),
            },
            actor,
          );
        }

        if (priceAdjustment) {
          const pricing = await pricingService.getPricingByProduct(id);
          if (pricing) {
            const currentPrice = pricing.sellingPrice;
            const newPrice =
              priceAdjustment.type === "percent_add"
                ? Math.round(currentPrice * (1 + priceAdjustment.value / 100))
                : priceAdjustment.type === "percent_sub"
                  ? Math.max(0, Math.round(currentPrice * (1 - priceAdjustment.value / 100)))
                  : // A fixed amount arrives in BDT; pricing stores minor units.
                    Math.max(0, Math.round(priceAdjustment.value * 100));
            await pricingService.updatePricing(pricing.id, { sellingPrice: newPrice }, actor.id);
          }
        }

        if (stockAdjustment) {
          // Routed through the inventory engine — `stockQuantity` is not a product field
          // and the previous write was silently discarded by the schema.
          const inventory = await inventoryService.getInventoryByProduct(id);
          if (inventory) {
            const current = inventory.availableStock;
            const availableStock =
              stockAdjustment.type === "set"
                ? stockAdjustment.value
                : stockAdjustment.type === "add"
                  ? current + stockAdjustment.value
                  : Math.max(0, current - stockAdjustment.value);
            await inventoryService.updateInventory(inventory.id, { availableStock }, actor.id);
          }
        }

        updated++;
      } catch (itemError) {
        logger.warn("Bulk update failed for product", {
          id,
          error: itemError instanceof Error ? itemError.message : "unknown",
        });
        failed++;
      }
    }

    revalidatePath("/dashboard/products");
    return { success: true, updatedCount: updated, failedCount: failed };
  } catch (err: unknown) {
    logger.error("Failed bulk update products", err);
    return { success: false, error: err instanceof Error ? err.message : "Bulk update failed" };
  }
}

const inlineUpdateSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
  // Allow-listed: the previous implementation wrote any client-named field straight
  // onto the product document (`updateData[field] = value`), including `isDeleted`.
  field: z.enum(["price", "costPrice", "stock", "status", "name"]),
  value: z.union([z.string(), z.number()]),
});

export async function inlineUpdateProductAction(
  id: string,
  field: string,
  value: string | number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Update");
    const actor = sessionActor(session);

    const parsed = inlineUpdateSchema.parse({ id, field, value });
    const numericValue = Number(parsed.value);

    if (parsed.field === "price") {
      if (!Number.isFinite(numericValue) || numericValue < 0) {
        return { success: false, error: "Price must be a non-negative number" };
      }
      const pricingService = new PricingService();
      const pricing = await pricingService.getPricingByProduct(parsed.id);
      if (!pricing) {
        return { success: false, error: "This product has no pricing record yet" };
      }
      // Pricing is stored in minor units; the grid edits major units (BDT).
      await pricingService.updatePricing(
        pricing.id,
        { sellingPrice: Math.round(numericValue * 100) },
        actor.id,
      );
    } else if (parsed.field === "costPrice") {
      if (!Number.isFinite(numericValue) || numericValue < 0) {
        return { success: false, error: "Cost price must be a non-negative number" };
      }
      const { createCostVersionSchema } = await import("@/features/cost/types/validation");
      const { CostVersionService } = await import("@/features/cost/services/cost-version-service");
      const input = createCostVersionSchema.parse({
        productId: parsed.id,
        costPrice: Math.round(numericValue * 100),
        reason: "manual_correction",
      });
      await new CostVersionService().createCostVersion(input, { id: actor.id, name: actor.name });
    } else if (parsed.field === "stock") {
      if (!Number.isInteger(numericValue) || numericValue < 0) {
        return { success: false, error: "Stock must be a non-negative whole number" };
      }
      // Stock lives in the inventory engine — writing `stockQuantity` onto the product
      // document was silently dropped by the Mongoose schema.
      const result = await setProductStock(parsed.id, numericValue, actor.id);
      if (!result.ok) return { success: false, error: result.error };
    } else if (parsed.field === "status") {
      const status = z
        .enum(["draft", "pending_review", "active", "inactive", "archived"])
        .parse(parsed.value);
      await new ProductService().update(parsed.id, { status }, actor);
    } else {
      const name = z.string().min(2).max(255).parse(parsed.value);
      await new ProductService().update(parsed.id, { name }, actor);
    }

    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (err: unknown) {
    logger.error("Failed inline update product", err);
    return { success: false, error: err instanceof Error ? err.message : "Inline edit failed" };
  }
}

/** Writes an absolute available-stock figure through the inventory engine. */
async function setProductStock(
  productId: string,
  availableStock: number,
  actorId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const inventoryService = new InventoryService();
  const existing = await inventoryService.getInventoryByProduct(productId);
  if (!existing) {
    return { ok: false, error: "This product has no inventory record yet" };
  }
  await inventoryService.updateInventory(existing.id, { availableStock }, actorId);
  return { ok: true };
}

export async function exportProductsAction(
  ids?: string[],
): Promise<{ success: boolean; csvContent?: string; error?: string }> {
  try {
    // SECURITY: a full catalog dump (SKUs, prices, stock) is staff-only.
    const session = await auth();
    checkPermission(session, "Product.View");

    const service = new ProductService();
    const pricingService = new PricingService();
    const result = await service.list({}, { limit: 500 });
    const items = result.items || [];

    const targetItems =
      ids && ids.length > 0 ? items.filter((p: any) => ids.includes(p.id)) : items;

    const headers = [
      "ID",
      "Name",
      "SKU",
      "Category",
      "Brand",
      "Retail Price (BDT)",
      "Stock",
      "Status",
    ];
    const rows = await Promise.all(
      targetItems.map(async (p: any) => {
        let retailPrice = 0;
        try {
          const pricing = await pricingService.getPricingByProduct(p.id);
          if (pricing) retailPrice = pricing.sellingPrice;
        } catch {}
        return [
          p.id,
          `"${(p.title ?? p.name ?? "").replace(/"/g, '""')}"`,
          p.sku ?? "",
          `"${p.category?.name ?? p.category ?? "General"}"`,
          `"${p.brand?.name ?? p.brand ?? "Default Brand"}"`,
          retailPrice,
          p.stockQuantity ?? p.stock ?? 0,
          p.status ?? "draft",
        ];
      }),
    );

    const csvContent = [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
    return { success: true, csvContent };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Export failed" };
  }
}

// --- Zod schemas for bulk operations ---

const bulkIdsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one product ID is required"),
});

const bulkIdsOptionalReasonSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one product ID is required"),
  reason: z.string().optional(),
});

const bulkIdsWithCategorySchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one product ID is required"),
  categoryId: z.string().min(1, "Category ID is required"),
});

const bulkIdsWithBrandSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one product ID is required"),
  brandId: z.string().min(1, "Brand ID is required"),
});

const bulkIdsWithStatusSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one product ID is required"),
  status: z.enum(["draft", "pending_review", "active", "inactive", "archived"]),
});

// --- Bulk actions ---

export async function bulkPublishProductsAction(ids: string[]): Promise<{
  success: boolean;
  data?: { processed: number; failed: number };
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Update");
    const validated = bulkIdsSchema.parse({ ids });
    const service = new ProductService();
    const actor = sessionActor(session);

    let processed = 0;
    let failed = 0;
    for (const id of validated.ids) {
      try {
        await service.publish(id, actor);
        processed++;
      } catch {
        failed++;
      }
    }

    revalidatePath("/dashboard/products");
    return { success: true, data: { processed, failed } };
  } catch (err: unknown) {
    logger.error("Failed bulk publish products", err);
    return { success: false, error: err instanceof Error ? err.message : "Bulk publish failed" };
  }
}

export async function bulkArchiveProductsAction(
  ids: string[],
  reason?: string,
): Promise<{
  success: boolean;
  data?: { processed: number; failed: number };
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Update");
    const validated = bulkIdsOptionalReasonSchema.parse({ ids, reason });
    const service = new ProductService();
    const actor = sessionActor(session);

    let processed = 0;
    let failed = 0;
    for (const id of validated.ids) {
      try {
        await service.archive(id, validated.reason, actor);
        processed++;
      } catch {
        failed++;
      }
    }

    revalidatePath("/dashboard/products");
    return { success: true, data: { processed, failed } };
  } catch (err: unknown) {
    logger.error("Failed bulk archive products", err);
    return { success: false, error: err instanceof Error ? err.message : "Bulk archive failed" };
  }
}

export async function bulkDeleteProductsAction(ids: string[]): Promise<{
  success: boolean;
  data?: { processed: number; failed: number };
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Delete");
    const validated = bulkIdsSchema.parse({ ids });
    const service = new ProductService();
    const actor = sessionActor(session);

    let processed = 0;
    let failed = 0;
    for (const id of validated.ids) {
      try {
        await service.delete(id, actor);
        processed++;
      } catch {
        failed++;
      }
    }

    revalidatePath("/dashboard/products");
    return { success: true, data: { processed, failed } };
  } catch (err: unknown) {
    logger.error("Failed bulk delete products", err);
    return { success: false, error: err instanceof Error ? err.message : "Bulk delete failed" };
  }
}

export async function bulkRestoreProductsAction(ids: string[]): Promise<{
  success: boolean;
  data?: { processed: number; failed: number };
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Update");
    const validated = bulkIdsSchema.parse({ ids });

    // Routed through the service so restores are audited and versioned like every
    // other lifecycle transition, instead of writing to the Mongoose model directly.
    const service = new ProductService();
    const actor = sessionActor(session);

    let processed = 0;
    let failed = 0;
    for (const id of validated.ids) {
      try {
        await service.restore(id, actor);
        processed++;
      } catch {
        failed++;
      }
    }

    revalidatePath("/dashboard/products");
    return { success: true, data: { processed, failed } };
  } catch (err: unknown) {
    logger.error("Failed bulk restore products", err);
    return { success: false, error: err instanceof Error ? err.message : "Bulk restore failed" };
  }
}

export async function bulkCategoryChangeAction(
  ids: string[],
  categoryId: string,
): Promise<{
  success: boolean;
  data?: { processed: number; failed: number };
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Update");
    const validated = bulkIdsWithCategorySchema.parse({ ids, categoryId });
    const service = new ProductService();
    const actor = sessionActor(session);

    let processed = 0;
    let failed = 0;
    for (const id of validated.ids) {
      try {
        await service.update(id, { categoryId: validated.categoryId }, actor);
        processed++;
      } catch {
        failed++;
      }
    }

    revalidatePath("/dashboard/products");
    return { success: true, data: { processed, failed } };
  } catch (err: unknown) {
    logger.error("Failed bulk category change", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Bulk category change failed",
    };
  }
}

export async function bulkBrandChangeAction(
  ids: string[],
  brandId: string,
): Promise<{
  success: boolean;
  data?: { processed: number; failed: number };
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Update");
    const validated = bulkIdsWithBrandSchema.parse({ ids, brandId });
    const service = new ProductService();
    const actor = sessionActor(session);

    let processed = 0;
    let failed = 0;
    for (const id of validated.ids) {
      try {
        await service.update(id, { brandId: validated.brandId }, actor);
        processed++;
      } catch {
        failed++;
      }
    }

    revalidatePath("/dashboard/products");
    return { success: true, data: { processed, failed } };
  } catch (err: unknown) {
    logger.error("Failed bulk brand change", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Bulk brand change failed",
    };
  }
}

export async function bulkStatusChangeAction(
  ids: string[],
  status: string,
): Promise<{
  success: boolean;
  data?: { processed: number; failed: number };
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Update");
    const validated = bulkIdsWithStatusSchema.parse({ ids, status });
    const service = new ProductService();
    const actor = sessionActor(session);

    let processed = 0;
    let failed = 0;
    for (const id of validated.ids) {
      try {
        // Service-routed: the direct model write skipped validation, audit trail,
        // version history and the catalog event bus.
        await service.update(id, { status: validated.status }, actor);
        processed++;
      } catch {
        failed++;
      }
    }

    revalidatePath("/dashboard/products");
    return { success: true, data: { processed, failed } };
  } catch (err: unknown) {
    logger.error("Failed bulk status change", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Bulk status change failed",
    };
  }
}
