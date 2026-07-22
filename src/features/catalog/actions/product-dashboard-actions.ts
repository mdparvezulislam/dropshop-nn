"use server";

import { auth } from "@/shared/lib/auth";
import { checkPermission } from "@/shared/lib/check-permission";
import { logger } from "@/shared/utils/logger";
import { ProductRepository } from "../repositories/product-repository";
import { ProductModel } from "../repositories/product-model";

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
    checkPermission(session, "Product.Read");
    const repo = new ProductRepository();

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
      repo.count({ isDeleted: { $ne: true } }),
      repo.count({ createdAt: { $gte: sevenDaysAgo }, isDeleted: { $ne: true } }),
      repo.count({ updatedAt: { $gte: sevenDaysAgo }, isDeleted: { $ne: true } }),
      repo.count({ status: "draft", isDeleted: { $ne: true } }),
      repo.count({ status: "active", isDeleted: { $ne: true } }),
      repo.count({ status: "archived", isDeleted: { $ne: true } }),
      ProductModel.countDocuments({
        isDeleted: { $ne: true },
        $or: [
          { media: { $exists: false } },
          { media: { $size: 0 } },
        ],
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
            $or: [
              { media: { $exists: false } },
              { media: { $size: 0 } },
            ],
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
      repo.count({
        isDeleted: { $ne: true },
        $expr: {
          $and: [
            { $gte: [{ $ifNull: ["$stockQuantity", "$stock", 0] }, 1] },
            { $lte: [{ $ifNull: ["$stockQuantity", "$stock", 0] }, 10] },
          ],
        },
      }),
      repo.count({
        isDeleted: { $ne: true },
        $expr: { $lte: [{ $ifNull: ["$stockQuantity", "$stock", 0] }, 0] },
      }),
      repo.count({ variants: { $not: { $size: 0 } }, isDeleted: { $ne: true } }),
      repo.count({ categoryId: { $exists: false }, isDeleted: { $ne: true } }),
      ProductModel.countDocuments({
        isDeleted: { $ne: true },
        publishSchedule: { $exists: true, $ne: null },
      }).exec(),
    ]);

    return {
      success: true,
      data: {
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
      },
    };
  } catch (err: unknown) {
    logger.error("Failed to get product dashboard stats", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to fetch dashboard stats" };
  }
}
