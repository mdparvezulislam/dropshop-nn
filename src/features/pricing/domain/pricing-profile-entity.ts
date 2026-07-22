import { BaseDBEntity } from "@/shared/lib/database/types";

export interface ProfileMarkupRule {
  channel: "retail" | "wholesale" | "reseller" | "distributor";
  markupType: "percentage" | "fixed_amount";
  markupValue: number;
}

export interface ProfileDiscountRule {
  type: "percentage" | "fixed_amount";
  value: number;
  minOrderValue?: number;
}

export interface PricingProfile extends BaseDBEntity {
  name: string;
  slug: string;
  description?: string;
  markupRules: ProfileMarkupRule[];
  discountRules: ProfileDiscountRule[];
  minMarginPercent: number;
  roundPriceTo?: number;
  isActive: boolean;
  isDefault: boolean;
}
