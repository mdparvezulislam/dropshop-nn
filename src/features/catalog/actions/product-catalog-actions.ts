"use server";

import { auth } from "@/shared/lib/auth";
import { ProductService } from "../services/product-service";
import { checkPermission } from "@/shared/lib/check-permission";
import { logger } from "@/shared/utils/logger";
import { revalidatePath } from "next/cache";

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
        const currentPrice = (existing as any).retailPrice ?? (existing as any).price ?? 0;
        if (changes.priceAdjustment.type === "percent_add") {
          updateData.retailPrice = Math.round(currentPrice * (1 + changes.priceAdjustment.value / 100));
        } else if (changes.priceAdjustment.type === "percent_sub") {
          updateData.retailPrice = Math.max(0, Math.round(currentPrice * (1 - changes.priceAdjustment.value / 100)));
        } else if (changes.priceAdjustment.type === "fixed") {
          updateData.retailPrice = Math.max(0, changes.priceAdjustment.value);
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
    if (field === "price") updateData.retailPrice = parseFloat(value) || 0;
    else if (field === "stock") updateData.stockQuantity = parseInt(value) || 0;
    else if (field === "status") updateData.status = value;
    else updateData[field] = value;

    const userObj = session?.user as any;
    const updated = await service.update(id, updateData, {
      id: userObj?.id || "admin",
      name: userObj?.name || "Admin",
      role: userObj?.role || "ADMIN",
    });

    revalidatePath("/dashboard/products");
    return { success: true, data: updated };
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
    const result = await service.list({}, { limit: 500 });
    const items = result.items || [];

    const targetItems = ids && ids.length > 0
      ? items.filter((p: any) => ids.includes(p.id))
      : items;

    const headers = ["ID", "Name", "SKU", "Category", "Brand", "Retail Price (BDT)", "Stock", "Status"];
    const rows = targetItems.map((p: any) => [
      p.id,
      `"${(p.title ?? p.name ?? "").replace(/"/g, '""')}"`,
      p.sku ?? "",
      `"${p.category?.name ?? p.category ?? "General"}"`,
      `"${p.brand?.name ?? p.brand ?? "Default Brand"}"`,
      p.retailPrice ?? p.price ?? 0,
      p.stockQuantity ?? p.stock ?? 0,
      p.status ?? "draft",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
    return { success: true, csvContent };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Export failed" };
  }
}
