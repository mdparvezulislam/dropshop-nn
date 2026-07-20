# 10 - Admin Workspace

## Overview

The Admin Inventory Workspace provides a comprehensive interface for managing all stock aspects.

## Workspace Sections

### 1. Inventory Dashboard

- Total SKUs count
- In Stock count
- Low Stock count
- Out of Stock count
- Reserved units total
- Incoming units total

### 2. Stock Levels

- Current stock per product/variant
- Available vs Reserved breakdown
- Incoming stock tracking
- Damaged and returned stock
- Stock status badges

### 3. Stock Operations

- Stock In form (quantity, reason)
- Stock Out form (quantity, reason)
- Manual Adjustment (absolute or delta)
- Damage Marking
- Return Processing

### 4. Reservation Management

- Active reservations list
- Manual release
- Reservation history

### 5. Supplier Stock

- Per-product supplier list
- Supplier cost comparison
- Preferred supplier toggle
- Lead time tracking

### 6. Movement History

- Timeline view of all stock changes
- Filter by operation type
- Filter by product
- Before/after values

### 7. Low Stock Alerts

- Products below threshold
- Products at zero
- Reorder suggestions
- Supplier contact info

## Data Flow

```
Admin adjusts stock
  │
  ├── Validate operation (Zod + business rules)
  ├── Apply atomic stock mutation
  ├── Recalculate availability
  ├── Record movement history
  ├── Publish inventory event
  ├── Refresh dashboard
  └── Return updated inventory
```
