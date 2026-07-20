# 13 - API Boundaries

## Overview

The Inventory Engine exposes a strict service API. All stock resolution, reservation, and mutation must go through these public methods.

## Public Service API

### InventoryService

| Method                  | Input                                | Output                 | Description              |
| ----------------------- | ------------------------------------ | ---------------------- | ------------------------ |
| `createInventory`       | productId, data, actor               | ProductInventory       | Create inventory record  |
| `updateInventory`       | id, data, actor                      | ProductInventory       | Update inventory fields  |
| `getInventoryById`      | id                                   | ProductInventory       | Get inventory by ID      |
| `getInventoryByProduct` | productId, variantSku?, warehouseId? | ProductInventory       | Get inventory by product |
| `listInventory`         | filter, pagination, sort             | PaginatedResult        | Paginated inventory list |
| `adjustStock`           | inventoryId, operation, quantity     | { inventory, history } | Atomic stock adjustment  |
| `stockIn`               | inventoryId, quantity, reason        | { inventory, history } | Receive stock            |
| `stockOut`              | inventoryId, quantity, reason        | { inventory, history } | Remove stock             |
| `reserveStock`          | inventoryId, quantity, referenceId   | { inventory, history } | Reserve stock            |
| `releaseStock`          | inventoryId, quantity, referenceId   | { inventory, history } | Release reservation      |
| `markDamaged`           | inventoryId, quantity, reason        | { inventory, history } | Mark stock damaged       |
| `markReturned`          | inventoryId, quantity, reason        | { inventory, history } | Process return           |
| `markSold`              | inventoryId, quantity, referenceId   | { inventory, history } | Fulfill order            |
| `bulkUpdateStock`       | items, actor                         | ProductInventory[]     | Bulk stock update        |
| `getDashboardStats`     | -                                    | Stats                  | Dashboard counts         |
| `getLowStockList`       | -                                    | ProductInventory[]     | Low stock items          |
| `getHistory`            | filter, pagination, sort             | PaginatedResult        | Movement history         |
| `getStockLevels`        | inventory                            | StockLevels            | Computed levels          |

### StockCalculationService

| Method                | Input                          | Output                  | Description              |
| --------------------- | ------------------------------ | ----------------------- | ------------------------ |
| `resolveAvailability` | params                         | StockAvailability       | Determine stock status   |
| `calculateLevels`     | inventory                      | StockLevels             | Compute all stock levels |
| `applyOperation`      | inventory, operation, quantity | StockMutationResult     | Apply stock mutation     |
| `markDamaged`         | inventory, quantity            | { available, damaged }  | Damage calculation       |
| `markReturned`        | inventory, quantity            | { available, returned } | Return calculation       |
| `isLowStock`          | available, threshold           | boolean                 | Low stock check          |
| `isOutOfStock`        | available                      | boolean                 | OOS check                |

## Prohibited Access

| ❌ Not Allowed                        | ✅ Correct                                 |
| ------------------------------------- | ------------------------------------------ |
| Reading stock directly from MongoDB   | `inventoryService.getInventoryByProduct()` |
| Writing stock in order service        | `inventoryService.reserveStock()`          |
| Bypassing validation in checkout      | `inventoryService.adjustStock()`           |
| Storing stock copies in other engines | Always read from Inventory Engine          |
