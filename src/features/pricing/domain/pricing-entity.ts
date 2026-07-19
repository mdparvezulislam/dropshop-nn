import { BaseDBEntity } from "@/shared/lib/database/types";

export type PricingRuleType =
  "fixed" | "percentage" | "supplier_based" | "category_based" | "brand_based" | "dynamic";

export type PricingStatus = "active" | "inactive" | "scheduled" | "expired";

export interface PricingRuleConfig {
  baseField?: "baseCostPrice" | "purchasePrice" | "supplierPrice" | "sellingPrice";
  percentage?: number;
  fixedAmount?: number;
  categoryId?: string;
  brandId?: string;
  supplierId?: string;
  minMargin?: number;
  maxDiscount?: number;
}

export interface ProductPricing extends BaseDBEntity {
  productId: string;
  variantSku?: string;
  baseCostPrice: number;
  purchasePrice: number;
  supplierPrice: number;
  sellingPrice: number;
  wholesalePrice: number;
  resellerPrice: number;
  comparePrice: number;
  promotionalPrice?: number;
  discountAmount: number;
  discountPercentage: number;
  profitMargin: number;
  profitAmount: number;
  currency: string;
  taxRate: number;
  taxInclusive: boolean;
  commissionRate: number;
  pricingRule: PricingRuleType;
  ruleConfig?: PricingRuleConfig;
  status: PricingStatus;
  effectiveFrom?: Date | null;
  effectiveTo?: Date | null;
}

export interface ProfitBreakdown {
  costBasis: number;
  revenue: number;
  profitAmount: number;
  profitMargin: number;
  taxAmount: number;
  commissionAmount: number;
  netProfit: number;
}

export interface BulkPriceUpdateItem {
  productId: string;
  variantSku?: string;
  sellingPrice?: number;
  wholesalePrice?: number;
  resellerPrice?: number;
  promotionalPrice?: number;
  discountPercentage?: number;
  currency?: string;
}

export default ProductPricing;
