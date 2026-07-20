# 04 - Profit Engine

## Overview

The Profit Engine automatically calculates profit metrics from cost and pricing data. Every price resolution includes a profit breakdown.

## Cost Breakdown

| Cost Component | Source | Description |
|---------------|--------|-------------|
| Supplier Price | SupplierInvoice | Price quoted by supplier |
| Purchase Price | PurchaseOrder | Actual purchase cost |
| Landing Cost | Import/Duty calc | Cost including duties, freight, insurance |
| Packaging Cost | ProductSettings | Packaging cost per unit |
| Operating Cost | PlatformConfig | Operating overhead per unit |
| Additional Cost | Manual entry | Any additional cost |
| Commission | PlatformConfig | Platform commission % |
| **Total Cost** | **Computed** | Sum of all costs |

## Profit Metrics

| Metric | Formula | Description |
|--------|---------|-------------|
| Gross Profit | Selling Price - Total Cost | Raw profit before overhead |
| Net Profit | Gross Profit - Commission - Tax | Profit after deductions |
| Margin % | (Net Profit / Selling Price) × 100 | Profit margin percentage |
| Markup % | (Net Profit / Total Cost) × 100 | Markup on cost percentage |
| Projected Profit | Net Profit × Projected Volume | Estimated total profit |
| Break-Even Volume | Total Fixed Costs / Net Profit Per Unit | Units to break even |

## Profit Preview

```typescript
interface ProfitBreakdown {
  costs: {
    supplierPrice: number;
    purchasePrice: number;
    landingCost: number;
    packagingCost: number;
    operatingCost: number;
    additionalCost: number;
    totalCost: number;
    commission: number;
    tax: number;
  };
  revenue: {
    sellingPrice: number;
    effectivePrice: number;
  };
  profit: {
    grossProfit: number;
    netProfit: number;
    marginPercent: number;
    markupPercent: number;
    projectedProfit?: number;
  };
}
```

## Payment Scenario Handling

The profit engine adapts to payment scenarios:

| Scenario | Profit Impact |
|----------|--------------|
| Cash On Delivery | No change (full amount collected) |
| Partial Payment | Profit recognized on paid portion |
| Advance Payment | Full profit recognized on advance |
| Full Payment | Full profit recognized immediately |
| Wallet Payment | No change (wallet is internal) |
| Mixed Payment | Profit pro-rated across payment methods |

## Automation

Profit previews are recalculated automatically when:
- Any cost field changes
- Any selling price changes
- Commission rate changes
- Tax rate changes
