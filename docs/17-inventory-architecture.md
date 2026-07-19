# 17 - Inventory Architecture

## Overview

Inventory is a **standalone feature module** (`src/features/inventory`). Product never stores stock. All availability, reservations, supplier stock mappings, and movement history live here.

## Domain Models

### ProductInventory

| Field                          | Description                                       |
| ------------------------------ | ------------------------------------------------- |
| productId                      | FK to Product                                     |
| variantSku                     | Optional variant SKU                              |
| warehouseId                    | Optional — multi-warehouse ready (null = default) |
| availableStock                 | Sellable units                                    |
| reservedStock                  | Held for orders                                   |
| incomingStock                  | On-order / inbound                                |
| damagedStock                   | Unsellable damaged                                |
| returnedStock                  | Returned units tracked                            |
| safetyStock                    | Buffer level                                      |
| reorderLevel                   | Reorder trigger                                   |
| lowStockThreshold              | Low-stock warning                                 |
| availability                   | Computed status enum                              |
| allowPreOrder / allowBackorder | Availability modes                                |
| status                         | active / inactive / frozen                        |

### InventoryHistory

Append-only stock timeline: operation, qty, before/after available & reserved, reason, reference, performer.

### SupplierInventory

Product ↔ Supplier mapping: supplier SKU, cost (cents), supplier stock, lead time, MOQ, preferred flag.

## Stock Operations

| Operation     | Effect                                         |
| ------------- | ---------------------------------------------- |
| `stock_in`    | +available; −incoming when applicable          |
| `stock_out`   | −available (respects backorder flag)           |
| `adjustment`  | Relative or absolute available set             |
| `reservation` | available → reserved                           |
| `release`     | reserved → available                           |
| `transfer`    | −available on source (full WMS transfer later) |

All mutating stock ops run inside `runInTransaction` and write `InventoryHistory`.

## Availability

Computed by `StockCalculationService.resolveAvailability`:

- `in_stock` — above thresholds
- `low_stock` — ≤ lowStockThreshold / reorderLevel
- `out_of_stock` — 0 and no preorder/backorder
- `pre_order` — 0 + allowPreOrder
- `backorder` — 0 + allowBackorder

## Warehouse Ready (not implemented)

Architecture prepared for:

- Multiple warehouses via `warehouseId`
- Per-warehouse stock rows (unique on product+variant+warehouse)
- Warehouse transfers (transfer op + future target side)
- Warehouse allocation (future order module)

**Do not implement full WMS in this phase.**

## Service Design

### InventoryService

- CRUD inventory + supplier inventory
- `adjustStock` / `stockIn` / `stockOut` / `reserveStock` / `releaseStock`
- `bulkUpdateStock` / `exportInventory`
- `getLowStockList` / `getOutOfStockList` / `getDashboardStats`
- `getHistory` / `getHistoryByInventory`

### StockCalculationService

- On-hand, sellable, low/out/reorder/safety checks
- Availability resolution
- Operation mutation math with validation

## Repository Design

| Repository                  | Responsibility                                   |
| --------------------------- | ------------------------------------------------ |
| InventoryRepository         | ProductInventory CRUD + low/out-of-stock queries |
| InventoryHistoryRepository  | History timeline queries                         |
| SupplierInventoryRepository | Supplier mapping CRUD + preferred lookup         |

## Validation

Zod in `src/features/inventory/types/validation.ts`:

- `createInventorySchema` / `updateInventorySchema`
- `stockAdjustmentSchema`
- `createSupplierInventorySchema` / `updateSupplierInventorySchema`
- `bulkStockUpdateSchema`
- `inventoryListQuerySchema` / `inventoryHistoryQuerySchema`

## Permissions

| Permission       | Use                                              |
| ---------------- | ------------------------------------------------ |
| Inventory.View   | List, dashboard, history, export                 |
| Inventory.Update | Create/update inventory & supplier mapping, bulk |
| Inventory.Adjust | Stock operations (in/out/adjust/reserve/release) |

## Audit Events

- `Stock Updated`
- `Stock Adjusted`
- `Supplier Price Changed`
- `Inventory Imported`

## UI Routes

| Route                            | Purpose                    |
| -------------------------------- | -------------------------- |
| `/dashboard/inventory`           | Dashboard + inventory list |
| `/dashboard/inventory/new`       | Create inventory           |
| `/dashboard/inventory/adjust`    | Stock adjustment form      |
| `/dashboard/inventory/history`   | Stock timeline             |
| `/dashboard/inventory/low-stock` | Low stock alerts           |

## Folder Structure

```
src/features/inventory/
  domain/inventory-entity.ts
  repositories/inventory-model.ts
  repositories/inventory-repository.ts
  services/inventory-service.ts
  services/stock-calculation-service.ts
  actions/inventory-actions.ts
  types/validation.ts
```

## Bulk Operations

- Bulk stock update (levels + thresholds)
- Bulk price update (pricing module)
- Bulk supplier price update (pricing module)
- Export inventory / pricing (import-ready hooks via export + bulk schemas)
