import { BaseDBEntity } from "@/lib/database/types";

export type CampaignType = "campaign" | "flash_sale" | "festival" | "seasonal" | "clearance";

export interface CampaignPricing extends BaseDBEntity {
  name: string;
  campaignType: CampaignType;
  productId: string;
  variantSku?: string;
  campaignPrice: number;
  effectiveFrom: Date;
  effectiveTo: Date;
  timezone: string;
  priority: number;
  isActive: boolean;
  autoRestore: boolean;
  description?: string;
}

export interface ScheduledPricing extends BaseDBEntity {
  productId: string;
  variantSku?: string;
  scheduledPrice: number;
  scheduledCost?: number;
  effectiveFrom: Date;
  effectiveTo: Date;
  timezone: string;
  autoEnable: boolean;
  autoDisable: boolean;
  isActive: boolean;
  status: "pending" | "active" | "expired" | "cancelled";
}
