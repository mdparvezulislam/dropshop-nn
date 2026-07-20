# 02 - Inventory Model

## Overview

The inventory model stores stock quantities per product/variant/warehouse combination. All quantities are non-negative integers (unit count).

## ProductInventory Fields

| Field               | Type     | Default      | Description                       |
| ------------------- | -------- | ------------ | --------------------------------- |
| `productId`         | ObjectId | required     | Reference to Product              |
| `variantSku`        | String   | optional     | Variant SKU (null = parent)       |
| `warehouseId`       | ObjectId | null         | Warehouse (null = default/global) |
| `availableStock`    | Number   | 0            | Sellable units available now      |
| `reservedStock`     | Number   | 0            | Units held for active orders      |
| `incomingStock`     | Number   | 0            | Units on order from suppliers     |
| `damagedStock`      | Number   | 0            | Unsellable damaged units          |
| `returnedStock`     | Number   | 0            | Returned units pending inspection |
| `soldStock`         | Number   | 0            | Total units ever sold             |
| `virtualStock`      | Number   | 0            | Virtual/display-only stock count  |
| `safetyStock`       | Number   | 0            | Buffer stock (not for sale)       |
| `reorderLevel`      | Number   | 0            | When to reorder                   |
| `lowStockThreshold` | Number   | 5            | Warning threshold                 |
| `availability`      | String   | out_of_stock | Computed availability status      |
| `allowPreOrder`     | Boolean  | false        | Allow pre-order when OOS          |
| `allowBackorder`    | Boolean  | false        | Allow backorder when OOS          |

## Computed Stock Levels

```typescript
onHand = availableStock + reservedStock + damagedStock;
sellable = availableStock;
available = availableStock;
reserved = reservedStock;
incoming = incomingStock;
```

## Unique Constraint

Each inventory record is unique on `(productId, variantSku, warehouseId)`. This enables per-warehouse stock tracking without data duplication.

## Indexes

| Index                                         | Purpose                   |
| --------------------------------------------- | ------------------------- |
| `(productId, variantSku, warehouseId)` unique | Prevent duplicate records |
| `(availability, status)`                      | Filter by availability    |
| `(availableStock, reorderLevel)`              | Low stock queries         |
