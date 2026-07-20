# 05 - Pricing Events

## Overview

Pricing events are published by the Pricing Service whenever product pricing, wholesale tiers, minimum/recommended prices, or campaigns are created, updated, started, or ended.

---

## Event: price.created

Published when pricing is created for a product or variant.

### Payload

```typescript
interface PriceCreatedPayload {
  pricingId: string;
  productId: string;
  variantSku?: string;
  sellingPrice: number;
  wholesalePrice: number;
  resellerPrice: number;
  baseCostPrice: number;
  currency: string;
  pricingRule: string;
  createdBy?: string;
  createdAt: string;
}
```

### Subscribers

| Subscriber         | Action                    | Queue     |
| ------------------ | ------------------------- | --------- |
| SearchIndexHandler | Update search price range | search    |
| AnalyticsHandler   | Track pricing creation    | analytics |

### Validation

- All monetary values in integer cents
- `sellingPrice` must be > 0
- `currency` must be ISO 4217
- `pricingRule` must be a valid rule type

### Retry Strategy

Max 3 retries, exponential backoff. DLQ on exhaustion.

---

## Event: price.updated

Published when pricing fields are modified.

### Payload

```typescript
interface PriceUpdatedPayload {
  pricingId: string;
  productId: string;
  variantSku?: string;
  changes: {
    field: string;
    oldValue: number | string;
    newValue: number | string;
  }[];
  updatedBy: string;
  updatedAt: string;
}
```

### Subscribers

| Subscriber            | Action                            | Queue         |
| --------------------- | --------------------------------- | ------------- |
| SearchIndexHandler    | Update search price filters       | search        |
| ResellerNotifyHandler | Alert resellers with this product | notifications |
| AnalyticsHandler      | Track pricing change              | analytics     |
| ReportingHandler      | Queue report data refresh         | reporting     |
| DashboardHandler      | Refresh pricing widget            | dashboard     |

---

## Event: price.wholesale_tier_updated

Published when wholesale quantity tiers are modified.

### Payload

```typescript
interface WholesaleTierUpdatedPayload {
  pricingId: string;
  productId: string;
  variantSku?: string;
  tiers: {
    minQty: number;
    price: number;
  }[];
  updatedBy: string;
}
```

### Subscribers

| Subscriber         | Action                   | Queue     |
| ------------------ | ------------------------ | --------- |
| SearchIndexHandler | Update wholesale filters | search    |
| AnalyticsHandler   | Track tier change        | analytics |

---

## Event: price.minimum_price_updated

Published when the minimum selling price for resellers is updated.

### Payload

```typescript
interface MinimumPriceUpdatedPayload {
  productId: string;
  variantSku?: string;
  oldMinPrice: number;
  newMinPrice: number;
  updatedBy: string;
}
```

### Subscribers

| Subscriber            | Action                        | Queue         |
| --------------------- | ----------------------------- | ------------- |
| ResellerNotifyHandler | Notify resellers with product | notifications |
| AnalyticsHandler      | Track minimum price change    | analytics     |

---

## Event: price.recommended_price_updated

Published when the recommended selling price for resellers is updated.

### Payload

```typescript
interface RecommendedPriceUpdatedPayload {
  productId: string;
  variantSku?: string;
  oldRecommendedPrice: number;
  newRecommendedPrice: number;
  updatedBy: string;
}
```

### Subscribers

| Subscriber            | Action                         | Queue         |
| --------------------- | ------------------------------ | ------------- |
| ResellerNotifyHandler | Notify resellers               | notifications |
| AnalyticsHandler      | Track recommended price change | analytics     |

---

## Event: price.campaign_started

Published when a campaign or flash sale pricing period begins.

### Payload

```typescript
interface CampaignPriceStartedPayload {
  campaignId: string;
  productId: string;
  variantSku?: string;
  campaignType: "regular" | "flash_sale" | "clearance" | "holiday";
  campaignPrice: number;
  effectiveFrom: string;
  effectiveTo: string;
  discountPercentage?: number;
  startedBy: string;
}
```

### Subscribers

| Subscriber          | Action                     | Queue         |
| ------------------- | -------------------------- | ------------- |
| SearchIndexHandler  | Update promotional filters | search        |
| NotificationHandler | Send campaign notification | notifications |
| AnalyticsHandler    | Track campaign start       | analytics     |

---

## Event: price.campaign_ended

Published when a campaign or flash sale pricing period ends.

### Payload

```typescript
interface CampaignPriceEndedPayload {
  campaignId: string;
  productId: string;
  variantSku?: string;
  campaignType: string;
  endedBy: string;
  endedAt: string;
}
```

### Subscribers

| Subscriber          | Action                         | Queue         |
| ------------------- | ------------------------------ | ------------- |
| SearchIndexHandler  | Restore regular pricing        | search        |
| NotificationHandler | Send campaign end notification | notifications |
| AnalyticsHandler    | Track campaign end             | analytics     |
