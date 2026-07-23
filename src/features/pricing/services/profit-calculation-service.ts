import { roundTo, resolveCostBasis } from "@/lib/utils/number-utils";
import { ProfitBreakdown } from "../domain/pricing-entity";

export interface ProfitCalculationInput {
  sellingPrice: number;
  costBasis: number;
  taxRate?: number;
  taxInclusive?: boolean;
  commissionRate?: number;
  discountAmount?: number;
  discountPercentage?: number;
  promotionalPrice?: number;
}

export class ProfitCalculationService {
  resolveEffectiveSellingPrice(input: ProfitCalculationInput): number {
    if (input.promotionalPrice !== undefined && input.promotionalPrice !== null) {
      return input.promotionalPrice;
    }

    let price = input.sellingPrice;

    if (input.discountAmount && input.discountAmount > 0) {
      price = Math.max(0, price - input.discountAmount);
    } else if (input.discountPercentage && input.discountPercentage > 0) {
      price = Math.max(0, Math.round(price * (1 - input.discountPercentage / 100)));
    }

    return price;
  }

  calculateProfitAmount(sellingPrice: number, costBasis: number): number {
    return sellingPrice - costBasis;
  }

  calculateProfitMargin(sellingPrice: number, costBasis: number): number {
    if (sellingPrice <= 0) return 0;
    const profit = this.calculateProfitAmount(sellingPrice, costBasis);
    return roundTo((profit / sellingPrice) * 100, 2);
  }

  calculateDiscountAmount(comparePrice: number, sellingPrice: number): number {
    if (comparePrice <= sellingPrice) return 0;
    return comparePrice - sellingPrice;
  }

  calculateDiscountPercentage(comparePrice: number, sellingPrice: number): number {
    if (comparePrice <= 0 || comparePrice <= sellingPrice) return 0;
    return roundTo(((comparePrice - sellingPrice) / comparePrice) * 100, 2);
  }

  calculateTaxAmount(price: number, taxRate: number, taxInclusive: boolean): number {
    if (taxRate <= 0) return 0;
    if (taxInclusive) {
      return Math.round(price - price / (1 + taxRate / 100));
    }
    return Math.round(price * (taxRate / 100));
  }

  calculateCommissionAmount(price: number, commissionRate: number): number {
    if (commissionRate <= 0) return 0;
    return Math.round(price * (commissionRate / 100));
  }

  calculateBreakdown(input: ProfitCalculationInput): ProfitBreakdown {
    const revenue = this.resolveEffectiveSellingPrice(input);
    const costBasis = input.costBasis;
    const profitAmount = this.calculateProfitAmount(revenue, costBasis);
    const profitMargin = this.calculateProfitMargin(revenue, costBasis);
    const taxAmount = this.calculateTaxAmount(
      revenue,
      input.taxRate || 0,
      input.taxInclusive || false,
    );
    const commissionAmount = this.calculateCommissionAmount(revenue, input.commissionRate || 0);
    const netProfit = profitAmount - (input.taxInclusive ? 0 : taxAmount) - commissionAmount;

    return {
      costBasis,
      revenue,
      profitAmount,
      profitMargin,
      taxAmount,
      commissionAmount,
      netProfit,
    };
  }

  derivePricingMetrics(params: {
    sellingPrice: number;
    baseCostPrice: number;
    purchasePrice: number;
    supplierPrice: number;
    comparePrice: number;
    promotionalPrice?: number;
    discountAmount?: number;
    discountPercentage?: number;
    taxRate?: number;
    taxInclusive?: boolean;
    commissionRate?: number;
  }): {
    profitAmount: number;
    profitMargin: number;
    discountAmount: number;
    discountPercentage: number;
  } {
    const costBasis = resolveCostBasis(params);

    const breakdown = this.calculateBreakdown({
      sellingPrice: params.sellingPrice,
      costBasis,
      taxRate: params.taxRate,
      taxInclusive: params.taxInclusive,
      commissionRate: params.commissionRate,
      discountAmount: params.discountAmount,
      discountPercentage: params.discountPercentage,
      promotionalPrice: params.promotionalPrice,
    });

    const effectiveSelling = this.resolveEffectiveSellingPrice({
      sellingPrice: params.sellingPrice,
      costBasis,
      discountAmount: params.discountAmount,
      discountPercentage: params.discountPercentage,
      promotionalPrice: params.promotionalPrice,
    });

    let discountAmount = params.discountAmount ?? 0;
    let discountPercentage = params.discountPercentage ?? 0;

    if (params.comparePrice > 0) {
      if (!params.discountAmount && !params.discountPercentage) {
        discountAmount = this.calculateDiscountAmount(params.comparePrice, effectiveSelling);
        discountPercentage = this.calculateDiscountPercentage(
          params.comparePrice,
          effectiveSelling,
        );
      } else if (params.discountPercentage && !params.discountAmount) {
        discountAmount = Math.round(params.comparePrice * (params.discountPercentage / 100));
      } else if (params.discountAmount && !params.discountPercentage) {
        discountPercentage = this.calculateDiscountPercentage(
          params.comparePrice,
          params.comparePrice - params.discountAmount,
        );
      }
    }

    return {
      profitAmount: breakdown.profitAmount,
      profitMargin: breakdown.profitMargin,
      discountAmount,
      discountPercentage,
    };
  }
}

export default ProfitCalculationService;
