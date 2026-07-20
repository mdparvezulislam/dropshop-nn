# 03 - Stock Management

## Overview

Stock management covers create, update, adjust, and query operations on inventory records.

## Creating Inventory

When a product is created, an inventory record is automatically created:

```typescript
const inventory = await inventoryService.createInventory({
  productId: "abc123",
  availableStock: 100,
  lowStockThreshold: 10,
});
```

A history entry is recorded: `operation: "stock_in"` with `previousAvailable: 0` and `newAvailable: 100`.

## Updating Inventory

Update inventory metadata (thresholds, settings) without affecting stock quantities:

```typescript
await inventoryService.updateInventory(id, {
  lowStockThreshold: 15,
  allowBackorder: true,
});
```

## Stock Adjustments

Adjust stock quantities with full audit trail:

| Operation | Effect | Validation |
|-----------|--------|------------|
| `stock_in` | +available, -incoming | None |
| `stock_out` | -available | Cannot exceed available |
| `adjustment` | ±available (or absolute) | None |
| `reservation` | -available, +reserved | Cannot exceed available |
| `release` | -reserved, +available | Cannot exceed reserved |
| `transfer` | -available | Cannot exceed available |
| `damage` | -available, +damaged | Cannot exceed available |
| `return` | +available, +returned | None |
| `sold` | -reserved (or -available), +sold | Cannot exceed reserved/available |

## Bulk Updates

Update multiple inventory records atomically:

```typescript
await inventoryService.bulkUpdateStock({
  items: [
    { productId: "abc", availableStock: 50 },
    { productId: "def", availableStock: 100, lowStockThreshold: 20 },
  ],
});
```

## Availability Computation

```typescript
function resolveAvailability(inventory): StockAvailability {
  if (inventory.availableStock <= 0) {
    if (inventory.allowPreOrder) return "pre_order";
    if (inventory.allowBackorder) return "backorder";
    return "out_of_stock";
  }
  if (inventory.availableStock <= lowStockThreshold) return "low_stock";
  return "in_stock";
}
```
