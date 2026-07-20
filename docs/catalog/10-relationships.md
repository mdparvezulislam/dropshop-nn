# 10 - Relationships

## Overview

The Catalog Engine manages relationships between products and other domain entities. These are always reference-based — the Catalog stores IDs, not data.

## Supplier Relationships

### M:N Product-Supplier Mapping

A product can be supplied by multiple suppliers. The catalog stores only references:

```typescript
interface SupplierReference {
  supplierId: string;
  supplierSku?: string; // Supplier's SKU for this product
  isPrimary: boolean; // Default supplier
  sortOrder: number; // Display/selection order
}
```

### What Catalog Stores

- Supplier IDs
- Supplier's SKU for this product
- Primary supplier flag
- Sort order

### What Catalog Does NOT Store

- Supplier cost/price
- Supplier stock levels
- Supplier lead time
- Supplier commission rates
- Supplier contact information

These belong to the Supplier and Inventory engines.

## Pricing Relationship

The Catalog stores zero pricing data. The relationship is:

- `product.id` → `PricingEngine.getPricing(productId)`
- `variant.sku` → `PricingEngine.getVariantPricing(variantSku)`

All price resolution goes through `PricingService.resolveEffectivePrice()`.

## Inventory Relationship

The Catalog stores zero inventory data. The relationship is:

- `product.id` → `InventoryService.getAvailability(productId)`
- `variant.sku` → `InventoryService.getVariantStock(variantSku)`

## Category Relationship

- Products reference `categoryId`
- Categories have optional `parentCategoryId` for hierarchy
- Deleting a category unlinks products (does not delete them)

## Brand Relationship

- Products reference `brandId`
- Deleting a brand unlinks products (does not delete them)

## Collection Relationship

- Collections have an array of `productIds`
- Products do not reference collections (collections reference products)
- M:N relationship

## Order Relationship (Downstream)

- Orders reference `productId` and `variantSku`
- Catalog changes do NOT affect existing orders
- Archived products in orders display a notice: "This product is no longer available"

## Entity Relationship Diagram

```
Brand (1) ──── (N) Product (N) ──── (N) Collection
                      │
Category (1) ──── (N) Product (N) ──── (M) Supplier (references only)
                      │
                    Product (1) ──── (N) Variant
                      │
                    Product (1) ──── (N) Media
                      │
                    Product (1) ──── (1) SEO
                      │
                    Product (1) ──── (N) Tag (M:N via tags array)
```

## Cross-Engine Data Flow

```
Catalog Engine (owns: name, desc, media, variants)
  │
  ├──→ Pricing Engine (owns: costs, prices, discounts)   via productId
  ├──→ Inventory Engine (owns: stock, reservations)      via productId + variantSku
  ├──→ Order Engine (owns: orders, items)                via productId + variantSku
  ├──→ Search Engine (indexes: name, desc, tags, etc.)   via event
  └──→ Analytics Engine (tracks: views, orders)           via event
```
