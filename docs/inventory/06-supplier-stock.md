# 06 - Supplier Stock

## Overview

Products may have multiple supplier stock references. The SupplierInventory entity stores each supplier's stock levels, costs, and lead times.

## SupplierInventory Model

| Field                  | Type     | Description                         |
| ---------------------- | -------- | ----------------------------------- |
| `productId`            | ObjectId | Reference to Product                |
| `supplierId`           | ObjectId | Reference to Supplier               |
| `variantSku`           | String   | Variant identifier                  |
| `supplierSku`          | String   | Supplier's SKU for the product      |
| `supplierCost`         | Number   | Cost from this supplier (cents)     |
| `supplierStock`        | Number   | Supplier's reported available stock |
| `leadTimeDays`         | Number   | Days to fulfill order               |
| `minimumOrderQuantity` | Number   | MOQ from this supplier              |
| `isPreferred`          | Boolean  | Preferred supplier flag             |
| `currency`             | String   | Currency of cost (ISO 3-letter)     |

## Business Rules

- Only one supplier per product can be `isPreferred`
- Setting a new supplier as preferred unflags the previous one
- Supplier inventory is informational (not synced with availableStock)
- Supplier cost feeds into the Pricing Engine's cost foundation

## Preferred Supplier Resolution

```typescript
const preferred = await inventoryService
  .getSupplierInventoryByProduct(productId)
  .then((suppliers) => suppliers.find((s) => s.isPreferred));

// Fallback to first active supplier
const fallback = await inventoryService
  .getSupplierInventoryByProduct(productId)
  .then((suppliers) => suppliers.find((s) => s.status === "active"));
```

## Supplier Operations

| Operation                        | Description                      |
| -------------------------------- | -------------------------------- |
| `createSupplierInventory`        | Map a supplier to a product      |
| `updateSupplierInventory`        | Update cost, stock, lead time    |
| `getSupplierInventoryByProduct`  | List all suppliers for a product |
| `getSupplierInventoryBySupplier` | List all products for a supplier |

## Unique Constraint

Each supplier-product mapping is unique on `(productId, supplierId, variantSku)`.
