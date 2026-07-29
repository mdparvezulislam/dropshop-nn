export type PricingSource = "retail" | "reseller" | "wholesale" | "campaign" | "flash_sale";

export interface PricingLineItem {
  productId: string;
  variantSku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  pricingSource: PricingSource;
  campaignId?: string;
  appliedRules?: string[];
}

export interface PricingTotals {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  /** Delivery charge in minor units; always included in grandTotal. */
  shippingTotal?: number;
  advancePaid?: number;
  dueAmount?: number;
  grandTotal: number;
  currency: string;
}

export interface ProfitSummary {
  totalCostBasis: number;
  totalRevenue: number;
  totalProfit: number;
  averageMargin: number;
}
