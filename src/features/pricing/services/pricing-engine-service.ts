import { PricingService } from "./pricing-service";
import { ProfitCalculationService } from "./profit-calculation-service";
import { GlobalPricingRuleRepository, CategoryPricingOverrideRepository, BrandPricingOverrideRepository, SupplierPricingRuleRepository } from "../repositories/global-pricing-repository";
import { PricingProfileRepository } from "../repositories/profile-repository";
import { MoqTierRepository } from "../repositories/moq-repository";
import { CampaignPricingRepository, ScheduledPricingRepository } from "../repositories/campaign-repository";
import { AdditionalCostRepository } from "../repositories/additional-cost-repository";
import { PriceHistoryRepository } from "../repositories/approval-repository";
import { RoundingService } from "./rounding-service";
import { AdditionalCostService } from "./additional-cost-service";
import { GlobalPricingRule, CategoryPricingOverride, BrandPricingOverride, SupplierPricingRule } from "../domain/global-pricing-entity";
import { PricingProfile } from "../domain/pricing-profile-entity";
import { MoqTier, MoqTierEntry } from "../domain/moq-entity";
import { CampaignPricing, ScheduledPricing } from "../domain/campaign-entity";
import { ProductPricing } from "../domain/pricing-entity";
import { logger } from "@/lib/utils/logger";
import { resolveCostBasis } from "@/lib/utils/number-utils";

export interface PriceRequest {
  productId: string;
  variantSku?: string;
  costPrice?: number;
  quantity: number;
  role: "customer" | "reseller" | "wholesaler" | "distributor";
  categoryId?: string;
  brandId?: string;
  supplierId?: string;
  profileId?: string;
  campaignCode?: string;
}

export interface CalculatedPrice {
  unitPrice: number;
  totalPrice: number;
  costBasis: number;
  profitAmount: number;
  profitMargin: number;
  roundedPrice: number;
  appliedRules: string[];
  source: "global" | "category" | "brand" | "supplier" | "profile" | "manual" | "campaign" | "moq";
  moqTier?: MoqTierEntry;
  campaign?: CampaignPricing;
  warnings?: string[];
}

export interface PriceCheckResult {
  allowed: boolean;
  minimumPrice: number;
  maximumDiscount: number;
  warnings: string[];
  blocks: string[];
}

export class PricingEngineService {
  private readonly pricingService: PricingService;
  private readonly profitCalculation: ProfitCalculationService;
  private readonly globalRuleRepo: GlobalPricingRuleRepository;
  private readonly categoryRepo: CategoryPricingOverrideRepository;
  private readonly brandRepo: BrandPricingOverrideRepository;
  private readonly supplierRepo: SupplierPricingRuleRepository;
  private readonly profileRepo: PricingProfileRepository;
  private readonly moqRepo: MoqTierRepository;
  private readonly campaignRepo: CampaignPricingRepository;
  private readonly scheduleRepo: ScheduledPricingRepository;
  private readonly additionalCostService: AdditionalCostService;
  private readonly roundingService: RoundingService;
  private readonly historyRepo: PriceHistoryRepository;

  constructor() {
    this.pricingService = new PricingService();
    this.profitCalculation = new ProfitCalculationService();
    this.globalRuleRepo = new GlobalPricingRuleRepository();
    this.categoryRepo = new CategoryPricingOverrideRepository();
    this.brandRepo = new BrandPricingOverrideRepository();
    this.supplierRepo = new SupplierPricingRuleRepository();
    this.profileRepo = new PricingProfileRepository();
    this.moqRepo = new MoqTierRepository();
    this.campaignRepo = new CampaignPricingRepository();
    this.scheduleRepo = new ScheduledPricingRepository();
    this.additionalCostService = new AdditionalCostService();
    this.roundingService = new RoundingService();
    this.historyRepo = new PriceHistoryRepository();
  }

  async calculatePrice(request: PriceRequest): Promise<CalculatedPrice> {
    const appliedRules: string[] = [];
    const warnings: string[] = [];

    const pricing = await this.pricingService.getPricingByProduct(request.productId, request.variantSku);

    const costBasis = resolveCostBasis({
      baseCostPrice: request.costPrice ?? pricing?.baseCostPrice ?? 0,
      purchasePrice: pricing?.purchasePrice ?? 0,
      supplierPrice: pricing?.supplierPrice ?? 0,
    });

    const additionalCosts = await this.additionalCostService.getTotalAdditionalCosts(
      request.productId, request.variantSku, costBasis,
    );
    const totalCostBasis = costBasis + additionalCosts;

    const activeCampaign = await this.findActiveCampaign(request.productId, request.campaignCode);
    if (activeCampaign) {
      appliedRules.push(`campaign:${activeCampaign.name}`);
      const result = this.buildResult({
        unitPrice: activeCampaign.campaignPrice,
        costBasis: totalCostBasis,
        quantity: request.quantity,
        appliedRules,
        source: "campaign" as const,
        campaign: activeCampaign,
      });
      return this.roundingService.roundPrices(result);
    }

    const channel = this.roleToChannel(request.role);
    const globalRule = await this.globalRuleRepo.findActiveByChannel(channel);
    const profileRule = request.profileId
      ? await this.profileRepo.findById(request.profileId)
      : await this.profileRepo.findDefault();

    if (globalRule.length > 0) {
      const rule = globalRule[0];
      appliedRules.push(`rule:${rule.name}`);
      let unitPrice = this.applyMarkup(totalCostBasis, rule.markupType, rule.markupValue);
      unitPrice = this.applyMinMargin(unitPrice, totalCostBasis, rule.minMarginPercent);
      const result = this.buildResult({ unitPrice, costBasis: totalCostBasis, quantity: request.quantity, appliedRules, source: "global" });
      if (profileRule) appliedRules.push(`profile:${profileRule.name}`);
      return this.roundingService.roundPrices(result);
    }

    if (request.supplierId) {
      const supplierRule = await this.supplierRepo.findBySupplierId(request.supplierId);
      if (supplierRule) {
        appliedRules.push(`supplier:${supplierRule.supplierName}`);
        let unitPrice = this.applyMarkup(totalCostBasis, supplierRule.markupType, supplierRule.markupValue);
        unitPrice = this.applyMinMargin(unitPrice, totalCostBasis, supplierRule.minMarginPercent);
        const result = this.buildResult({ unitPrice, costBasis: totalCostBasis, quantity: request.quantity, appliedRules, source: "supplier" });
        return this.roundingService.roundPrices(result);
      }
    }

    if (request.brandId) {
      const brandRule = await this.brandRepo.findByBrandId(request.brandId);
      if (brandRule) {
        appliedRules.push(`brand:${brandRule.brandName}`);
        let unitPrice = this.applyMarkup(totalCostBasis, brandRule.markupType, brandRule.markupValue);
        unitPrice = this.applyMinMargin(unitPrice, totalCostBasis, brandRule.minProfitPercent);
        const result = this.buildResult({ unitPrice, costBasis: totalCostBasis, quantity: request.quantity, appliedRules, source: "brand" });
        return this.roundingService.roundPrices(result);
      }
    }

    if (request.categoryId) {
      const categoryRule = await this.categoryRepo.findByCategoryId(request.categoryId);
      if (categoryRule) {
        appliedRules.push(`category:${categoryRule.categoryName}`);
        let unitPrice = this.applyMarkup(totalCostBasis, categoryRule.markupType, categoryRule.markupValue);
        unitPrice = this.applyMinMargin(unitPrice, totalCostBasis, categoryRule.minMarginPercent);
        const result = this.buildResult({ unitPrice, costBasis: totalCostBasis, quantity: request.quantity, appliedRules, source: "category" });
        return this.roundingService.roundPrices(result);
      }
    }

    if (profileRule) {
      appliedRules.push(`profile:${profileRule.name}`);
      const channelRule = profileRule.markupRules.find((r) => r.channel === channel);
      if (channelRule) {
        let unitPrice = this.applyMarkup(totalCostBasis, channelRule.markupType, channelRule.markupValue);
        unitPrice = this.applyMinMargin(unitPrice, totalCostBasis, profileRule.minMarginPercent);
        const result = this.buildResult({ unitPrice, costBasis: totalCostBasis, quantity: request.quantity, appliedRules, source: "profile" });
        return this.roundingService.roundPrices(result);
      }
    }

    if (pricing) {
      appliedRules.push("manual:pricing_record");
      const unitPrice = this.getPriceByRole(pricing, request.role);
      const result = this.buildResult({ unitPrice, costBasis: totalCostBasis, quantity: request.quantity, appliedRules, source: "manual" });
      return this.roundingService.roundPrices(result);
    }

    if (totalCostBasis > 0) {
      appliedRules.push("default:cost_plus_20");
      const unitPrice = Math.round(totalCostBasis * 1.2);
      const result = this.buildResult({ unitPrice, costBasis: totalCostBasis, quantity: request.quantity, appliedRules, source: "manual" });
      return this.roundingService.roundPrices(result);
    }

    return {
      unitPrice: 0, totalPrice: 0, costBasis: 0,
      profitAmount: 0, profitMargin: 0, roundedPrice: 0,
      appliedRules: [], source: "manual", warnings: ["No pricing data available"],
    };
  }

  async checkPriceProtection(
    productId: string,
    proposedPrice: number,
    role: string,
    quantity: number = 1,
    discount?: number,
  ): Promise<PriceCheckResult> {
    const warnings: string[] = [];
    const blocks: string[] = [];
    const pricing = await this.pricingService.getPricingByProduct(productId);
    const costBasis = resolveCostBasis({
      baseCostPrice: pricing?.baseCostPrice ?? 0,
      purchasePrice: pricing?.purchasePrice ?? 0,
      supplierPrice: pricing?.supplierPrice ?? 0,
    });

    let minimumPrice = costBasis;

    const channel = this.roleToChannel(role);
    const globalRules = await this.globalRuleRepo.findActiveByChannel(channel);
    for (const rule of globalRules) {
      if (rule.minMarginPercent) {
        const minSell = Math.ceil(costBasis / (1 - rule.minMarginPercent / 100));
        minimumPrice = Math.max(minimumPrice, minSell);
      }
      if (rule.maxDiscount !== undefined && discount !== undefined && discount > rule.maxDiscount) {
        warnings.push(`Max discount ${rule.maxDiscount}% exceeded (${discount}%)`);
        blocks.push(`Discount exceeds global ${channel} limit of ${rule.maxDiscount}%`);
      }
    }

    if (proposedPrice < minimumPrice) {
      warnings.push(`Proposed price ${proposedPrice} is below minimum allowed ${minimumPrice}`);
      blocks.push(`Selling price below minimum allowed price (cost basis protection)`);
    }

    const margin = this.profitCalculation.calculateProfitMargin(proposedPrice, costBasis);
    if (margin < 0) {
      warnings.push(`Negative profit margin (${margin.toFixed(1)}%)`);
    } else if (margin < 5) {
      warnings.push(`Very low profit margin: ${margin.toFixed(1)}%`);
    }

    return { allowed: blocks.length === 0, minimumPrice, maximumDiscount: 100, warnings, blocks };
  }

  async resolveMoqPrice(productId: string, quantity: number, variantSku?: string): Promise<{ price: number; tier: MoqTierEntry | null }> {
    const moqTier = await this.moqRepo.findByProduct(productId, variantSku);
    if (!moqTier || !moqTier.isActive) return { price: 0, tier: null };

    const sorted = [...moqTier.tiers].sort((a, b) => b.minQuantity - a.minQuantity);

    for (const tier of sorted) {
      if (quantity >= tier.minQuantity) {
        if (!tier.maxQuantity || quantity <= tier.maxQuantity) {
          return { price: tier.price, tier };
        }
      }
    }

    return { price: 0, tier: null };
  }

  async simulatePrice(input: {
    costPrice: number;
    categoryId?: string;
    brandId?: string;
    supplierId?: string;
    profileId?: string;
    quantity: number;
    role: "customer" | "reseller" | "wholesaler" | "distributor";
    campaignCode?: string;
  }): Promise<{
    retailPrice: number;
    wholesalePrice: number;
    resellerPrice: number;
    distributorPrice: number;
    campaignPrice?: number;
    profit: number;
    margin: number;
    netProfit: number;
    roundedPrice: number;
  }> {
    const baseRequest: Omit<PriceRequest, "role"> = {
      productId: "simulation",
      costPrice: input.costPrice,
      quantity: input.quantity,
      categoryId: input.categoryId,
      brandId: input.brandId,
      supplierId: input.supplierId,
      profileId: input.profileId,
      campaignCode: input.campaignCode,
    };

    const retail = await this.calculatePrice({ ...baseRequest, role: "customer" });
    const wholesale = await this.calculatePrice({ ...baseRequest, role: "wholesaler" });
    const reseller = await this.calculatePrice({ ...baseRequest, role: "reseller" });
    const distributor = await this.calculatePrice({ ...baseRequest, role: "distributor" });

    let campaignPrice: number | undefined;
    const campaign = await this.findActiveCampaign("simulation", input.campaignCode);
    if (campaign) campaignPrice = campaign.campaignPrice;

    return {
      retailPrice: retail.roundedPrice,
      wholesalePrice: wholesale.roundedPrice,
      resellerPrice: reseller.roundedPrice,
      distributorPrice: distributor.roundedPrice,
      campaignPrice,
      profit: retail.profitAmount,
      margin: retail.profitMargin,
      netProfit: retail.profitAmount,
      roundedPrice: retail.roundedPrice,
    };
  }

  private async findActiveCampaign(productId: string, campaignCode?: string): Promise<CampaignPricing | null> {
    if (productId === "simulation" && campaignCode) return null;
    const campaigns = await this.campaignRepo.findActiveByProduct(productId);
    if (campaignCode) {
      return campaigns.find((c) => c.name === campaignCode || c.id === campaignCode) ?? campaigns[0] ?? null;
    }
    return campaigns[0] ?? null;
  }

  private buildResult(data: {
    unitPrice: number; costBasis: number; quantity: number;
    appliedRules: string[]; source: CalculatedPrice["source"];
    campaign?: CampaignPricing;
  }): CalculatedPrice {
    const totalPrice = data.unitPrice * data.quantity;
    const profitAmount = this.profitCalculation.calculateProfitAmount(data.unitPrice, data.costBasis);
    const profitMargin = this.profitCalculation.calculateProfitMargin(data.unitPrice, data.costBasis);

    return {
      unitPrice: data.unitPrice,
      totalPrice,
      costBasis: data.costBasis,
      profitAmount,
      profitMargin,
      roundedPrice: data.unitPrice,
      appliedRules: data.appliedRules,
      source: data.source,
      campaign: data.campaign,
    };
  }

  private applyMarkup(base: number, type: "percentage" | "fixed_amount", value: number): number {
    if (base <= 0) return base;
    if (type === "percentage") return Math.round(base * (1 + value / 100));
    return Math.round(base + value);
  }

  private applyMinMargin(price: number, cost: number, minMarginPercent?: number): number {
    if (minMarginPercent === undefined || price <= 0) return price;
    const minPrice = Math.ceil(cost / (1 - minMarginPercent / 100));
    return Math.max(price, minPrice);
  }

  private getPriceByRole(pricing: ProductPricing, role: string): number {
    switch (role) {
      case "wholesaler": return pricing.wholesalePrice || pricing.sellingPrice;
      case "reseller": return pricing.resellerPrice || pricing.sellingPrice;
      case "distributor": return pricing.wholesalePrice || pricing.sellingPrice;
      default: return pricing.sellingPrice;
    }
  }

  private roleToChannel(role: string): "retail" | "wholesale" | "reseller" | "distributor" | "vip_reseller" | "marketplace" {
    const map: Record<string, "retail" | "wholesale" | "reseller" | "distributor" | "vip_reseller" | "marketplace"> = {
      customer: "retail",
      wholesaler: "wholesale",
      reseller: "reseller",
      distributor: "distributor",
    };
    return map[role] || "retail";
  }
}
