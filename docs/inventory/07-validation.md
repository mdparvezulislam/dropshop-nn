# 07 - Validation

## Overview

All inventory operations are validated at multiple layers. Business rules prevent overselling, negative stock, and illegal operations.

## Validation Layers

```
Zod Schema (action boundary)
  │  Type validation, non-negative integers, required fields
  ▼
Service Layer (business rules)
  │  Stock availability, reservation limits, frozen inventory
  ▼
Repository (data integrity)
  │  Unique constraints, required fields
  ▼
MongoDB (atomic operations)
```

## Input Validation

| Field                | Rule                                 |
| -------------------- | ------------------------------------ |
| All stock quantities | Must be non-negative integer         |
| Operation quantity   | Must be positive (except adjustment) |
| Product ID           | Must be valid ObjectId               |
| Supplier SKU         | Required for supplier mappings       |
| Currency             | 3-letter ISO code                    |

## Business Rule Validation

### Rule 1: Available Stock Sufficient

```
IF operation in [stock_out, reservation, transfer, damage]
AND availableStock < quantity
THEN Error: "Insufficient available stock"
      Block operation
```

### Rule 2: Reserved Stock Sufficient

```
IF operation == "release"
AND reservedStock < quantity
THEN Error: "Cannot release more than reserved stock"
      Block operation
```

### Rule 3: Frozen Inventory Protection

```
IF inventory.status == "frozen"
AND operation is a mutation
THEN Error: "Inventory is frozen"
      Block operation
```

### Rule 4: Backorder Allowance

```
IF operation == "stock_out"
AND quantity > availableStock
AND allowBackorder == false
THEN Error: "Insufficient available stock"
      Block operation
```

### Rule 5: Positive Quantity

```
IF operation != "adjustment"
AND quantity <= 0
THEN Error: "Quantity must be greater than zero"
      Block operation
```

## Error Response Format

```typescript
{
  success: false,
  error: "Insufficient available stock",
  code: "INSUFFICIENT_STOCK",
  details: {
    field: "quantity",
    requested: 50,
    available: 10,
  },
}
```
