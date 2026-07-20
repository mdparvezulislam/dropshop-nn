# 05 - Stock Movements

## Overview

Every inventory mutation creates a history record. Stock movement history provides a complete audit trail of all stock changes.

## InventoryHistory Model

| Field               | Type     | Description                    |
| ------------------- | -------- | ------------------------------ |
| `inventoryId`       | ObjectId | Reference to inventory record  |
| `productId`         | ObjectId | Reference to product           |
| `variantSku`        | String   | Variant identifier             |
| `warehouseId`       | ObjectId | Warehouse reference            |
| `operation`         | String   | Operation type                 |
| `quantity`          | Number   | Units affected                 |
| `previousAvailable` | Number   | Available stock before         |
| `newAvailable`      | Number   | Available stock after          |
| `previousReserved`  | Number   | Reserved stock before          |
| `newReserved`       | Number   | Reserved stock after           |
| `reason`            | String   | Why the change occurred        |
| `referenceId`       | String   | External reference (order, PO) |
| `notes`             | String   | Additional notes               |
| `performedBy`       | String   | Who performed the operation    |

## Movement Types

| Type          | Description              | Typical Reason             |
| ------------- | ------------------------ | -------------------------- |
| `stock_in`    | Stock received           | Purchase order, production |
| `stock_out`   | Stock removed            | Manual removal, samples    |
| `adjustment`  | Manual correction        | Inventory count            |
| `reservation` | Held for order           | Order creation             |
| `release`     | Reservation cancelled    | Order cancelled            |
| `transfer`    | Moved between warehouses | Warehouse transfer         |
| `damage`      | Marked as damaged        | Quality control            |
| `return`      | Customer return          | Return processing          |
| `sold`        | Order fulfilled          | Order completion           |

## Querying History

```typescript
const history = await inventoryService.getHistory(
  { inventoryId: "inv-123" },
  { page: 1, limit: 20 },
  { sortBy: "createdAt", sortOrder: "desc" },
);
```

## Indexes

| Index                      | Purpose                  |
| -------------------------- | ------------------------ |
| `(inventoryId, createdAt)` | Per-inventory timeline   |
| `(productId, createdAt)`   | Per-product timeline     |
| `(operation, createdAt)`   | Filter by operation type |
