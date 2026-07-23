import { BaseDBEntity } from "@/lib/database/types";

export type MarkupType = "percentage" | "fixed_amount";

export type RoundPriceTo = 1 | 5 | 10 | 50 | 100 | 500 | 1000;

export interface GlobalPricingRule extends BaseDBEntity {
  name: string;
  channel: "retail" | "wholesale" | "reseller" | "distributor" | "vip_reseller" | "marketplace";
  markupType: MarkupType;
  markupValue: number;
  roundPriceTo?: RoundPriceTo;
  minProfit?: number;
  maxDiscount?: number;
  minMarginPercent?: number;
  isActive: boolean;
  priority: number;
}

export interface CategoryPricingOverride extends BaseDBEntity {
  categoryId: string;
  categoryName: string;
  markupType: MarkupType;
  markupValue: number;
  minMarginPercent?: number;
  maxDiscountPercent?: number;
  isActive: boolean;
  priority: number;
}

export interface BrandPricingOverride extends BaseDBEntity {
  brandId: string;
  brandName: string;
  channel: "retail" | "wholesale" | "reseller" | "distributor";
  markupType: MarkupType;
  markupValue: number;
  minProfitPercent?: number;
  maxDiscountPercent?: number;
  isActive: boolean;
  priority: number;
}

export interface SupplierPricingRule extends BaseDBEntity {
  supplierId: string;
  supplierName: string;
  markupType: MarkupType;
  markupValue: number;
  minMarginPercent?: number;
  priority: number;
  leadCost?: number;
  handlingFee?: number;
  isActive: boolean;
}
