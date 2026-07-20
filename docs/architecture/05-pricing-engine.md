# 05 - Pricing Engine Architecture

## Overview

The Pricing Engine is a reusable, strategy-based system that resolves the correct price for any product given a role, quantity, and context. All monetary values are stored as **integer cents** to avoid floating-point precision issues.

---

## Price Types

### Core Prices (stored on ProductPricing)

| Price Field        | Description             | Source              |
| ------------------ | ----------------------- | ------------------- |
| `baseCostPrice`    | Internal base cost      | Manual entry        |
| `purchasePrice`    | Cost to purchase        | Supplier quote      |
| `supplierPrice`    | Supplier's listed price | Supplier input      |
| `sellingPrice`     | Base retail price       | Manual entry        |
| `wholesalePrice`   | Base wholesale price    | Manual entry        |
| `resellerPrice`    | Base reseller price     | Manual entry        |
| `comparePrice`     | Compare-at / MSRP       | Manual entry        |
| `promotionalPrice` | Active promotion price  | Campaign/flash sale |

### Derived Prices (computed on-the-fly)

| Price Field             | Derivation                         |
| ----------------------- | ---------------------------------- |
| Effective Selling Price | Promotional → Discounted → Selling |
| Profit Amount           | Effective Selling - Cost Basis     |
| Profit Margin           | (Profit / Cost) × 100              |
| Tax Amount              | Effective Selling × Tax Rate       |

---

## Pricing Strategies

### Strategy Pattern

The pricing engine uses a strategy pattern to resolve prices:

```
PricingEngine.resolve(options: PriceResolutionOptions): ResolvedPrice

PriceResolutionOptions {
  productId: string
  variantSku?: string
  role: 'retail' | 'reseller' | 'wholesaler' | 'vip'
  quantity?: number
  campaignCode?: string
  date?: Date
}
```

### Available Strategies

| Strategy          | Code             | Behavior                              |
| ----------------- | ---------------- | ------------------------------------- |
| Fixed             | `fixed`          | Returns stored price directly         |
| Percentage Markup | `percentage`     | Applies markup % on cost basis        |
| Supplier-Based    | `supplier_based` | Markup from supplier/purchase cost    |
| Category-Based    | `category_based` | Markup by product category            |
| Brand-Based       | `brand_based`    | Markup by product brand               |
| Dynamic           | `dynamic`        | Extensible hook for future strategies |

---

## Wholesale Tier Pricing

Wholesale pricing supports unlimited quantity tiers:

```
Tiers: [
  { minQty: 1,  price: 10000 },   // 100.00 BDT
  { minQty: 10, price: 9500 },    // 95.00 BDT
  { minQty: 25, price: 9000 },    // 90.00 BDT
  { minQty: 50, price: 8500 },    // 85.00 BDT
  { minQty: 100, price: 8000 },   // 80.00 BDT
  { minQty: 500, price: 7500 },   // 75.00 BDT
]
```

Resolution: `PricingEngine.resolveTierPrice(tiers, quantity)` returns the price for the highest tier whose `minQty <= quantity`.

---

## Reseller Pricing Bounds

Admin controls per product:

| Bound              | Field                     | Description                     |
| ------------------ | ------------------------- | ------------------------------- |
| Minimum            | `minSellingPrice`         | Reseller cannot sell below this |
| Recommended        | `recommendedSellingPrice` | Suggested selling price         |
| Maximum (optional) | `maxSellingPrice`         | Reseller cannot sell above this |

Validation is enforced by `ResellerPricingService.validateResellerPrice()` before any price write.

---

## Campaign & Flash Sale Pricing

| Field            | Description                                |
| ---------------- | ------------------------------------------ |
| `campaignPrice`  | Discounted price during campaign           |
| `flashSalePrice` | Time-limited deep discount                 |
| `effectiveFrom`  | Campaign start date                        |
| `effectiveTo`    | Campaign end date                          |
| `campaignType`   | regular / flash_sale / clearance / holiday |

Resolution order: Flash Sale → Campaign → Promotional → Base Selling Price

---

## VIP Pricing

Future VIP pricing tiers can be added by:

1. Adding a `vipPrice` field to ProductPricing
2. Adding a `vip` strategy to the pricing engine
3. Mapping VIP customers via a customer group

---

## Price Resolution Flow

```
resolvePrice(productId, role, quantity)
│
├── Load ProductPricing
├── Load Active Campaigns
├── Load Wholesale Tiers (if wholesaler)
├── Determine Effective Price
│   ├── Flash sale active? → flash sale price
│   ├── Campaign active? → campaign price
│   ├── Promotional price set? → promotional price
│   ├── Wholesale & quantity? → tier price
│   ├── Reseller? → reseller price
│   └── Default → selling price
├── Apply Tax & Commission
├── Compute Profit Metrics
└── Return ResolvedPrice
```
