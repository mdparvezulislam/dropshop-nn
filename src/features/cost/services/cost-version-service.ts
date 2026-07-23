import { CostVersionRepository } from "../repositories/cost-version-repository";
import { CostVersion, CostChangeReason } from "../domain/cost-version-entity";
import type { CreateCostVersionInput } from "../types/validation";
import { ValidationError, NotFoundError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";
import { EventBus } from "@/lib/event-bus";

export interface LandedCostBreakdown {
  costPrice: number;
  importCost: number;
  shippingCost: number;
  packagingCost: number;
  handlingCost: number;
  otherExpenses: number;
  landedCost: number;
}

export interface CostComparisonResult {
  versionA: CostVersion;
  versionB: CostVersion;
  costDifference: number;
  costDifferencePercent: number;
  landedCostDifference: number;
  landedCostDifferencePercent: number;
  isIncrease: boolean;
}

export class CostVersionService {
  private readonly repository: CostVersionRepository;

  constructor() {
    this.repository = new CostVersionRepository();
  }

  calculateLandedCost(data: {
    costPrice: number;
    importCost?: number;
    shippingCost?: number;
    packagingCost?: number;
    handlingCost?: number;
    otherExpenses?: number;
  }): LandedCostBreakdown {
    const costPrice = data.costPrice;
    const importCost = data.importCost ?? 0;
    const shippingCost = data.shippingCost ?? 0;
    const packagingCost = data.packagingCost ?? 0;
    const handlingCost = data.handlingCost ?? 0;
    const otherExpenses = data.otherExpenses ?? 0;
    const landedCost = costPrice + importCost + shippingCost + packagingCost + handlingCost + otherExpenses;

    return { costPrice, importCost, shippingCost, packagingCost, handlingCost, otherExpenses, landedCost };
  }

  async createCostVersion(input: CreateCostVersionInput, actor?: { id: string; name?: string }): Promise<CostVersion> {
    logger.info("CostVersionService: creating cost version", {
      productId: input.productId,
      costPrice: input.costPrice,
      reason: input.reason,
    });

    const currentVersion = await this.repository.findCurrentByProduct(input.productId, input.variantSku);
    const nextVersion = await this.repository.getNextVersionNumber(input.productId);

    const landed = this.calculateLandedCost(input);

    if (currentVersion) {
      await this.repository.unsetCurrentVersion(input.productId);
    }

    const result = await this.repository.create({
      productId: input.productId,
      variantSku: input.variantSku,
      versionNumber: nextVersion,
      costPrice: input.costPrice,
      currency: input.currency ?? "BDT",
      supplier: {
        supplierId: input.supplier?.supplierId,
        supplierName: input.supplier?.supplierName,
        supplierSku: input.supplier?.supplierSku,
        invoiceNumber: input.supplier?.invoiceNumber,
        purchaseDate: input.supplier?.purchaseDate,
        purchaseLink: input.supplier?.purchaseLink,
        notes: input.supplier?.notes,
      },
      importCost: landed.importCost,
      shippingCost: landed.shippingCost,
      packagingCost: landed.packagingCost,
      handlingCost: landed.handlingCost,
      otherExpenses: landed.otherExpenses,
      landedCost: landed.landedCost,
      reason: input.reason,
      reasonText: input.reasonText,
      notes: input.notes,
      effectiveDate: input.effectiveDate ?? new Date(),
      isCurrentVersion: true,
      previousCostPrice: currentVersion?.costPrice,
      previousLandedCost: currentVersion?.landedCost,
      changedBy: actor?.id,
      changedByName: actor?.name,
      approvalStatus: "approved",
      createdBy: actor?.id,
      updatedBy: actor?.id,
    } as Parameters<CostVersionRepository["create"]>[0]);

    logger.info("CostVersionService: cost version created", {
      id: result.id,
      productId: result.productId,
      versionNumber: result.versionNumber,
      event: "Cost Changed",
    });

    await EventBus.publish("cost.changed", {
      productId: result.productId,
      variantSku: result.variantSku,
      versionNumber: result.versionNumber,
      oldCost: currentVersion?.costPrice,
      newCost: result.costPrice,
      oldLandedCost: currentVersion?.landedCost,
      newLandedCost: result.landedCost,
      actorId: actor?.id,
    }, { source: "cost-engine" });

    return result;
  }

  async getCurrentCost(productId: string, variantSku?: string): Promise<CostVersion | null> {
    return this.repository.findCurrentByProduct(productId, variantSku);
  }

  async getTimeline(productId: string, variantSku?: string, limit = 50): Promise<CostVersion[]> {
    return this.repository.findVersionsByProduct(productId, variantSku, limit);
  }

  async getVersionById(id: string): Promise<CostVersion> {
    const version = await this.repository.findById(id);
    if (!version) throw new NotFoundError("Cost version not found");
    return version;
  }

  async compareVersions(versionIdA: string, versionIdB: string): Promise<CostComparisonResult> {
    const [versionA, versionB] = await Promise.all([
      this.getVersionById(versionIdA),
      this.getVersionById(versionIdB),
    ]);

    const costDiff = versionB.costPrice - versionA.costPrice;
    const landedDiff = versionB.landedCost - versionA.landedCost;
    const costDiffPct = versionA.costPrice > 0
      ? Math.round((costDiff / versionA.costPrice) * 10000) / 100
      : 0;
    const landedDiffPct = versionA.landedCost > 0
      ? Math.round((landedDiff / versionA.landedCost) * 10000) / 100
      : 0;

    return {
      versionA,
      versionB,
      costDifference: costDiff,
      costDifferencePercent: costDiffPct,
      landedCostDifference: landedDiff,
      landedCostDifferencePercent: landedDiffPct,
      isIncrease: costDiff > 0,
    };
  }

  async approveVersion(id: string, approvedBy: string, approvedByName?: string): Promise<CostVersion> {
    const version = await this.getVersionById(id);
    const result = await this.repository.update(id, {
      approvalStatus: "approved",
      approvedBy,
      approvedByName,
      approvedAt: new Date(),
      updatedBy: approvedBy,
    } as Parameters<CostVersionRepository["update"]>[1]);
    return result;
  }

  async rejectVersion(id: string, rejectedBy: string): Promise<CostVersion> {
    const version = await this.getVersionById(id);
    const result = await this.repository.update(id, {
      approvalStatus: "rejected",
      updatedBy: rejectedBy,
    } as Parameters<CostVersionRepository["update"]>[1]);
    return result;
  }

  async getCostAnalytics(filter?: {
    dateFrom?: Date;
    dateTo?: Date;
    supplierId?: string;
  }): Promise<{
    averageCost: number;
    averageLandedCost: number;
    highestIncrease: { amount: number; version?: CostVersion };
    largestDrop: { amount: number; version?: CostVersion };
    productsUpdatedToday: number;
    pendingApprovals: number;
  }> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const allCurrent = await this.repository.find({ isCurrentVersion: true });
    const todayChanges = await this.repository.find({
      createdAt: { $gte: todayStart },
    } as any);
    const pending = await this.repository.find({
      approvalStatus: "pending",
    } as any);

    const costs = allCurrent.map((c) => c.costPrice);
    const landedCosts = allCurrent.map((c) => c.landedCost);
    const avgCost = costs.length > 0 ? Math.round(costs.reduce((a, b) => a + b, 0) / costs.length) : 0;
    const avgLanded = landedCosts.length > 0 ? Math.round(landedCosts.reduce((a, b) => a + b, 0) / landedCosts.length) : 0;

    let highestInc = 0;
    let highestIncVersion: CostVersion | undefined;
    let largestDrop = 0;
    let largestDropVersion: CostVersion | undefined;

    for (const v of allCurrent) {
      const diff = v.previousCostPrice ? v.costPrice - v.previousCostPrice : 0;
      if (diff > highestInc) { highestInc = diff; highestIncVersion = v; }
      if (diff < largestDrop) { largestDrop = diff; largestDropVersion = v; }
    }

    const uniqueProductsToday = new Set(todayChanges.map((c: any) => c.productId?.toString()));

    return {
      averageCost: avgCost,
      averageLandedCost: avgLanded,
      highestIncrease: { amount: highestInc, version: highestIncVersion },
      largestDrop: { amount: largestDrop, version: largestDropVersion },
      productsUpdatedToday: uniqueProductsToday.size,
      pendingApprovals: pending.length,
    };
  }
}
