"use server";

import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/check-permission";
import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";
import { CostVersionService } from "../services/cost-version-service";
import { createCostVersionSchema, costListQuerySchema, costSearchQuerySchema, costCompareQuerySchema } from "../types/validation";
import { NotFoundError } from "@/lib/errors/app-error";

const service = new CostVersionService();

async function getActor() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  return { id: session.user.id!, name: session.user.name ?? session.user.email ?? undefined };
}

export async function createCostVersionAction(data: unknown) {
  try {
    const session = await auth();
    checkPermission(session, "Pricing.Update");
    const actor = await getActor();
    const validated = createCostVersionSchema.parse(data);
    const result = await service.createCostVersion(validated, actor);

  try {
    const PricingEngineService = (await import("@/features/pricing/services/pricing-engine-service")).PricingEngineService;
    const PricingService = (await import("@/features/pricing/services/pricing-service")).PricingService;
    const engine = new PricingEngineService();
    const pricingService = new PricingService();
    const pricing = await pricingService.getPricingByProduct(validated.productId, validated.variantSku);
    if (pricing) {
      const [retail, wholesale, reseller] = await Promise.all([
        engine.calculatePrice({ productId: validated.productId, costPrice: result.landedCost, quantity: 1, role: "customer", variantSku: validated.variantSku }),
        engine.calculatePrice({ productId: validated.productId, costPrice: result.landedCost, quantity: 1, role: "wholesaler", variantSku: validated.variantSku }),
        engine.calculatePrice({ productId: validated.productId, costPrice: result.landedCost, quantity: 1, role: "reseller", variantSku: validated.variantSku }),
      ]);
      await pricingService.updatePricing(pricing.id, {
        baseCostPrice: result.landedCost,
        sellingPrice: retail.unitPrice,
        wholesalePrice: wholesale.unitPrice,
        resellerPrice: reseller.unitPrice,
      }, actor.id);
    }
  } catch (err) {
    logger.warn("CostAction: pricing recalculation failed", err as Record<string, any>);
  }

    revalidatePath("/dashboard/costs");
    revalidatePath("/dashboard/products");
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message ?? "Unknown error" };
  }
}

export async function getCurrentCostAction(productId: string, variantSku?: string) {
  const session = await auth();
  checkPermission(session, "Pricing.View");
  const result = await service.getCurrentCost(productId, variantSku);
  return { success: true, data: result };
}

export async function getCostTimelineAction(productId: string, variantSku?: string, limit?: number) {
  const session = await auth();
  checkPermission(session, "Pricing.View");
  const result = await service.getTimeline(productId, variantSku, limit);
  return { success: true, data: result };
}

export async function getCostVersionByIdAction(id: string) {
  const session = await auth();
  checkPermission(session, "Pricing.View");
  const result = await service.getVersionById(id);
  return { success: true, data: result };
}

export async function compareCostVersionsAction(versionIdA: string, versionIdB: string) {
  const session = await auth();
  checkPermission(session, "Pricing.View");
  const validation = costCompareQuerySchema.parse({ versionIdA, versionIdB });
  const result = await service.compareVersions(validation.versionIdA, validation.versionIdB);
  return { success: true, data: result };
}

export async function approveCostVersionAction(id: string) {
  const session = await auth();
  checkPermission(session, "Pricing.Override");
  const actor = await getActor();
  const result = await service.approveVersion(id, actor.id, actor.name);
  revalidatePath("/dashboard/costs");
  return { success: true, data: result };
}

export async function rejectCostVersionAction(id: string) {
  const session = await auth();
  checkPermission(session, "Pricing.Override");
  const actor = await getActor();
  const result = await service.rejectVersion(id, actor.id);
  revalidatePath("/dashboard/costs");
  return { success: true, data: result };
}

export async function getCostAnalyticsAction() {
  const session = await auth();
  checkPermission(session, "Pricing.View");
  const result = await service.getCostAnalytics();
  return { success: true, data: result };
}

export async function searchProductCostAction(query: string) {
  const session = await auth();
  checkPermission(session, "Pricing.View");
  try {
    const ProductService = (await import("@/features/catalog/services/product-service")).ProductService;
    const productService = new ProductService();
    const q = query.trim();
    if (!q) return { success: true, data: [] };

    const products = await productService.list({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { sku: { $regex: q, $options: "i" } },
        { barcode: { $regex: q, $options: "i" } },
      ],
      isDeleted: { $ne: true },
    });

    if (!products.items.length) return { success: true, data: [] };

    const results = await Promise.all(products.items.slice(0, 20).map(async (product) => {
      try {
        const cost = await service.getCurrentCost(product.id);
        const featuredMedia = product.media?.find((m) => m.isFeatured);
        return {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          barcode: product.barcode,
          image: featuredMedia?.url ?? product.media?.[0]?.url ?? "",
          currentCost: cost?.costPrice ?? 0,
          currentLandedCost: cost?.landedCost ?? 0,
          currentVersion: cost?.versionNumber ?? 0,
          supplierName: cost?.supplier?.supplierName,
          lastUpdated: cost?.createdAt?.toString(),
          currency: cost?.currency ?? "BDT",
        };
      } catch { return null; }
    }));

    return { success: true, data: results.filter(Boolean) };
  } catch (err: unknown) {
    logger.error("Product cost search failed", err);
    return { success: false, error: "Search failed" };
  }
}
