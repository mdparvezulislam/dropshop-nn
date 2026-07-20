# Inventory Validation

## Core Principle
> Checkout never checks stock directly. All validation is delegated to the Inventory Engine via `InventoryValidationService`.

## Validation Flow
For each cart item:
1. Call `InventoryService.getInventoryByProduct(productId, variantSku)`
2. Compute `available = availableStock - reservedStock`
3. Check inventory status (frozen → invalid)
4. Check availability (discontinued → invalid)
5. If quantity > available and no backorder/preorder → invalid
6. Return `InventoryCheckResult` with validity, message, and available count

## Reservation Flow
After validation passes:
1. Call `InventoryService.reserveStock(inventoryId, quantity, referenceId)`
2. On success: store `reservationId` on the checkout session
3. On failure: mark checkout as failed with error message

## Expiry and Release
- Inventory reservations are TTL-bound on the checkout session (`expiresAt`)
- When checkout expires, the Order Engine should release reserved stock
- Individual reservation release via `InventoryValidationService.release()`

## Check Results
| Field | Type | Description |
|---|---|---|
| `productId` | `string` | Product ID |
| `variantSku` | `string?` | Variant SKU |
| `quantity` | `number` | Requested quantity |
| `available` | `number` | Calculated available stock |
| `isValid` | `boolean` | Whether stock is sufficient |
| `message` | `string?` | Reason if invalid |
| `reservationId` | `string?` | Reservation reference after success |
