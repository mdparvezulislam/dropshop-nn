import { BaseDBEntity } from "@/shared/lib/database/types";

export interface MoqTier extends BaseDBEntity {
  productId: string;
  variantSku?: string;
  tiers: MoqTierEntry[];
  isActive: boolean;
}

export interface MoqTierEntry {
  minQuantity: number;
  maxQuantity?: number;
  price: number;
  discountPercent?: number;
  label?: string;
}
