# 05 - Wholesale Pricing

## Overview

Wholesale pricing supports unlimited quantity tiers. Each tier defines a minimum quantity and a unit price. Higher quantities receive better prices.

## Tier Structure

```typescript
interface WholesaleTier {
  minQty: number;
  price: number;
  discount?: number;
  description?: string;
}
```

## Example Tiers

| Min Qty | Unit Price (BDT) | Discount | Savings |
| ------- | ---------------- | -------- | ------- |
| 1       | 1,000            | 0%       | -       |
| 10      | 950              | 5%       | 500     |
| 25      | 900              | 10%      | 2,500   |
| 50      | 850              | 15%      | 7,500   |
| 100     | 800              | 20%      | 20,000  |
| 500     | 750              | 25%      | 125,000 |
| 1,000   | 700              | 30%      | 300,000 |

## Tier Resolution Algorithm

```
resolveWholesaleTier(tiers, quantity):
  1. Sort tiers by minQty ascending
  2. Filter tiers where minQty <= quantity
  3. Return the tier with the highest minQty (best price)
```

## MOQ (Minimum Order Quantity)

The lowest tier's `minQty` defines the MOQ. Orders below MOQ:

- Are rejected
- Return validation error: "Minimum order quantity is {MOQ}"

## Bulk Savings Calculation

Each tier shows cumulative savings vs the base price:

```
savings = (basePrice - tierPrice) × quantity
savingsPercent = ((basePrice - tierPrice) / basePrice) × 100
```

## Wholesaler Experience

When a wholesaler views a product:

1. Wholesale tier table is displayed
2. Current tier based on cart quantity is highlighted
3. Savings amount shown for current tier
4. Next tier incentive shown ("Add {N} more to save {X}%")

## Event Publication

- `pricing.wholesale_tier_created` — new tier added
- `pricing.wholesale_tier_updated` — tier modified
- `pricing.wholesale_tier_deleted` — tier removed
