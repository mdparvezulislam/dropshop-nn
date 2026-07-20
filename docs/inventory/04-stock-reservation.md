# 04 - Stock Reservation

## Overview

Stock reservation prevents overselling by holding units for active orders. Reserved stock is subtracted from `availableStock` and added to `reservedStock`.

## Reservation Flow

```
Order Created → Reservation Created → Stock Held
     │                                      │
     ▼                                      ▼
Order Completed? ──Yes──→ Convert to Sold (release reservation)
     │
     ▼ No
Order Cancelled? ──Yes──→ Release Reservation
     │
     ▼ No
Reservation Expired? ──Yes──→ Auto-Release
```

## API

### Reserve

```typescript
const { inventory, history } = await inventoryService.reserveStock(
  inventoryId, // Inventory record ID
  quantity, // Units to reserve
  "order-123", // Reference (order/cart ID)
  "user-456", // Actor
);
```

### Release

```typescript
const { inventory, history } = await inventoryService.releaseStock(
  inventoryId,
  quantity,
  "order-123",
  "user-456",
);
```

### Confirm / Mark Sold

```typescript
const { inventory, history } = await inventoryService.markSold(
  inventoryId,
  quantity,
  "order-123",
  "user-456",
);
```

## Validation Rules

| Rule                                        | Enforcement                          |
| ------------------------------------------- | ------------------------------------ |
| Cannot reserve more than available          | `availableStock >= quantity`         |
| Cannot release more than reserved           | `reservedStock >= quantity`          |
| Cannot reserve on frozen inventory          | Block with error                     |
| Sold converts reserved or reduces available | Reserve first, fallback to available |

## Reservation Expiry

Reservations have a configurable TTL (default 30 minutes). Expired reservations are automatically released by a background job.

## Event Publication

- `inventory.stock_reserved` — on reserve
- `inventory.stock_released` — on release
- `inventory.stock_sold` — on confirm
