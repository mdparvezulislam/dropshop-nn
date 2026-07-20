# 09 - Automation

## Overview

Stock changes trigger automated updates across the platform. Every inventory mutation cascades through the event system.

## Automation Flows

### Stock Updated
```
Stock Updated
  │
  ├── Refresh Product Availability (recalculate status)
  ├── Refresh Dashboard (update stock counts)
  ├── Refresh Reports (update inventory metrics)
  ├── Refresh Analytics (track stock movement)
  ├── Create Audit Log (record change, actor, timestamp)
  └── Generate Business Timeline (activity record)
```

### Reservation Created
```
Reservation Created
  │
  ├── Update Reserved Stock Count
  ├── Refresh Product Availability
  ├── Create Audit Log
  ├── Notify Order Service (confirmation)
  └── Generate Business Timeline
```

### Low Stock Detected
```
Low Stock Detected
  │
  ├── Notify Admin (dashboard alert)
  ├── Notify Procurement (reorder suggestion)
  ├── Update Product Badge (low stock label)
  ├── Create Audit Log
  └── Generate Business Timeline
```

### Out of Stock Detected
```
Out of Stock Detected
  │
  ├── Update Product Visibility
  ├── Notify Admin (stockout alert)
  ├── Notify Procurement (urgent reorder)
  ├── Update Search (demote or hide)
  ├── Create Audit Log
  └── Generate Business Timeline
```

## Automation Service

The automation flows are managed by `InventoryService` which:

1. Mutates inventory data atomically
2. Publishes events to Event Bus
3. Downstream services subscribe and react

Direct synchronous actions (within same transaction):
- Stock level calculation
- Availability status recomputation
- Validation enforcement

Asynchronous actions (via Event Bus):
- Dashboard refresh
- Report update
- Analytics tracking
- Notification dispatch
