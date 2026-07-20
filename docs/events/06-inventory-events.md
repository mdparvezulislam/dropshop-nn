# 06 - Inventory Events

## Overview

Inventory events are published by the Inventory Service whenever stock levels, reservations, or warehouse assignments change.

---

## Event: inventory.created

Published when inventory tracking is initialized for a product.

### Payload

```typescript
interface InventoryCreatedPayload {
  inventoryId: string
  productId: string
  variantSku?: string
  availableStock: number
  reservedStock: number
  incomingStock: number
  warehouseId?: string
  createdBy?: string
  createdAt: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| SearchIndexHandler | Update availability status | search |
| AnalyticsHandler | Track inventory creation | analytics |

### Validation

- `productId` must be a valid ObjectId
- All stock fields must be >= 0
- `availableStock` must be >= 0

### Retry Strategy

Max 3 retries, exponential backoff.

---

## Event: inventory.adjusted

Published when stock is manually adjusted (added, removed, or set).

### Payload

```typescript
interface InventoryAdjustedPayload {
  inventoryId: string
  productId: string
  variantSku?: string
  operation: 'stock_in' | 'stock_out' | 'adjustment'
  quantity: number
  previousAvailable: number
  newAvailable: number
  reason: string
  referenceId?: string
  performedBy: string
  timestamp: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| AvailabilityRecalcHandler | Recalculate availability status | inventory |
| SearchIndexHandler | Update availability filter | search |
| AnalyticsHandler | Track stock adjustment | analytics |

---

## Event: stock.increased

Published when stock is added to the available pool.

### Payload

```typescript
interface StockIncreasedPayload {
  inventoryId: string
  productId: string
  variantSku?: string
  quantity: number
  previousAvailable: number
  newAvailable: number
  source: 'purchase_order' | 'return' | 'transfer' | 'manual'
  referenceId?: string
  timestamp: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| AvailabilityRecalcHandler | Recalculate availability | inventory |
| LowStockClearHandler | Clear low stock alert if resolved | inventory |
| AnalyticsHandler | Track stock increase | analytics |

---

## Event: stock.decreased

Published when stock is removed from the available pool (fulfillment, damage, disposal).

### Payload

```typescript
interface StockDecreasedPayload {
  inventoryId: string
  productId: string
  variantSku?: string
  quantity: number
  previousAvailable: number
  newAvailable: number
  reason: string
  orderId?: string
  timestamp: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| AvailabilityRecalcHandler | Recalculate availability | inventory |
| AnalyticsHandler | Track stock decrease | analytics |

---

## Event: stock.reserved

Published when stock is reserved for an order.

### Payload

```typescript
interface StockReservedPayload {
  inventoryId: string
  productId: string
  variantSku?: string
  quantity: number
  orderId: string
  previousReserved: number
  newReserved: number
  previousAvailable: number
  newAvailable: number
  expiresAt?: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| AnalyticsHandler | Track reservation | analytics |

---

## Event: stock.released

Published when reserved stock is released back to the available pool.

### Payload

```typescript
interface StockReleasedPayload {
  inventoryId: string
  productId: string
  variantSku?: string
  quantity: number
  orderId: string
  reason: 'cancellation' | 'expiry' | 'manual'
  previousReserved: number
  newReserved: number
  previousAvailable: number
  newAvailable: number
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| AvailabilityRecalcHandler | Recalculate availability | inventory |
| AnalyticsHandler | Track release | analytics |

---

## Event: inventory.low_stock_detected

Published when available stock falls below the low stock threshold.

### Payload

```typescript
interface LowStockDetectedPayload {
  inventoryId: string
  productId: string
  variantSku?: string
  productName: string
  currentStock: number
  threshold: number
  warehouseId?: string
  detectedAt: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| NotificationHandler | Send low stock alert (admin) | notifications |
| AnalyticsHandler | Track low stock event | analytics |
| DashboardHandler | Update attention widget | dashboard |

---

## Event: inventory.out_of_stock

Published when available stock reaches zero.

### Payload

```typescript
interface OutOfStockPayload {
  inventoryId: string
  productId: string
  variantSku?: string
  productName: string
  lastStockTimestamp: string
  warehouseId?: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| NotificationHandler | Send out-of-stock alert | notifications |
| AnalyticsHandler | Track out-of-stock event | analytics |
| DashboardHandler | Update attention widget | dashboard |

---

## Event: inventory.warehouse_changed

Published when inventory is transferred between warehouses.

### Payload

```typescript
interface WarehouseChangedPayload {
  inventoryId: string
  productId: string
  variantSku?: string
  sourceWarehouseId: string
  targetWarehouseId: string
  quantity: number
  transferredBy: string
  timestamp: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| InventoryRefreshHandler | Refresh warehouse inventory | inventory |
| AnalyticsHandler | Track warehouse transfer | analytics |
