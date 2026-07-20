# 01 - Business Rules

## Domain Taxonomy

DropshopNN operates as a unified Commerce Operating System for the Bangladesh market. Every business rule derives from the following core principles.

### Principle 1: Catalog is King

- `Product` owns catalog data only — name, description, media, variants, attributes, brand, category, SEO.
- No price, stock, or availability data lives on the Product document.
- Pricing and Inventory are independent feature modules referenced by `productId + variantSku`.

### Principle 2: Pricing is Pluggable

- All monetary values, margins, discounts, tax rates, and commission configurations live in the Pricing module.
- The pricing engine supports unlimited pricing strategies through a strategy pattern.
- No price field is ever hardcoded into business logic — all price resolution routes through `PricingService.resolveEffectivePrice()`.

### Principle 3: Inventory is Independent

- All stock data — available, reserved, incoming, damaged, returned — lives in the Inventory module.
- Inventory operations are transactional. Every mutation writes an `InventoryHistory` record.
- Product availability is a computed value derived from live inventory data.

### Principle 4: Resellers Never Write to Catalog

- Resellers reference master Products through `ResellerProduct` — a private overlay.
- Master Product collection is read-only from the reseller domain.
- All reseller customizations (title, description, pricing, status) live on `ResellerProduct`.

### Principle 5: Automation Over Manual Sync

- Every business action triggers a cascade of automated updates through the event system.
- Manual synchronization between modules is forbidden.
- The Automation Engine coordinates all inter-module updates.

### Principle 6: Audit Everything

- Every business action creates an audit record.
- Every entity has an activity timeline.
- Audit records are immutable append-only logs.

### Principle 7: Visibility is Role-Based

- Different user roles see different price tiers and product information.
- Visibility rules are enforced at the service layer, not the UI layer.

---

## Core Business Rules

### Product Rules

```
BR-PROD-001  Products must have a unique SKU.
BR-PROD-002  Products must belong to at least one category.
BR-PROD-003  Product variants share the same base product ID.
BR-PROD-004  Products can be soft-deleted; never hard-deleted.
BR-PROD-005  Product creation must trigger Pricing Engine initialization.
BR-PROD-006  Product creation must trigger Inventory initialization.
BR-PROD-007  Product status changes must update search index, analytics, and dashboards.
```

### Pricing Rules

```
BR-PRICE-001  All monetary values stored as integer cents.
BR-PRICE-002  Pricing records are versioned; changes create audit entries.
BR-PRICE-003  Reseller selling price cannot be below minimum selling price.
BR-PRICE-004  Recommended selling price is a guideline, not an enforcement.
BR-PRICE-005  Wholesale pricing supports unlimited quantity tiers.
BR-PRICE-006  Campaign and flash sale pricing have effective date windows.
BR-PRICE-007  Price override requires explicit Pricing.Override permission.
BR-PRICE-008  Currency is stored per-pricing-record (BDT default).
```

### Inventory Rules

```
BR-INV-001  Available stock cannot go negative unless backorder is allowed.
BR-INV-002  Every stock mutation records before/after snapshots.
BR-INV-003  Reservation holds stock for a configurable TTL.
BR-INV-004  Released stock returns to available pool immediately.
BR-INV-005  Low stock thresholds are configurable per product.
BR-INV-006  Supplier inventory is tracked separately from sellable inventory.
BR-INV-007  Incoming stock is estimated; not available for sale until stock_in.
```

### Reseller Rules

```
BR-RES-001  Resellers cannot modify master Product data.
BR-RES-002  Each reseller has a unique reseller code (RSL-XXXX).
BR-RES-003  Reseller status lifecycle: pending -> active -> suspended/blocked/archived.
BR-RES-004  Product assignment creates a ResellerProduct; never deletes master Product.
BR-RES-005  Reseller pricing is independent of platform pricing.
BR-RES-006  Resellers can set custom selling prices within admin-defined bounds.
```

### Order Rules

```
BR-ORD-001  Orders reserve inventory at creation.
BR-ORD-002  Order cancellation releases reserved inventory.
BR-ORD-003  Order fulfillment reduces available inventory.
BR-ORD-004  Split shipments create sub-orders with independent tracking.
BR-ORD-005  Every order status change creates an audit entry.
BR-ORD-006  Orders cannot be deleted; only cancelled.
```

### Supplier Rules

```
BR-SUP-001  Suppliers own their supply information; products remain platform catalog.
BR-SUP-002  One product may have multiple suppliers with different costs and lead times.
BR-SUP-003  Supplier status lifecycle: pending -> active -> suspended/inactive.
BR-SUP-004  Supplier documents (NID, trade license, bank details) are required for verification.
```

---

## Validation Enforcement

All business rules are enforced at three layers:
1. **Zod Schema** — input validation at the action boundary
2. **Service Layer** — business logic enforcement
3. **Repository Layer** — data integrity enforcement (unique constraints, required fields)

No business rule is enforced solely at the UI layer.
