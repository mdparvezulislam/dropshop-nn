# 13 - Event Flow

## Overview

This document maps the complete flow of every major business event through the system — from the initial action through all downstream subscribers.

---

## Product Created Flow

```
Server Action: createProductAction
    │
    ├── Zod Validation
    ├── ProductService.create()
    │       ├── Validate business rules
    │       ├── ProductRepository.create()
    │       └── EventBus.publish('product.created')
    │               │
    │               ├── [Sync] AuditHandler → record audit entry
    │               ├── [Sync] TimelineHandler → add to product timeline
    │               │
    │               ├── [Async: pricing queue]
    │               │   └── PricingInitHandler
    │               │       ├── Create default ProductPricing
    │               │       └── EventBus.publish('price.created')
    │               │
    │               ├── [Async: inventory queue]
    │               │   └── InventoryInitHandler
    │               │       ├── Create default ProductInventory
    │               │       └── EventBus.publish('inventory.created')
    │               │
    │               ├── [Async: search queue]
    │               │   └── SearchIndexHandler → index product
    │               │
    │               ├── [Async: analytics queue]
    │               │   └── AnalyticsHandler → track metric
    │               │
    │               └── [Async: dashboard queue]
    │                   └── DashboardHandler → refresh widgets
    │
    └── Return created Product to client
```

---

## Pricing Updated Flow

```
Server Action: updatePricingAction
    │
    ├── Zod Validation
    ├── PricingService.update()
    │       ├── Apply pricing rule
    │       ├── Derive profit metrics
    │       ├── PricingRepository.update()
    │       └── EventBus.publish('price.updated')
    │               │
    │               ├── [Sync] AuditHandler → record audit entry
    │               ├── [Sync] TimelineHandler → add to pricing timeline
    │               │
    │               ├── [Async: search queue]
    │               │   └── SearchIndexHandler → update price filters
    │               │
    │               ├── [Async: notifications queue]
    │               │   └── ResellerNotifyHandler
    │               │       └── Notify resellers with this product assigned
    │               │
    │               ├── [Async: analytics queue]
    │               │   └── AnalyticsHandler → track pricing change
    │               │
    │               ├── [Async: reporting queue]
    │               │   └── ReportingHandler → queue report refresh
    │               │
    │               └── [Async: dashboard queue]
    │                   └── DashboardHandler → refresh widgets
    │
    └── Return updated pricing to client
```

---

## Order Created Flow

```
Server Action: createOrderAction
    │
    ├── Zod Validation
    ├── OrderService.create()
    │       ├── Resolve prices (PricingService)
    │       ├── Check inventory (InventoryService)
    │       ├── OrderRepository.create()
    │       └── EventBus.publish('order.created')
    │               │
    │               ├── [Sync] AuditHandler → record audit entry
    │               ├── [Sync] TimelineHandler → add to order timeline
    │               │
    │               ├── [Async: inventory queue]
    │               │   └── InventoryReserveHandler
    │               │       ├── Reserve stock for items
    │               │       └── Check low stock / out of stock
    │               │
    │               ├── [Async: pricing queue]
    │               │   └── PricingSnapshotHandler → snapshot prices
    │               │
    │               ├── [Async: analytics queue]
    │               │   └── ProfitCalcHandler → compute profit
    │               │
    │               ├── [Async: analytics queue]
    │               │   └── AnalyticsHandler → track order metric
    │               │
    │               ├── [Async: notifications queue]
    │               │   └── NotificationHandler
    │               │       └── Send confirmation to customer + admin
    │               │
    │               ├── [Async: reporting queue]
    │               │   └── ReportingHandler → queue report refresh
    │               │
    │               └── [Async: dashboard queue]
    │                   └── DashboardHandler → refresh widgets
    │
    └── Return created Order to client
```

---

## Inventory Stock Adjustment Flow

```
Server Action: adjustStockAction
    │
    ├── Zod Validation
    ├── InventoryService.adjustStock()
    │       ├── StockCalculationService.applyOperation()
    │       ├── InventoryRepository.update()
    │       ├── InventoryHistoryRepository.create()
    │       └── EventBus.publish('inventory.adjusted')
    │               │
    │               ├── [Sync] AuditHandler → record audit entry
    │               ├── [Sync] TimelineHandler → add to inventory timeline
    │               │
    │               ├── [Async: inventory queue]
    │               │   └── AvailabilityRecalcHandler
    │               │       ├── Recalculate availability status
    │               │       └── Publish low_stock or out_of_stock if needed
    │               │
    │               ├── [Async: search queue]
    │               │   └── SearchIndexHandler → update availability
    │               │
    │               └── [Async: analytics queue]
    │                   └── AnalyticsHandler → track adjustment
    │
    └── Return updated inventory to client
```

---

## Reseller Registration Flow

```
Server Action: createResellerAction
    │
    ├── Zod Validation
    ├── ResellerService.create()
    │       ├── Validate business info
    │       ├── ResellerRepository.create()
    │       └── EventBus.publish('reseller.registered')
    │               │
    │               ├── [Sync] AuditHandler → record audit
    │               ├── [Sync] TimelineHandler → add to reseller timeline
    │               │
    │               ├── [Async: analytics queue]
    │               │   └── AnalyticsHandler → track registration
    │               │
    │               └── [Async: dashboard queue]
    │                   └── DashboardHandler → refresh widgets
    │
    └── Return created Reseller to client
```

---

## Event Flow Principles

1. **Publisher never waits for async subscribers** — The server action returns immediately after publishing.
2. **Sync subscribers are fast** — Only audit logging and timeline recording are synchronous.
3. **Async subscribers are independent** — A failure in one subscriber does not affect others.
4. **Events are durable** — BullMQ ensures events survive process restarts.
5. **Events are traceable** — Correlation ID links all events in a request chain.
