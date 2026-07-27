import { PricingRepository } from "../repositories/pricing-repository";
import { ProductPricing, PricingRuleType } from "../domain/pricing-entity";
import { ProfitCalculationService } from "./profit-calculation-service";
import { ValidationError, NotFoundError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";
import { PaginationParams, SortParams, PaginatedResult } from "@/types";
import { normalizeVariantSku } from "@/lib/utils/sku-utils";
import {
  CreatePricingInput,
  UpdatePricingInput,
  BulkPriceUpdateInput,
  BulkSupplierPriceUpdateInput,
} from "../types/validation";

export class PricingService {
  private readonly pricingRepository: PricingRepository;
  private readonly profitCalculationService: ProfitCalculationService;

  constructor() {
    this.pricingRepository = new PricingRepository();
    this.profitCalculationService = new ProfitCalculationService();
  }

  private applyPricingRule(
    data: CreatePricingInput | UpdatePricingInput,
    existing?: ProductPricing,
  ): {
    sellingPrice: number;
    wholesalePrice: number;
    resellerPrice: number;
  } {
    const rule: PricingRuleType = data.pricingRule || existing?.pricingRule || "fixed";
    const baseCost = data.baseCostPrice ?? existing?.baseCostPrice ?? 0;
    const purchase = data.purchasePrice ?? existing?.purchasePrice ?? 0;
    const supplier = data.supplierPrice ?? existing?.supplierPrice ?? 0;
    const config = data.ruleConfig || existing?.ruleConfig;

    let sellingPrice = data.sellingPrice ?? existing?.sellingPrice ?? 0;
    let wholesalePrice = data.wholesalePrice ?? existing?.wholesalePrice ?? 0;
    let resellerPrice = data.resellerPrice ?? existing?.resellerPrice ?? 0;

    if (rule === "fixed") {
      return { sellingPrice, wholesalePrice, resellerPrice };
    }

    if (rule === "percentage" && config?.percentage !== undefined) {
      const baseField = config.baseField || "baseCostPrice";
      const baseMap: Record<string, number> = {
        baseCostPrice: baseCost,
        purchasePrice: purchase,
        supplierPrice: supplier,
        sellingPrice: sellingPrice,
      };
      const base = baseMap[baseField] ?? baseCost;
      const computed = Math.round(base * (1 + config.percentage / 100));
      if (data.sellingPrice === undefined) sellingPrice = computed;
      if (data.wholesalePrice === undefined) {
        wholesalePrice = Math.round(base * (1 + (config.percentage * 0.7) / 100));
      }
      if (data.resellerPrice === undefined) {
        resellerPrice = Math.round(base * (1 + (config.percentage * 0.5) / 100));
      }
    }

    if (rule === "supplier_based") {
      const base = supplier || purchase || baseCost;
      const markup = config?.percentage ?? 20;
      if (data.sellingPrice === undefined) {
        sellingPrice = Math.round(base * (1 + markup / 100));
      }
      if (data.wholesalePrice === undefined) {
        wholesalePrice = Math.round(base * (1 + (markup * 0.6) / 100));
      }
      if (data.resellerPrice === undefined) {
        resellerPrice = Math.round(base * (1 + (markup * 0.4) / 100));
      }
    }

    if (rule === "category_based" || rule === "brand_based" || rule === "dynamic") {
      const base = baseCost || purchase || supplier;
      const markup = config?.percentage ?? 25;
      if (data.sellingPrice === undefined && base > 0) {
        sellingPrice = Math.round(base * (1 + markup / 100));
      }
    }

    if (config?.minMargin !== undefined && sellingPrice > 0) {
      const cost = baseCost || purchase || supplier;
      const minSelling = Math.ceil(cost / (1 - config.minMargin / 100));
      if (sellingPrice < minSelling) {
        sellingPrice = minSelling;
      }
    }

    return { sellingPrice, wholesalePrice, resellerPrice };
  }

  private buildPricingPayload(
    data: CreatePricingInput | UpdatePricingInput,
    existing?: ProductPricing,
  ): Record<string, unknown> {
    const applied = this.applyPricingRule(data, existing);

    const baseCostPrice = data.baseCostPrice ?? existing?.baseCostPrice ?? 0;
    const purchasePrice = data.purchasePrice ?? existing?.purchasePrice ?? 0;
    const supplierPrice = data.supplierPrice ?? existing?.supplierPrice ?? 0;
    const comparePrice = data.comparePrice ?? existing?.comparePrice ?? 0;
    const promotionalPrice =
      data.promotionalPrice !== undefined ? data.promotionalPrice : existing?.promotionalPrice;
    const taxRate = data.taxRate ?? existing?.taxRate ?? 0;
    const taxInclusive = data.taxInclusive ?? existing?.taxInclusive ?? false;
    const commissionRate = data.commissionRate ?? existing?.commissionRate ?? 0;

    const metrics = this.profitCalculationService.derivePricingMetrics({
      sellingPrice: applied.sellingPrice,
      baseCostPrice,
      purchasePrice,
      supplierPrice,
      comparePrice,
      promotionalPrice,
      discountAmount: data.discountAmount ?? existing?.discountAmount,
      discountPercentage: data.discountPercentage ?? existing?.discountPercentage,
      taxRate,
      taxInclusive,
      commissionRate,
    });

    return {
      ...data,
      variantSku: normalizeVariantSku(
        data.variantSku !== undefined ? data.variantSku : existing?.variantSku,
      ),
      sellingPrice: applied.sellingPrice,
      wholesalePrice: applied.wholesalePrice,
      resellerPrice: applied.resellerPrice,
      profitAmount: metrics.profitAmount,
      profitMargin: metrics.profitMargin,
      discountAmount: metrics.discountAmount,
      discountPercentage: metrics.discountPercentage,
      currency: (data.currency || existing?.currency || "USD").toUpperCase(),
    };
  }

  async createPricing(data: CreatePricingInput, actorId?: string): Promise<ProductPricing> {
    logger.info("PricingService: creating product pricing", {
      productId: data.productId,
      variantSku: data.variantSku,
    });

    const variantSku = normalizeVariantSku(data.variantSku);
    const existing = await this.pricingRepository.findByProductAndVariant(
      data.productId,
      variantSku,
    );

    if (existing) {
      throw new ValidationError("Pricing already exists for this product/variant", {
        productId: ["A pricing record already exists for this product and variant"],
      });
    }

    const payload = this.buildPricingPayload({ ...data, variantSku });

    const result = await this.pricingRepository.create({
      ...payload,
      createdBy: actorId,
      updatedBy: actorId,
    } as Parameters<PricingRepository["create"]>[0]);

    logger.info("PricingService: pricing created", {
      id: result.id,
      productId: result.productId,
      event: "Price Changed",
    });

    return result;
  }

  async updatePricing(
    id: string,
    data: UpdatePricingInput,
    actorId?: string,
  ): Promise<ProductPricing> {
    logger.info("PricingService: updating product pricing", { id });

    const existing = await this.pricingRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Product pricing not found");
    }

    const payload = this.buildPricingPayload(data, existing);

    const result = await this.pricingRepository.update(id, {
      ...payload,
      updatedBy: actorId,
    } as Parameters<PricingRepository["update"]>[1]);

    logger.info("PricingService: pricing updated", {
      id: result.id,
      productId: result.productId,
      event: "Price Changed",
      previousSellingPrice: existing.sellingPrice,
      newSellingPrice: result.sellingPrice,
    });

    return result;
  }

  async getPricingById(id: string): Promise<ProductPricing> {
    const pricing = await this.pricingRepository.findById(id);
    if (!pricing) {
      throw new NotFoundError("Product pricing not found");
    }
    return pricing;
  }

  /**
   * The price row that applies to a product (optionally a specific variant).
   *
   * A variant without its own row falls back to the product's base row — that
   * is what `ProductVariant.priceAdjustment` is for, so a variant is priced
   * relative to the base rather than being unpriced. Without the fallback a
   * simple product read with no `variantSku` matched nothing (the base row is
   * written stamped with the product's SKU), which is why the PDP showed
   * "contact for price" and checkout refused to quote while listing cards —
   * which pick the row through a different query — showed a price.
   */
  async getPricingByProduct(
    productId: string,
    variantSku?: string,
  ): Promise<ProductPricing | null> {
    const normalized = normalizeVariantSku(variantSku);

    if (normalized) {
      const exact = await this.pricingRepository.findByProductAndVariant(productId, normalized);
      if (exact) return exact;
    }

    return this.pricingRepository.findBaseByProduct(productId);
  }

  /** Strict lookup — used by writes that must not silently target another row. */
  async getExactPricing(productId: string, variantSku?: string): Promise<ProductPricing | null> {
    return this.pricingRepository.findByProductAndVariant(
      productId,
      normalizeVariantSku(variantSku),
    );
  }

  async listPricing(
    filter: object,
    pagination: PaginationParams,
    sort?: SortParams,
  ): Promise<PaginatedResult<ProductPricing>> {
    return this.pricingRepository.listPricing(filter, pagination, sort);
  }

  async bulkUpdatePrices(input: BulkPriceUpdateInput, actorId?: string): Promise<ProductPricing[]> {
    logger.info("PricingService: bulk price update", {
      count: input.items.length,
      event: "Price Changed",
    });

    const results: ProductPricing[] = [];

    for (const item of input.items) {
      const variantSku = normalizeVariantSku(item.variantSku);
      const existing = await this.pricingRepository.findByProductAndVariant(
        item.productId,
        variantSku,
      );

      if (!existing) {
        throw new NotFoundError(
          `Pricing not found for product ${item.productId}${variantSku ? ` / ${variantSku}` : ""}`,
        );
      }

      const updated = await this.updatePricing(
        existing.id,
        {
          sellingPrice: item.sellingPrice,
          wholesalePrice: item.wholesalePrice,
          resellerPrice: item.resellerPrice,
          promotionalPrice: item.promotionalPrice,
          discountPercentage: item.discountPercentage,
          currency: item.currency,
        },
        actorId,
      );
      results.push(updated);
    }

    return results;
  }

  async bulkUpdateSupplierPrices(
    input: BulkSupplierPriceUpdateInput,
    actorId?: string,
  ): Promise<ProductPricing[]> {
    logger.info("PricingService: bulk supplier price update", {
      count: input.items.length,
      event: "Supplier Price Changed",
    });

    const results: ProductPricing[] = [];

    for (const item of input.items) {
      const variantSku = normalizeVariantSku(item.variantSku);
      const existing = await this.pricingRepository.findByProductAndVariant(
        item.productId,
        variantSku,
      );

      if (!existing) {
        throw new NotFoundError(
          `Pricing not found for product ${item.productId}${variantSku ? ` / ${variantSku}` : ""}`,
        );
      }

      const updated = await this.updatePricing(
        existing.id,
        {
          supplierPrice: item.supplierPrice,
          purchasePrice: item.purchasePrice,
          baseCostPrice: item.baseCostPrice,
          pricingRule: existing.pricingRule === "fixed" ? "supplier_based" : existing.pricingRule,
        },
        actorId,
      );
      results.push(updated);
    }

    return results;
  }

  async overridePricing(
    id: string,
    data: UpdatePricingInput,
    actorId?: string,
  ): Promise<ProductPricing> {
    logger.info("PricingService: overriding pricing", { id, event: "Price Changed" });
    return this.updatePricing(id, { ...data, pricingRule: "fixed" }, actorId);
  }

  async softDeletePricing(id: string): Promise<boolean> {
    logger.info("PricingService: soft deleting pricing", { id });
    return this.pricingRepository.delete(id);
  }

  async exportPricing(filter: object = {}): Promise<ProductPricing[]> {
    logger.info("PricingService: exporting pricing records", { event: "Inventory Imported" });
    return this.pricingRepository.find(filter);
  }
}

export default PricingService;
