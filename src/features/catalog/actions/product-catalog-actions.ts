"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { ProductService } from "../services/product-service";
import { PricingService } from "@/features/pricing/services/pricing-service";
import { checkPermission } from "@/lib/check-permission";
import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";
import { ProductModel } from "../repositories/product-model";

export interface CatalogSummaryStats {
  total: number;
  active: number;
  draft: number;
  outOfStock: number;
  lowStock: number;
  campaign: number;
}

export async function getCatalogSummaryStatsAction(): Promise<{
  success: boolean;
  data?: CatalogSummaryStats;
  error?: string;
}> {
  try {
    const service = new ProductService();
    const result = await service.list({}, { limit: 200 });
    const items = result.items || [];

    const stats: CatalogSummaryStats = {
      total: result.totalCount || items.length,
      active: items.filter((p: any) => p.status === "active").length,
      draft: items.filter((p: any) => p.status === "draft").length,
      outOfStock: items.filter((p: any) => (p.stockQuantity ?? p.stock ?? 0) <= 0).length,
      lowStock: items.filter((p: any) => {
        const qty = p.stockQuantity ?? p.stock ?? 0;
        return qty > 0 && qty <= 10;
      }).length,
      campaign: items.filter((p: any) => p.flashSale || p.campaignPrice > 0).length,
    };

    return { success: true, data: stats };
  } catch (err: unknown) {
    logger.error("Failed to fetch catalog summary stats", err);
    return {
      success: true,
      data: { total: 0, active: 0, draft: 0, outOfStock: 0, lowStock: 0, campaign: 0 },
    };
  }
}

export async function bulkUpdateProductsAction(
  ids: string[],
  changes: {
    status?: string;
    priceAdjustment?: { type: "percent_add" | "percent_sub" | "fixed"; value: number };
    stockAdjustment?: { type: "set" | "add" | "sub"; value: number };
    categoryId?: string;
    brandId?: string;
  },
): Promise<{ success: boolean; updatedCount?: number; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Update");
    const service = new ProductService();

    let updated = 0;
    for (const id of ids) {
      const existing = await service.findById(id);
      if (!existing) continue;

      const updateData: any = {};
      if (changes.status) updateData.status = changes.status;
      if (changes.categoryId) updateData.categoryId = changes.categoryId;
      if (changes.brandId) updateData.brandId = changes.brandId;

      if (changes.priceAdjustment) {
        try {
          const pricingService = new PricingService();
          const pricing = await pricingService.getPricingByProduct(id);
          if (pricing) {
            const currentPrice = pricing.sellingPrice;
            let newPrice = currentPrice;
            if (changes.priceAdjustment.type === "percent_add") {
              newPrice = Math.round(currentPrice * (1 + changes.priceAdjustment.value / 100));
            } else if (changes.priceAdjustment.type === "percent_sub") {
              newPrice = Math.max(0, Math.round(currentPrice * (1 - changes.priceAdjustment.value / 100)));
            } else if (changes.priceAdjustment.type === "fixed") {
              newPrice = Math.max(0, changes.priceAdjustment.value);
            }
            const userObj = session?.user as any;
            await pricingService.updatePricing(pricing.id, { sellingPrice: newPrice }, userObj?.id);
          }
        } catch {
          logger.warn("Price adjustment failed via PricingService, skipping", { id });
        }
      }

      if (changes.stockAdjustment) {
        const currentStock = (existing as any).stockQuantity ?? (existing as any).stock ?? 0;
        if (changes.stockAdjustment.type === "set") {
          updateData.stockQuantity = Math.max(0, changes.stockAdjustment.value);
        } else if (changes.stockAdjustment.type === "add") {
          updateData.stockQuantity = currentStock + changes.stockAdjustment.value;
        } else if (changes.stockAdjustment.type === "sub") {
          updateData.stockQuantity = Math.max(0, currentStock - changes.stockAdjustment.value);
        }
      }

      const userObj = session?.user as any;
      await service.update(id, updateData, {
        id: userObj?.id || "admin",
        name: userObj?.name || "Admin",
        role: userObj?.role || "ADMIN",
      });
      updated++;
    }

    revalidatePath("/dashboard/products");
    return { success: true, updatedCount: updated };
  } catch (err: unknown) {
    logger.error("Failed bulk update products", err);
    return { success: false, error: err instanceof Error ? err.message : "Bulk update failed" };
  }
}

export async function inlineUpdateProductAction(
  id: string,
  field: string,
  value: any,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Update");
    const service = new ProductService();

    const updateData: Record<string, any> = {};
    const userObj = session?.user as any;

    if (field === "price") {
      const pricingService = new PricingService();
      const pricing = await pricingService.getPricingByProduct(id);
      if (pricing) {
        await pricingService.updatePricing(pricing.id, { sellingPrice: Math.round(parseFloat(value) || 0) }, userObj?.id);
      }
    } else if (field === "costPrice") {
      const { createCostVersionSchema } = await import("@/features/cost/types/validation");
      const { CostVersionService } = await import("@/features/cost/services/cost-version-service");
      const costService = new CostVersionService();
      const input = createCostVersionSchema.parse({
        productId: id,
        costPrice: Math.round(parseFloat(value) || 0),
        reason: "manual_correction",
      });
      await costService.createCostVersion(input, { id: userObj?.id ?? "unknown", name: userObj?.name });
    } else if (field === "stock") updateData.stockQuantity = parseInt(value) || 0;
    else if (field === "status") updateData.status = value;
    else updateData[field] = value;

    if (Object.keys(updateData).length > 0) {
      const updated = await service.update(id, updateData, {
        id: userObj?.id || "admin",
        name: userObj?.name || "Admin",
        role: userObj?.role || "ADMIN",
      });
    }

    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (err: unknown) {
    logger.error("Failed inline update product", err);
    return { success: false, error: err instanceof Error ? err.message : "Inline edit failed" };
  }
}

export async function exportProductsAction(
  ids?: string[],
): Promise<{ success: boolean; csvContent?: string; error?: string }> {
  try {
    const service = new ProductService();
    const pricingService = new PricingService();
    const result = await service.list({}, { limit: 500 });
    const items = result.items || [];

    const targetItems = ids && ids.length > 0
      ? items.filter((p: any) => ids.includes(p.id))
      : items;

    const headers = ["ID", "Name", "SKU", "Category", "Brand", "Retail Price (BDT)", "Stock", "Status"];
    const rows = await Promise.all(targetItems.map(async (p: any) => {
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
    }));

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
  success: boolean; data?: { processed: number; failed: number }; error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Update");
    const validated = bulkIdsSchema.parse({ ids });
    const service = new ProductService();
    const userObj = session?.user as any;
    const actor = { id: userObj?.id || "admin", name: userObj?.name || "Admin", role: userObj?.role || "ADMIN" };

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

export async function bulkArchiveProductsAction(ids: string[], reason?: string): Promise<{
  success: boolean; data?: { processed: number; failed: number }; error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Update");
    const validated = bulkIdsOptionalReasonSchema.parse({ ids, reason });
    const service = new ProductService();
    const userObj = session?.user as any;
    const actor = { id: userObj?.id || "admin", name: userObj?.name || "Admin", role: userObj?.role || "ADMIN" };

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
  success: boolean; data?: { processed: number; failed: number }; error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Delete");
    const validated = bulkIdsSchema.parse({ ids });
    const service = new ProductService();
    const userObj = session?.user as any;
    const actor = { id: userObj?.id || "admin", name: userObj?.name || "Admin", role: userObj?.role || "ADMIN" };

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
  success: boolean; data?: { processed: number; failed: number }; error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Update");
    const validated = bulkIdsSchema.parse({ ids });

    let processed = 0;
    let failed = 0;
    for (const id of validated.ids) {
      try {
        const result = await ProductModel.findByIdAndUpdate(id, {
          $set: { isDeleted: false, deletedAt: null },
        }).exec();
        if (result) processed++;
        else failed++;
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

export async function bulkCategoryChangeAction(ids: string[], categoryId: string): Promise<{
  success: boolean; data?: { processed: number; failed: number }; error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Update");
    const validated = bulkIdsWithCategorySchema.parse({ ids, categoryId });
    const service = new ProductService();
    const userObj = session?.user as any;
    const actor = { id: userObj?.id || "admin", name: userObj?.name || "Admin", role: userObj?.role || "ADMIN" };

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
    return { success: false, error: err instanceof Error ? err.message : "Bulk category change failed" };
  }
}

export async function bulkBrandChangeAction(ids: string[], brandId: string): Promise<{
  success: boolean; data?: { processed: number; failed: number }; error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Update");
    const validated = bulkIdsWithBrandSchema.parse({ ids, brandId });
    const service = new ProductService();
    const userObj = session?.user as any;
    const actor = { id: userObj?.id || "admin", name: userObj?.name || "Admin", role: userObj?.role || "ADMIN" };

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
    return { success: false, error: err instanceof Error ? err.message : "Bulk brand change failed" };
  }
}

export async function bulkStatusChangeAction(ids: string[], status: string): Promise<{
  success: boolean; data?: { processed: number; failed: number }; error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Update");
    const validated = bulkIdsWithStatusSchema.parse({ ids, status: status as any });
    const service = new ProductService();
    const userObj = session?.user as any;
    const actor = { id: userObj?.id || "admin", name: userObj?.name || "Admin", role: userObj?.role || "ADMIN" };

    let processed = 0;
    let failed = 0;
    for (const id of validated.ids) {
      try {
        await ProductModel.findByIdAndUpdate(id, { $set: { status: validated.status } }).exec();
        processed++;
      } catch {
        failed++;
      }
    }

    revalidatePath("/dashboard/products");
    return { success: true, data: { processed, failed } };
  } catch (err: unknown) {
    logger.error("Failed bulk status change", err);
    return { success: false, error: err instanceof Error ? err.message : "Bulk status change failed" };
  }
}
