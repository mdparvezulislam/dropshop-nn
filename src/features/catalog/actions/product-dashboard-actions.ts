"use server";

import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/check-permission";
import { logger } from "@/lib/utils/logger";
import { ProductRepository } from "../repositories/product-repository";

export async function getProductDashboardStatsAction(): Promise<{
  success: boolean;
  data?: {
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
  };
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "products.product.view");
    const repo = new ProductRepository();
    const stats = await repo.getDashboardStats();

    return {
      success: true,
      data: stats,
    };
  } catch (err: unknown) {
    logger.error("Failed to get product dashboard stats", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch dashboard stats",
    };
  }
}
