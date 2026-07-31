/**
 * Unified Pricing Engine for NN Enterprise Commerce OS.
 *
 * Single Source of Truth for all pricing formulas across the platform.
 * Formula: Selling Price = Cost Price + (Cost Price * Markup %)
 */

export interface GlobalPricingDefaults {
  retailMarkup: number; // default: 40%
  wholesaleMarkup: number; // default: 30%
  resellerMarkup: number; // default: 22%
}

export interface PricingOverridesInput {
  useOverrides?: boolean;
  retailMarkup?: number;
  wholesaleMarkup?: number;
  resellerMarkup?: number;
}

export interface PricingCalculationResult {
  costPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  resellerBasePrice: number;
  effectiveRetailMarkup: number;
  effectiveWholesaleMarkup: number;
  effectiveResellerMarkup: number;
  isRetailOverridden: boolean;
  isWholesaleOverridden: boolean;
  isResellerOverridden: boolean;
}

export type CustomerPricingTier = "guest" | "customer" | "retail" | "wholesale" | "reseller" | "admin";

export class UnifiedPricingEngine {
  public static readonly DEFAULT_MARKUPS: GlobalPricingDefaults = {
    retailMarkup: 40,
    wholesaleMarkup: 30,
    resellerMarkup: 22,
  };

  /**
   * Calculates prices from base cost price using global defaults and product overrides.
   * Formula: Selling Price = Cost Price + (Cost Price * Markup %)
   */
  public static calculatePrices(
    costPrice: number,
    overrides?: PricingOverridesInput,
    globalDefaults: GlobalPricingDefaults = UnifiedPricingEngine.DEFAULT_MARKUPS,
  ): PricingCalculationResult {
    const cost = Math.max(0, costPrice);

    const useOverrides = Boolean(overrides?.useOverrides);
    const retailMarkup =
      useOverrides && overrides?.retailMarkup !== undefined
        ? overrides.retailMarkup
        : globalDefaults.retailMarkup;
    const wholesaleMarkup =
      useOverrides && overrides?.wholesaleMarkup !== undefined
        ? overrides.wholesaleMarkup
        : globalDefaults.wholesaleMarkup;
    const resellerMarkup =
      useOverrides && overrides?.resellerMarkup !== undefined
        ? overrides.resellerMarkup
        : globalDefaults.resellerMarkup;

    const retailPrice = Math.round(cost * (1 + retailMarkup / 100));
    const wholesalePrice = Math.round(cost * (1 + wholesaleMarkup / 100));
    const resellerBasePrice = Math.round(cost * (1 + resellerMarkup / 100));

    return {
      costPrice: cost,
      retailPrice,
      wholesalePrice,
      resellerBasePrice,
      effectiveRetailMarkup: retailMarkup,
      effectiveWholesaleMarkup: wholesaleMarkup,
      effectiveResellerMarkup: resellerMarkup,
      isRetailOverridden: useOverrides && overrides?.retailMarkup !== undefined,
      isWholesaleOverridden: useOverrides && overrides?.wholesaleMarkup !== undefined,
      isResellerOverridden: useOverrides && overrides?.resellerMarkup !== undefined,
    };
  }

  /**
   * Resolves final price for a specific customer role / tier.
   */
  public static resolvePriceForCustomer(
    result: PricingCalculationResult,
    tier: CustomerPricingTier = "retail",
  ): number {
    switch (tier) {
      case "wholesale":
        return result.wholesalePrice;
      case "reseller":
        return result.resellerBasePrice;
      case "guest":
      case "customer":
      case "retail":
      case "admin":
      default:
        return result.retailPrice;
    }
  }

  /**
   * Reseller custom selling price & profit calculator.
   */
  public static calculateResellerMargin(
    resellerBasePrice: number,
    desiredSellingPrice: number,
  ): {
    profitAmount: number;
    profitMarginPercent: number;
    isValid: boolean;
  } {
    const base = Math.max(0, resellerBasePrice);
    const selling = Math.max(0, desiredSellingPrice);
    const profitAmount = selling - base;
    const profitMarginPercent = selling > 0 ? (profitAmount / selling) * 100 : 0;
    const isValid = selling >= base;

    return {
      profitAmount: Math.max(0, profitAmount),
      profitMarginPercent: Math.round(profitMarginPercent * 100) / 100,
      isValid,
    };
  }
}
