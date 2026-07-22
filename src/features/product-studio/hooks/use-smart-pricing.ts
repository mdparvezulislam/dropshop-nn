import * as React from "react";
import { DEFAULT_PRICING_SETTINGS, type PricingSettings } from "../types/studio-types";

export interface PricingState {
  costPrice: string;
  sellingPrice: string;
  wholesalePrice: string;
  resellerPrice: string;
  comparePrice: string;
  campaignPrice?: string;
}

export interface SmartPricingResult {
  cost: number;
  retail: number;
  wholesale: number;
  reseller: number;
  campaign: number;
  compare: number;
  profit: number;
  marginPct: number;
  markupPct: number;
  breakEven: number;
  discountPct: number;
  warnings: string[];
  calculateAutoPrices: (cost: number) => Partial<PricingState>;
}

export function useSmartPricing(
  pricingState: PricingState,
  settings: PricingSettings = DEFAULT_PRICING_SETTINGS,
): SmartPricingResult {
  const cost = parseFloat(pricingState.costPrice) || 0;
  const retail = parseFloat(pricingState.sellingPrice) || 0;
  const wholesale = parseFloat(pricingState.wholesalePrice) || 0;
  const reseller = parseFloat(pricingState.resellerPrice) || 0;
  const compare = parseFloat(pricingState.comparePrice) || 0;
  const campaign = parseFloat(pricingState.campaignPrice || "0") || 0;

  const profit = retail - cost;
  const marginPct = retail > 0 ? (profit / retail) * 100 : 0;
  const markupPct = cost > 0 ? (profit / cost) * 100 : 0;
  const breakEven = cost;
  const discountPct = compare > 0 && compare > retail ? ((compare - retail) / compare) * 100 : 0;

  const calculateAutoPrices = React.useCallback(
    (inputCost: number): Partial<PricingState> => {
      if (inputCost <= 0) return {};
      return {
        sellingPrice: (inputCost * settings.retailMultiplier).toFixed(2),
        wholesalePrice: (inputCost * settings.wholesaleMultiplier).toFixed(2),
        resellerPrice: (inputCost * settings.resellerMultiplier).toFixed(2),
        campaignPrice: (inputCost * settings.campaignMultiplier).toFixed(2),
      };
    },
    [settings],
  );

  const warnings = React.useMemo(() => {
    const list: string[] = [];
    if (cost > 0 && retail > 0 && retail < cost) {
      list.push("Selling price is less than cost price (Negative Margin).");
    }
    if (retail > 0 && profit < 0) {
      list.push("Product sale will result in net loss.");
    }
    if (compare > 0 && retail > compare) {
      list.push("Selling price is higher than Compare-at price.");
    }
    if (campaign > 0 && retail > 0 && campaign > retail) {
      list.push("Campaign price cannot exceed regular retail price.");
    }
    return list;
  }, [cost, retail, profit, compare, campaign]);

  return {
    cost,
    retail,
    wholesale,
    reseller,
    campaign,
    compare,
    profit,
    marginPct,
    markupPct,
    breakEven,
    discountPct,
    warnings,
    calculateAutoPrices,
  };
}
