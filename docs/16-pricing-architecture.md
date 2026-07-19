# 16 - Pricing Architecture

## Overview

Pricing is a **standalone feature module** (`src/features/pricing`). Product holds catalog data only. All monetary values, margins, discounts, tax, and commission configuration live here.

## Domain Model

### ProductPricing

| Field                               | Description                             |
| ----------------------------------- | --------------------------------------- |
| productId                           | FK to Product                           |
| variantSku                          | Optional variant SKU key                |
| baseCostPrice                       | Internal base cost (cents)              |
| purchasePrice                       | Purchase cost (cents)                   |
| supplierPrice                       | Supplier quote (cents)                  |
| sellingPrice                        | Retail sell price (cents)               |
| wholesalePrice                      | Wholesale tier (cents)                  |
| resellerPrice                       | Reseller tier (cents)                   |
| comparePrice                        | Compare-at / MSRP (cents)               |
| promotionalPrice                    | Active promo price (cents)              |
| discountAmount / discountPercentage | Derived or explicit                     |
| profitMargin / profitAmount         | Auto-calculated                         |
| currency                            | ISO 4217 (e.g. USD)                     |
| taxRate / taxInclusive              | Tax-ready                               |
| commissionRate                      | Commission-ready                        |
| pricingRule                         | Rule engine type                        |
| ruleConfig                          | Rule parameters                         |
| status                              | active / inactive / scheduled / expired |
| effectiveFrom / effectiveTo         | Schedule window                         |

## Pricing Rules

| Rule             | Behavior                                                   |
| ---------------- | ---------------------------------------------------------- |
| `fixed`          | Explicit prices as stored                                  |
| `percentage`     | Markup % on baseField (cost/purchase/supplier/selling)     |
| `supplier_based` | Markup from supplier/purchase cost                         |
| `category_based` | Category markup (ruleConfig.categoryId) — foundation ready |
| `brand_based`    | Brand markup (ruleConfig.brandId) — foundation ready       |
| `dynamic`        | Future dynamic pricing hook                                |

## Service Design

### PricingService

- `createPricing` / `updatePricing` / `overridePricing`
- `getPricingById` / `getPricingByProduct` / `listPricing`
- `bulkUpdatePrices` / `bulkUpdateSupplierPrices`
- `exportPricing` / `softDeletePricing`
- Applies rules, derives profit/discount metrics, logs audit events

### ProfitCalculationService

- Effective selling price (promo → discount → base)
- Profit amount & margin
- Tax amount (inclusive/exclusive)
- Commission amount
- Full `ProfitBreakdown` (cost, revenue, tax, commission, net)

## Repository Design

### PricingRepository

Extends `BaseRepository<ProductPricingDocumentType, ProductPricing>`

- `findByProductId`
- `findByProductAndVariant`
- `findActiveByProduct`
- `listPricing` (paginated)

## Validation

Zod schemas in `src/features/pricing/types/validation.ts`:

- `createPricingSchema` / `updatePricingSchema`
- `bulkPriceUpdateSchema` / `bulkSupplierPriceUpdateSchema`
- `pricingListQuerySchema`

All money inputs are **integer cents**.

## Permissions

| Permission       | Use                                  |
| ---------------- | ------------------------------------ |
| Pricing.View     | List / get / export                  |
| Pricing.Update   | Create / update / bulk               |
| Pricing.Override | Force fixed override bypassing rules |

## Audit Events

Logged via structured logger:

- `Price Changed`
- `Supplier Price Changed`
- `Inventory Imported` (export/import hooks)

## UI Routes

| Route                     | Purpose                           |
| ------------------------- | --------------------------------- |
| `/dashboard/pricing`      | Pricing list                      |
| `/dashboard/pricing/new`  | Create pricing                    |
| `/dashboard/pricing/[id]` | Pricing editor + override         |
| `/dashboard/pricing/bulk` | Bulk sell / supplier price update |

## Folder Structure

```
src/features/pricing/
  domain/pricing-entity.ts
  repositories/pricing-model.ts
  repositories/pricing-repository.ts
  services/pricing-service.ts
  services/profit-calculation-service.ts
  actions/pricing-actions.ts
  types/validation.ts
```
