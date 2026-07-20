# Order Module — Inventory Integration

## Principles
- Order Module **requests** inventory operations — it never manages stock directly
- Inventory release is requested when a confirmed order is cancelled
- Inventory commitment is requested when an order is completed

## Inventory Release on Cancellation

When an order in status `confirmed`, `packed`, or `ready_for_dispatch` is cancelled:

1. `OrderService.transitionStatus()` detects the cancellation path
2. `requiresInventoryRelease(fromStatus)` checks if the previous status had inventory locked
3. `requestInventoryRelease()` is called, which:
   - Dynamically imports `InventoryService` (no direct dependency at module level)
   - Iterates over order items calling `inventoryService.releaseReservation()`
   - Publishes `order.inventory_reserved` event with `action: "release"`

## Inventory Commit on Completion

When an order reaches `completed` status:
- Future integration: Finance Engine subscribes to `order.completed`
- Then requests inventory commit from Inventory Engine via a dedicated handler

## Safety
- Inventory release failures are logged as warnings — they do not block the cancellation
- The `order.inventory_reserved` event serves as a reconciliation trail
- A scheduled job can reconcile unreleased inventory by scanning orders in `cancelled` status with `inventoryReleased: false`
