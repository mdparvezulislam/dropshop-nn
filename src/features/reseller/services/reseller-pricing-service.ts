import { ProfitCalculationService } from "@/features/pricing/services/profit-calculation-service";
import { ResellerPricePreview, ResellerProductPricing } from "../domain/reseller-entity";

export interface ResellerPriceInput {
  sellingPrice: number;
  costBasis?: number;
  recommendedPrice?: number;
  discountAmount?: number;
  discountPercentage?: number;
  currency?: string;
  isCustomPrice?: boolean;
}

/**
 * Reseller-specific pricing math. Delegates base calculations to ProfitCalculationService.
 * All amounts in integer cents.
 */
export class ResellerPricingService {
  private readonly profitService: ProfitCalculationService;

  constructor() {
    this.profitService = new ProfitCalculationService();
  }

  calculateProfitAmount(sellingPrice: number, costBasis: number): number {
    return this.profitService.calculateProfitAmount(sellingPrice, costBasis);
  }

  calculateProfitMargin(sellingPrice: number, costBasis: number): number {
    return this.profitService.calculateProfitMargin(sellingPrice, costBasis);
  }

  applyDiscount(
    sellingPrice: number,
    discountAmount?: number,
    discountPercentage?: number,
  ): { effectivePrice: number; discountAmount: number; discountPercentage: number } {
    let amount = discountAmount ?? 0;
    let percentage = discountPercentage ?? 0;

    if (percentage > 0 && !discountAmount) {
      amount = Math.round(sellingPrice * (percentage / 100));
    } else if (amount > 0 && !discountPercentage) {
      percentage = sellingPrice > 0 ? Math.round((amount / sellingPrice) * 10000) / 100 : 0;
    }

    const effectivePrice = this.profitService.resolveEffectiveSellingPrice({
      sellingPrice,
      costBasis: 0,
      discountAmount: amount,
      discountPercentage: percentage,
    });
    return { effectivePrice, discountAmount: amount, discountPercentage: percentage };
  }

  buildPricing(input: ResellerPriceInput): ResellerProductPricing {
    const costBasis = input.costBasis ?? 0;
    const recommendedPrice = input.recommendedPrice ?? input.sellingPrice;
    const { effectivePrice, discountAmount, discountPercentage } = this.applyDiscount(
      input.sellingPrice,
      input.discountAmount,
      input.discountPercentage,
    );

    const profitAmount = this.calculateProfitAmount(effectivePrice, costBasis);
    const profitMargin = this.calculateProfitMargin(effectivePrice, costBasis);

    return {
      sellingPrice: input.sellingPrice,
      discountAmount,
      discountPercentage,
      recommendedPrice,
      costBasis,
      profitAmount,
      profitMargin,
      currency: (input.currency || "USD").toUpperCase(),
      isCustomPrice: input.isCustomPrice ?? true,
    };
  }

  preview(input: ResellerPriceInput): ResellerPricePreview {
    const pricing = this.buildPricing(input);
    const { effectivePrice } = this.applyDiscount(
      pricing.sellingPrice,
      pricing.discountAmount,
      pricing.discountPercentage,
    );

    return {
      sellingPrice: effectivePrice,
      costBasis: pricing.costBasis,
      discountAmount: pricing.discountAmount,
      discountPercentage: pricing.discountPercentage,
      profitAmount: pricing.profitAmount,
      profitMargin: pricing.profitMargin,
      recommendedPrice: pricing.recommendedPrice,
      currency: pricing.currency,
    };
  }

  /**
   * Reset custom price back to recommended (platform) price.
   */
  resetToRecommended(
    recommendedPrice: number,
    costBasis: number,
    currency = "USD",
  ): ResellerProductPricing {
    return this.buildPricing({
      sellingPrice: recommendedPrice,
      costBasis,
      recommendedPrice,
      discountAmount: 0,
      discountPercentage: 0,
      currency,
      isCustomPrice: false,
    });
  }
}

export default ResellerPricingService;
