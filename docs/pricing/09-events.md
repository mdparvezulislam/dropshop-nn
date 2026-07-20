# 09 - Pricing Events

## Event Types

| Event | Payload | Trigger |
|-------|---------|---------|
| `pricing.created` | productId, variantSku | First pricing record created |
| `pricing.updated` | productId, changedFields | Any pricing field updated |
| `pricing.wholesale_tier_created` | productId, minQty, price | New wholesale tier added |
| `pricing.wholesale_tier_updated` | productId, minQty, changedFields | Wholesale tier modified |
| `pricing.wholesale_tier_deleted` | productId, minQty | Wholesale tier removed |
| `pricing.campaign_started` | campaignId, productId, price, effectiveFrom, effectiveTo | Campaign becomes active |
| `pricing.campaign_ended` | campaignId, productId | Campaign expires |
| `pricing.profit_rule_updated` | productId, changedFields | Cost/profit fields changed |
| `pricing.minimum_selling_price_changed` | productId, oldValue, newValue | Min price floor changed |
| `pricing.recommended_selling_price_changed` | productId, oldValue, newValue | Recommended price changed |
| `pricing.media_visibility_changed` | productId, mediaId, collection | Media collection changed |

## Event Payloads

### PricingCreated
```typescript
{
  productId: string;
  variantSku?: string;
  retailPrice: number;
  resellerPrice: number;
  wholesaleBasePrice: number;
  totalCost: number;
  createdAt: string;
}
```

### CampaignStarted
```typescript
{
  campaignId: string;
  productId: string;
  campaignType: "campaign" | "flash_sale" | "festival";
  campaignPrice: number;
  effectiveFrom: string;
  effectiveTo: string;
}
```

## Subscribers

| Event | Downstream Effect |
|-------|------------------|
| `pricing.created` | Catalog: update search metadata; Analytics: track pricing init |
| `pricing.updated` | Search: reindex price data; Cache: invalidate price cache; Dashboard: refresh |
| `pricing.campaign_started` | Checkout: apply campaign price; Notification: notify subscribers; Search: boost ranking |
| `pricing.campaign_ended` | Checkout: revert to base price; Search: revert ranking |
| `pricing.minimum_selling_price_changed` | Reseller Dashboard: update; Order Engine: validate pending orders |
| `pricing.media_visibility_changed` | Catalog: update media access; Cache: invalidate media cache |
