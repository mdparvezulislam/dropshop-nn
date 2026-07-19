# 18 - Reseller Architecture

## Overview

The Reseller module (`src/features/reseller`) is a **standalone** feature, fully independent from Suppliers. Resellers join the platform, manage business profiles, and build a **private product catalog** by referencing master Products — never modifying them.

## Core Principle

> Master `Product` collection is **read-only** from the reseller domain.  
> All customizations live on `ResellerProduct`.

```
Product (master catalog — unchanged)
        │
        ▼  reference only
ResellerProduct  (custom title, notes, pricing, status)
        │
        ▼
    Reseller
```

## Domain Models

### Reseller

| Field                                    | Description                                       |
| ---------------------------------------- | ------------------------------------------------- |
| code                                     | Auto `RSL-0001`                                   |
| businessName, ownerName, contactPerson   | Profile                                           |
| email, phone                             | Unique contacts                                   |
| logo, coverImage                         | Branding                                          |
| address                                  | BD-style address                                  |
| businessType                             | Sole / Partnership / LTD / Individual             |
| nidNumber, nidVerified                   | NID ready                                         |
| tradeLicenseNumber, tradeLicenseVerified | Trade license ready                               |
| status                                   | pending / active / suspended / blocked / archived |
| collections, tags                        | Organization labels                               |
| userId                                   | Optional linked User                              |

### ResellerProduct

| Field                          | Description                              |
| ------------------------------ | ---------------------------------------- |
| resellerId, productId          | FKs (product is never written)           |
| variantSku                     | Optional variant key                     |
| customTitle, customDescription | Reseller overrides                       |
| personalNotes                  | Private notes                            |
| sellingStatus                  | draft / active / hidden / out_of_catalog |
| isFavorite, isHidden           | Flags                                    |
| collectionIds, groupIds, tags  | Organization                             |
| pricing                        | Embedded reseller-only price (cents)     |

### ResellerProduct.pricing

- `sellingPrice`, `discountAmount`, `discountPercentage`
- `recommendedPrice` (from platform ProductPricing.resellerPrice when available)
- `costBasis`, `profitAmount`, `profitMargin`
- `currency`, `isCustomPrice`

Independent from platform `ProductPricing`.

### Collections & Groups

- `ResellerCollection` — named product sets per reseller
- `ResellerProductGroup` — product groups / tags structure

### Customer Ready (not implemented)

Architecture stub: `ResellerCustomerReady` flags for My Customers, Notes, History.

## Services

| Service                    | Responsibility                                                     |
| -------------------------- | ------------------------------------------------------------------ |
| `ResellerService`          | CRUD, status transitions, soft delete, search                      |
| `ProductAssignmentService` | Assign/remove/hide/favorite products; collections; dashboard stats |
| `ResellerPricingService`   | Profit/margin/discount math; reset to recommended                  |

Platform `PricingService` is **read-only** when resolving recommended cost/price on assign.

## Repositories

- `ResellerRepository`
- `ResellerProductRepository`
- `ResellerCollectionRepository`
- `ResellerProductGroupRepository`

All extend `BaseRepository` with `mapToDomain`.

## Permissions

| Permission       | Use                                    |
| ---------------- | -------------------------------------- |
| Reseller.Create  | Onboard reseller                       |
| Reseller.View    | List, detail, dashboard, search        |
| Reseller.Update  | Edit profile, assign products, pricing |
| Reseller.Suspend | Suspend / block                        |

## Audit Events

- Reseller Created
- Reseller Updated
- Product Added
- Product Removed
- Price Updated

## UI Routes

| Route                                | Purpose                   |
| ------------------------------------ | ------------------------- |
| `/dashboard/resellers`               | List                      |
| `/dashboard/resellers/new`           | Onboard                   |
| `/dashboard/resellers/[id]`          | Details + dashboard stats |
| `/dashboard/resellers/[id]/edit`     | Edit profile              |
| `/dashboard/resellers/[id]/products` | My Products + assignment  |
| `/dashboard/resellers/[id]/pricing`  | Product pricing editor    |

## Folder Structure

```
src/features/reseller/
  domain/reseller-entity.ts
  repositories/reseller-model.ts
  repositories/reseller-repository.ts
  services/reseller-service.ts
  services/product-assignment-service.ts
  services/reseller-pricing-service.ts
  actions/reseller-actions.ts
  types/validation.ts
```

## What is NOT built (by design)

- Customer module
- Cart / Checkout / Orders
- Courier / Wallet / Payments / Reports
