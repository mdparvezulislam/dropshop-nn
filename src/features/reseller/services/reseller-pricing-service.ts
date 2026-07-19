import { roundTo } from "@/shared/utils/number-utils";
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
 * Reseller-specific pricing math. Does NOT mutate master Product or ProductPricing.
 * All amounts in integer cents.
 */
export class ResellerPricingService {
  calculateProfitAmount(sellingPrice: number, costBasis: number): number {
    return sellingPrice - costBasis;
  }

  calculateProfitMargin(sellingPrice: number, costBasis: number): number {
    if (sellingPrice <= 0) return 0;
    return roundTo(((sellingPrice - costBasis) / sellingPrice) * 100, 2);
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
      percentage = sellingPrice > 0 ? roundTo((amount / sellingPrice) * 100, 2) : 0;
    }

    const effectivePrice = Math.max(0, sellingPrice - amount);
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
