# 02 - Pricing Engine

## Overview

The Pricing Engine resolves the correct price for any product given a user role, quantity, and context. All monetary values are stored as integer cents (paise for BDT).

## Cost Foundation

| Field | Type | Description |
|-------|------|-------------|
| `supplierPrice` | Number | Price quoted by supplier |
| `purchasePrice` | Number | Actual purchase cost |
| `landingCost` | Number | landed cost including duties/freight |
| `packagingCost` | Number | Packaging cost per unit |
| `operatingCost` | Number | Operating overhead per unit |
| `additionalCost` | Number | Any additional cost |
| `totalCost` | Number | Computed: sum of all costs |
| `commissionRate` | Number | Platform commission % |
| `taxRate` | Number | Tax rate % (future) |

## Selling Prices

| Field | Type | Description |
|-------|------|-------------|
| `minimumSellingPrice` | Number | Floor price — never sell below this |
| `recommendedSellingPrice` | Number | Suggested retail price |
| `retailPrice` | Number | Default retail selling price |
| `resellerPrice` | Number | Base price for resellers |
| `wholesaleBasePrice` | Number | Base price for wholesale (before tier) |
| `vipPrice` | Number | Future: VIP customer price |
| `campaignPrice` | Number | Active campaign override price |
| `flashSalePrice` | Number | Flash sale time-limited price |
| `festivalPrice` | Number | Festival/seasonal price |

## Price Resolution

```
resolvePrice(productId, role, quantity, campaignCode?)
  │
  ├── Load ProductPricing
  ├── Load Active Campaigns (campaignPrice, flashSalePrice, festivalPrice)
  ├── Determine Effective Price:
  │     ├── Flash sale active?          → flashSalePrice
  │     ├── Festival active?            → festivalPrice
  │     ├── Campaign active?            → campaignPrice
  │     ├── Role == Wholesaler?         → resolveWholesaleTier(quantity)
  │     ├── Role == Reseller?           → resellerPrice
  │     └── Default                     → retailPrice
  │
  ├── Apply Reseller Rules (if role == Reseller)
  ├── Compute Profit Metrics
  └── Return ResolvedPrice
```

## Resolved Price Output

```typescript
interface ResolvedPrice {
  productId: string;
  variantSku?: string;
  effectivePrice: number;
  basePrice: number;
  costBasis: number;
  profitAmount: number;
  profitMargin: number;
  currency: string;
  appliedRules: string[];
  campaignName?: string;
  wholesaleTier?: { minQty: number; price: number };
}
```

## Currency

- **Default Currency**: BDT (Bangladeshi Taka)
- **Storage**: All values as integer cents (paise)
- **Display**: Formatted via localization module

## Event Publication

Every pricing mutation publishes events:
- `pricing.created` — on first pricing record creation
- `pricing.updated` — on any pricing field change
