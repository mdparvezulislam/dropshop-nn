import { z } from "zod";

export interface ResellerPriceValidationInput {
  customSellingPrice: number;
  resellerPrice?: number;
  minResellerPrice?: number;
  retailPrice?: number;
}

export interface PricingValidationResult {
  isValid: boolean;
  floorPrice: number;
  validatedSellingPrice: number;
  rawProfit: number;
  profit: number;
  marginPercent: number;
  error?: string;
}

export class PricingValidationService {
  /**
   * Calculates the exact reseller price floor.
   */
  static getResellerFloorPrice(input: {
    resellerPrice?: number;
    minResellerPrice?: number;
  }): number {
    const { resellerPrice, minResellerPrice } = input;
    if (resellerPrice === undefined) return 0;
    return minResellerPrice ?? resellerPrice;
  }

  /**
   * Centralized reseller selling price validation logic.
   * Single Source of Truth for UI, Cart, Checkout, and Server Validation.
   */
  static validateResellerSellingPrice(
    input: ResellerPriceValidationInput,
  ): PricingValidationResult {
    const { customSellingPrice, resellerPrice, minResellerPrice } = input;

    const floorPrice = this.getResellerFloorPrice({ resellerPrice, minResellerPrice });
    const isResellerItem = resellerPrice !== undefined;

    if (!isResellerItem) {
      return {
        isValid: true,
        floorPrice: 0,
        validatedSellingPrice: customSellingPrice,
        rawProfit: 0,
        profit: 0,
        marginPercent: 0,
      };
    }

    const isValid = customSellingPrice >= floorPrice && customSellingPrice > 0;
    const rawProfit = customSellingPrice - resellerPrice;
    const profit = Math.max(0, rawProfit);
    const marginPercent =
      customSellingPrice > 0 && isValid ? Math.round((profit / customSellingPrice) * 100) : 0;

    const error = isValid
      ? undefined
      : `নূন্যতম বিক্রয় মূল্য ৳${floorPrice} (রিসেলার মূল্যের চেয়ে কম দামে বিক্রি করা সম্ভব নয়)`;

    return {
      isValid,
      floorPrice,
      validatedSellingPrice: customSellingPrice,
      rawProfit,
      profit,
      marginPercent,
      error,
    };
  }
}

export const resellerPriceSchema = z.number().min(0, "মূল্য অবশ্যই ধনাত্মক হতে হবে");
