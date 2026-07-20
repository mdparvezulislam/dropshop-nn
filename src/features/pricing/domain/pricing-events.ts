export const PRICING_EVENTS = {
  CREATED: "pricing.created",
  UPDATED: "pricing.updated",
  WHOLESALE_TIER_CREATED: "pricing.wholesale_tier_created",
  WHOLESALE_TIER_UPDATED: "pricing.wholesale_tier_updated",
  WHOLESALE_TIER_DELETED: "pricing.wholesale_tier_deleted",
  CAMPAIGN_STARTED: "pricing.campaign_started",
  CAMPAIGN_ENDED: "pricing.campaign_ended",
  PROFIT_RULE_UPDATED: "pricing.profit_rule_updated",
  MINIMUM_SELLING_PRICE_CHANGED: "pricing.minimum_selling_price_changed",
  RECOMMENDED_SELLING_PRICE_CHANGED: "pricing.recommended_selling_price_changed",
  MEDIA_VISIBILITY_CHANGED: "pricing.media_visibility_changed",
} as const;

export type PricingEventType = (typeof PRICING_EVENTS)[keyof typeof PRICING_EVENTS];

export interface PricingCreatedPayload {
  productId: string;
  variantSku?: string;
  retailPrice: number;
  resellerPrice: number;
  wholesaleBasePrice: number;
  totalCost: number;
  createdAt: string;
}

export interface PricingUpdatedPayload {
  productId: string;
  variantSku?: string;
  changedFields: string[];
  updatedAt: string;
}

export interface WholesaleTierCreatedPayload {
  productId: string;
  minQty: number;
  price: number;
}

export interface WholesaleTierUpdatedPayload {
  productId: string;
  minQty: number;
  changedFields: string[];
}

export interface WholesaleTierDeletedPayload {
  productId: string;
  minQty: number;
}

export interface CampaignStartedPayload {
  campaignId: string;
  productId: string;
  campaignType: "campaign" | "flash_sale" | "festival";
  campaignPrice: number;
  effectiveFrom: string;
  effectiveTo: string;
}

export interface CampaignEndedPayload {
  campaignId: string;
  productId: string;
}

export interface ProfitRuleUpdatedPayload {
  productId: string;
  changedFields: string[];
}

export interface MinimumSellingPriceChangedPayload {
  productId: string;
  oldValue: number;
  newValue: number;
}

export interface RecommendedSellingPriceChangedPayload {
  productId: string;
  oldValue: number;
  newValue: number;
}

export interface MediaVisibilityChangedPayload {
  productId: string;
  mediaId: string;
  collection: string;
}

export type PricingEventPayloads = {
  [PRICING_EVENTS.CREATED]: PricingCreatedPayload;
  [PRICING_EVENTS.UPDATED]: PricingUpdatedPayload;
  [PRICING_EVENTS.WHOLESALE_TIER_CREATED]: WholesaleTierCreatedPayload;
  [PRICING_EVENTS.WHOLESALE_TIER_UPDATED]: WholesaleTierUpdatedPayload;
  [PRICING_EVENTS.WHOLESALE_TIER_DELETED]: WholesaleTierDeletedPayload;
  [PRICING_EVENTS.CAMPAIGN_STARTED]: CampaignStartedPayload;
  [PRICING_EVENTS.CAMPAIGN_ENDED]: CampaignEndedPayload;
  [PRICING_EVENTS.PROFIT_RULE_UPDATED]: ProfitRuleUpdatedPayload;
  [PRICING_EVENTS.MINIMUM_SELLING_PRICE_CHANGED]: MinimumSellingPriceChangedPayload;
  [PRICING_EVENTS.RECOMMENDED_SELLING_PRICE_CHANGED]: RecommendedSellingPriceChangedPayload;
  [PRICING_EVENTS.MEDIA_VISIBILITY_CHANGED]: MediaVisibilityChangedPayload;
};
