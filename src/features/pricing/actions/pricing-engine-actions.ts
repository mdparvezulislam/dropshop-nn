"use server";

import { auth } from "@/shared/lib/auth";
import { checkPermission } from "@/shared/lib/check-permission";
import { logger } from "@/shared/utils/logger";
import { revalidatePath } from "next/cache";
import { PricingEngineService, PriceRequest } from "../services/pricing-engine-service";
import { GlobalPricingService } from "../services/global-pricing-service";
import { PricingProfileService } from "../services/profile-service";
import { MoqService } from "../services/moq-service";
import { CampaignPricingService } from "../services/campaign-service";
import { PriceApprovalService } from "../services/approval-service";
import { BulkPricingService, BulkOperation, BulkFilter } from "../services/bulk-pricing-service";
import { PricingService } from "../services/pricing-service";
import { z } from "zod";

const engine = new PricingEngineService();
const globalService = new GlobalPricingService();
const profileService = new PricingProfileService();
const moqService = new MoqService();
const campaignService = new CampaignPricingService();
const approvalService = new PriceApprovalService();
const bulkService = new BulkPricingService();
const pricingService = new PricingService();

export async function calculatePriceAction(request: PriceRequest) {
  const session = await auth();
  checkPermission(session, "Pricing.View");
  return { success: true, data: await engine.calculatePrice(request) };
}

export async function checkPriceProtectionAction(productId: string, proposedPrice: number, role: string, quantity?: number, discount?: number) {
  const session = await auth();
  checkPermission(session, "Pricing.View");
  return { success: true, data: await engine.checkPriceProtection(productId, proposedPrice, role, quantity ?? 1, discount) };
}

export async function simulatePricingAction(input: Parameters<PricingEngineService["simulatePrice"]>[0]) {
  const session = await auth();
  checkPermission(session, "Pricing.View");
  return { success: true, data: await engine.simulatePrice(input) };
}

export async function resolveMoqPriceAction(productId: string, quantity: number, variantSku?: string) {
  const session = await auth();
  checkPermission(session, "Pricing.View");
  return { success: true, data: await engine.resolveMoqPrice(productId, quantity, variantSku) };
}

// ─── Global Rules ──────────────────────────────

export async function listGlobalRulesAction() {
  const session = await auth();
  checkPermission(session, "Pricing.View");
  return { success: true, data: await globalService.listGlobalRules() };
}

export async function createGlobalRuleAction(data: unknown) {
  const session = await auth();
  checkPermission(session, "Pricing.Update");
  const validated = z.object({
    name: z.string().min(1), channel: z.enum(["retail","wholesale","reseller","distributor","vip_reseller","marketplace"]),
    markupType: z.enum(["percentage","fixed_amount"]), markupValue: z.number().min(0),
    roundPriceTo: z.number().optional(), minProfit: z.number().optional(),
    maxDiscount: z.number().min(0).max(100).optional(), minMarginPercent: z.number().min(0).max(100).optional(),
    isActive: z.boolean().optional(), priority: z.number().optional(),
  }).parse(data);
  const result = await globalService.createGlobalRule(validated as any, session?.user?.id);
  revalidatePath("/dashboard/pricing");
  return { success: true, data: result };
}

export async function updateGlobalRuleAction(id: string, data: unknown) {
  const session = await auth();
  checkPermission(session, "Pricing.Update");
  const result = await globalService.updateGlobalRule(id, data as any, session?.user?.id);
  revalidatePath("/dashboard/pricing");
  return { success: true, data: result };
}

export async function deleteGlobalRuleAction(id: string) {
  const session = await auth();
  checkPermission(session, "Pricing.Update");
  await globalService.deleteGlobalRule(id);
  revalidatePath("/dashboard/pricing");
  return { success: true };
}

// ─── Category Overrides ─────────────────────────

export async function listCategoryOverridesAction() {
  const session = await auth();
  checkPermission(session, "Pricing.View");
  return { success: true, data: await globalService.listCategoryOverrides() };
}

export async function createCategoryOverrideAction(data: unknown) {
  const session = await auth();
  checkPermission(session, "Pricing.Update");
  const validated = z.object({
    categoryId: z.string().min(1), categoryName: z.string().min(1),
    markupType: z.enum(["percentage","fixed_amount"]), markupValue: z.number().min(0),
    minMarginPercent: z.number().optional(), maxDiscountPercent: z.number().optional(),
  }).parse(data);
  const result = await globalService.createCategoryOverride(validated, session?.user?.id);
  revalidatePath("/dashboard/pricing");
  return { success: true, data: result };
}

export async function updateCategoryOverrideAction(id: string, data: unknown) {
  const session = await auth();
  checkPermission(session, "Pricing.Update");
  const result = await globalService.updateCategoryOverride(id, data as any, session?.user?.id);
  revalidatePath("/dashboard/pricing");
  return { success: true, data: result };
}

export async function deleteCategoryOverrideAction(id: string) {
  const session = await auth();
  checkPermission(session, "Pricing.Update");
  await globalService.deleteCategoryOverride(id);
  revalidatePath("/dashboard/pricing");
  return { success: true };
}

// ─── Brand Overrides ────────────────────────────

export async function listBrandOverridesAction() {
  const session = await auth();
  checkPermission(session, "Pricing.View");
  return { success: true, data: await globalService.listBrandOverrides() };
}

export async function createBrandOverrideAction(data: unknown) {
  const session = await auth();
  checkPermission(session, "Pricing.Update");
  const validated = z.object({
    brandId: z.string().min(1), brandName: z.string().min(1),
    channel: z.enum(["retail","wholesale","reseller","distributor"]),
    markupType: z.enum(["percentage","fixed_amount"]), markupValue: z.number().min(0),
    minProfitPercent: z.number().optional(), maxDiscountPercent: z.number().optional(),
  }).parse(data);
  const result = await globalService.createBrandOverride(validated, session?.user?.id);
  revalidatePath("/dashboard/pricing");
  return { success: true, data: result };
}

export async function updateBrandOverrideAction(id: string, data: unknown) {
  const session = await auth();
  checkPermission(session, "Pricing.Update");
  const result = await globalService.updateBrandOverride(id, data as any, session?.user?.id);
  revalidatePath("/dashboard/pricing");
  return { success: true, data: result };
}

export async function deleteBrandOverrideAction(id: string) {
  const session = await auth();
  checkPermission(session, "Pricing.Update");
  await globalService.deleteBrandOverride(id);
  revalidatePath("/dashboard/pricing");
  return { success: true };
}

// ─── Supplier Rules ─────────────────────────────

export async function listSupplierPricingRulesAction() {
  const session = await auth();
  checkPermission(session, "Pricing.View");
  return { success: true, data: await globalService.listSupplierRules() };
}

// ─── Profiles ───────────────────────────────────

export async function listPricingProfilesAction() {
  const session = await auth();
  checkPermission(session, "Pricing.View");
  return { success: true, data: await profileService.listProfiles() };
}

export async function createPricingProfileAction(data: unknown) {
  const session = await auth();
  checkPermission(session, "Pricing.Update");
  const validated = z.object({
    name: z.string().min(1), slug: z.string().min(1),
    description: z.string().optional(),
    markupRules: z.array(z.object({
      channel: z.enum(["retail","wholesale","reseller","distributor"]),
      markupType: z.enum(["percentage","fixed_amount"]), markupValue: z.number().min(0),
    })),
    discountRules: z.array(z.object({
      type: z.enum(["percentage","fixed_amount"]), value: z.number().min(0),
      minOrderValue: z.number().optional(),
    })).optional(),
    minMarginPercent: z.number().optional(),
    roundPriceTo: z.number().optional(),
    isDefault: z.boolean().optional(),
  }).parse(data);
  const result = await profileService.createProfile(validated, session?.user?.id);
  revalidatePath("/dashboard/pricing");
  return { success: true, data: result };
}

export async function updatePricingProfileAction(id: string, data: unknown) {
  const session = await auth();
  checkPermission(session, "Pricing.Update");
  const result = await profileService.updateProfile(id, data as any, session?.user?.id);
  revalidatePath("/dashboard/pricing");
  return { success: true, data: result };
}

export async function deletePricingProfileAction(id: string) {
  const session = await auth();
  checkPermission(session, "Pricing.Update");
  await profileService.deleteProfile(id);
  revalidatePath("/dashboard/pricing");
  return { success: true };
}

// ─── MOQ ────────────────────────────────────────

export async function getMoqTiersAction(productId: string, variantSku?: string) {
  const session = await auth();
  checkPermission(session, "Pricing.View");
  return { success: true, data: await moqService.getTiers(productId, variantSku) };
}

export async function setMoqTiersAction(data: unknown) {
  const session = await auth();
  checkPermission(session, "Pricing.Update");
  const validated = z.object({
    productId: z.string().min(1), variantSku: z.string().optional(),
    tiers: z.array(z.object({
      minQuantity: z.number().min(1), maxQuantity: z.number().optional(),
      price: z.number().min(0), discountPercent: z.number().optional(),
      label: z.string().optional(),
    })).min(1),
  }).parse(data);
  const result = await moqService.setTiers(validated, session?.user?.id);
  revalidatePath("/dashboard/pricing");
  return { success: true, data: result };
}

// ─── Campaigns ──────────────────────────────────

export async function listCampaignsAction() {
  const session = await auth();
  checkPermission(session, "Pricing.View");
  return { success: true, data: await campaignService.listCampaigns() };
}

export async function createCampaignAction(data: unknown) {
  const session = await auth();
  checkPermission(session, "Pricing.Update");
  const validated = z.object({
    name: z.string().min(1),
    campaignType: z.enum(["campaign","flash_sale","festival","seasonal","clearance"]),
    productId: z.string().min(1), variantSku: z.string().optional(),
    campaignPrice: z.number().min(0),
    effectiveFrom: z.coerce.date(), effectiveTo: z.coerce.date(),
    timezone: z.string().optional(), priority: z.number().optional(),
    autoRestore: z.boolean().optional(), description: z.string().optional(),
  }).parse(data);
  const result = await campaignService.createCampaign(validated, session?.user?.id);
  revalidatePath("/dashboard/pricing");
  return { success: true, data: result };
}

export async function deleteCampaignAction(id: string) {
  const session = await auth();
  checkPermission(session, "Pricing.Update");
  await campaignService.deleteCampaign(id);
  revalidatePath("/dashboard/pricing");
  return { success: true };
}

// ─── Approvals ──────────────────────────────────

export async function listPendingApprovalsAction() {
  const session = await auth();
  checkPermission(session, "Pricing.View");
  return { success: true, data: await approvalService.listPendingApprovals() };
}

export async function listAllApprovalsAction() {
  const session = await auth();
  checkPermission(session, "Pricing.View");
  return { success: true, data: await approvalService.listAllApprovals() };
}

export async function requestPriceApprovalAction(data: unknown) {
  const session = await auth();
  checkPermission(session, "Pricing.Update");
  const validated = z.object({
    entityType: z.enum(["product_pricing","global_rule","profile","campaign","bulk_update"]),
    entityId: z.string().min(1),
    changes: z.array(z.object({
      field: z.string(), oldValue: z.any().nullable(), newValue: z.any().nullable(),
    })).min(1),
    reason: z.string().min(1),
  }).parse(data);
  const result = await approvalService.requestApproval({
    ...validated, requestedBy: session?.user?.id ?? "system",
    requestedByName: session?.user?.email ?? undefined,
  });
  revalidatePath("/dashboard/pricing");
  return { success: true, data: result };
}

export async function approvePriceAction(id: string, note?: string) {
  const session = await auth();
  checkPermission(session, "Pricing.Override");
  const result = await approvalService.approveApproval(id, session?.user?.id ?? "system", session?.user?.email ?? undefined, note);
  revalidatePath("/dashboard/pricing");
  return { success: true, data: result };
}

export async function rejectPriceAction(id: string, note?: string) {
  const session = await auth();
  checkPermission(session, "Pricing.Override");
  const result = await approvalService.rejectApproval(id, session?.user?.id ?? "system", session?.user?.email ?? undefined, note);
  revalidatePath("/dashboard/pricing");
  return { success: true, data: result };
}

// ─── History ────────────────────────────────────

export async function getPriceHistoryAction(productId: string, variantSku?: string) {
  const session = await auth();
  checkPermission(session, "Pricing.View");
  return { success: true, data: await approvalService.getProductHistory(productId, variantSku) };
}

export async function getAllPriceHistoryAction() {
  const session = await auth();
  checkPermission(session, "Pricing.View");
  return { success: true, data: await approvalService.getAllHistory() };
}

// ─── Bulk Operations ────────────────────────────

export async function bulkPricingOperationAction(filter: BulkFilter, operation: BulkOperation) {
  const session = await auth();
  checkPermission(session, "Pricing.Update");
  const result = await bulkService.bulkUpdateByFilter(filter, operation, session?.user?.id);
  revalidatePath("/dashboard/pricing");
  return { success: true, data: result };
}

export async function searchProductPricingAction(query: string): Promise<{
  success: boolean;
  data?: Array<{
    id: string; productId: string; name: string; sku: string; barcode?: string;
    image?: string; brandName?: string; categoryName?: string; supplierName?: string;
    baseCostPrice: number; sellingPrice: number; wholesalePrice: number; resellerPrice: number;
    comparePrice?: number; promotionalPrice?: number; profitMargin: number; profitAmount: number;
    currency: string; pricingRule: string; status: string; pricingProfile?: string;
    isOverridden: boolean; isLocked: boolean; availableStock: number;
    lastPriceUpdate?: string; productHealth: number;
  }>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Pricing.View");
  try {
    const ProductService = (await import("@/features/catalog/services/product-service")).ProductService;
    const PricingService = (await import("../services/pricing-service")).PricingService;
    const InventoryService = (await import("@/features/inventory/services/inventory-service")).InventoryService;
    const { BrandRepository, CategoryRepository } = await import("@/features/catalog/repositories/classification-repository");

    const productService = new ProductService();
    const pricingService = new PricingService();
    const inventoryService = new InventoryService();
    const brandRepo = new BrandRepository();
    const categoryRepo = new CategoryRepository();

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

    const brands = await brandRepo.find({});
    const categories = await categoryRepo.find({});
    const brandMap = new Map(brands.map((b: any) => [b.id, b.name]));
    const categoryMap = new Map(categories.map((c: any) => [c.id, c.name]));

    const results = await Promise.all(products.items.slice(0, 20).map(async (product) => {
      try {
        const pricing = await pricingService.getPricingByProduct(product.id);
        const inventory = await inventoryService.getInventoryByProduct(product.id);
        const featuredMedia = product.media?.find((m) => m.isFeatured);
        return {
          id: pricing?.id ?? "",
          productId: product.id,
          name: product.name,
          sku: product.sku,
          barcode: product.barcode,
          image: featuredMedia?.url ?? product.media?.[0]?.url ?? "",
          brandName: brandMap.get(product.brandId ?? "") ?? "",
          categoryName: categoryMap.get(product.categoryId ?? "") ?? "",
          supplierName: "",
          baseCostPrice: pricing?.baseCostPrice ?? 0,
          sellingPrice: pricing?.sellingPrice ?? 0,
          wholesalePrice: pricing?.wholesalePrice ?? 0,
          resellerPrice: pricing?.resellerPrice ?? 0,
          comparePrice: pricing?.comparePrice,
          promotionalPrice: pricing?.promotionalPrice,
          profitMargin: pricing?.profitMargin ?? 0,
          profitAmount: pricing?.profitAmount ?? 0,
          currency: pricing?.currency ?? "BDT",
          pricingRule: pricing?.pricingRule ?? "fixed",
          status: pricing?.status ?? "inactive",
          pricingProfile: "",
          isOverridden: pricing?.pricingRule === "fixed",
          isLocked: false,
          availableStock: inventory?.availableStock ?? 0,
          lastPriceUpdate: pricing?.updatedAt?.toString(),
          productHealth: 0,
        };
      } catch { return null; }
    }));

    return { success: true, data: results.filter(Boolean) as any[] };
  } catch (err: unknown) {
    logger.error("Product pricing search failed", err);
    return { success: false, error: "Search failed" };
  }
}

export async function recalculatePricesAction(productId: string, variantSku?: string): Promise<{
  success: boolean; data?: { sellingPrice: number; wholesalePrice: number; resellerPrice: number };
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Pricing.Update");
  try {
    const PricingService = (await import("../services/pricing-service")).PricingService;
    const PricingEngineService = (await import("../services/pricing-engine-service")).PricingEngineService;
    const engine = new PricingEngineService();
    const pricingService = new PricingService();
    const pricing = await pricingService.getPricingByProduct(productId, variantSku);
    if (!pricing) return { success: false, error: "Pricing not found" };

    const [retail, wholesale, reseller] = await Promise.all([
      engine.calculatePrice({ productId, costPrice: pricing.baseCostPrice, quantity: 1, role: "customer", variantSku }),
      engine.calculatePrice({ productId, costPrice: pricing.baseCostPrice, quantity: 1, role: "wholesaler", variantSku }),
      engine.calculatePrice({ productId, costPrice: pricing.baseCostPrice, quantity: 1, role: "reseller", variantSku }),
    ]);

    await pricingService.updatePricing(pricing.id, {
      sellingPrice: retail.unitPrice,
      wholesalePrice: wholesale.unitPrice,
      resellerPrice: reseller.unitPrice,
    }, session?.user?.id);

    return {
      success: true,
      data: { sellingPrice: retail.unitPrice, wholesalePrice: wholesale.unitPrice, resellerPrice: reseller.unitPrice },
    };
  } catch (err: unknown) {
    logger.error("Price recalculation failed", err);
    return { success: false, error: "Recalculation failed" };
  }
}

export async function listAllPricingForSearchAction(query?: string) {
  const session = await auth();
  checkPermission(session, "Pricing.View");
  const all = await pricingService.exportPricing({});
  const items = all.map((p) => ({
    id: p.id,
    productId: p.productId,
    variantSku: p.variantSku,
    baseCostPrice: p.baseCostPrice,
    sellingPrice: p.sellingPrice,
    wholesalePrice: p.wholesalePrice,
    resellerPrice: p.resellerPrice,
    comparePrice: p.comparePrice,
    currency: p.currency,
    profitMargin: p.profitMargin,
    pricingRule: p.pricingRule,
    status: p.status,
    hasManualOverride: p.pricingRule === "fixed",
  }));
  if (query) {
    const q = query.toLowerCase();
    return { success: true, data: items.filter((i) => i.productId.toLowerCase().includes(q) || (i.variantSku?.toLowerCase() ?? "").includes(q)) };
  }
  return { success: true, data: items };
}
