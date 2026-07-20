# 12 - Performance

## Overview

The Inventory Engine is designed for high-concurrency stock operations. Multiple orders may attempt to reserve stock simultaneously; the engine handles this safely.

## Atomic Stock Updates

All stock mutations use MongoDB's atomic `findOneAndUpdate` with conditions:

```typescript
// Atomic reserve: only succeeds if sufficient stock exists
await ProductInventoryModel.findOneAndUpdate(
  {
    _id: inventoryId,
    availableStock: { $gte: quantity },
  },
  {
    $inc: {
      availableStock: -quantity,
      reservedStock: +quantity,
    },
  },
  { new: true },
);
```

This prevents race conditions without requiring distributed locks.

## Transactions

Multi-document operations (stock mutation + history creation) use MongoDB transactions:

```typescript
return runInTransaction(async (session) => {
  const inventory = await repo.update(id, data, { session });
  const history = await historyRepo.create(historyData, { session });
  return { inventory, history };
});
```

## Optimistic Patterns

| Pattern                         | Use Case                   |
| ------------------------------- | -------------------------- |
| Atomic $inc                     | Stock reservation, release |
| findOneAndUpdate with condition | Prevent overselling        |
| Transactions                    | Multi-document consistency |
| Lean queries                    | Read-only operations       |

## Future Caching

When Redis is integrated:

| Cache Key                     | TTL  | Value                |
| ----------------------------- | ---- | -------------------- |
| `stock:{productId}`           | 60s  | Current stock levels |
| `stock:available:{productId}` | 30s  | Sellable count       |
| `stock:low:{warehouseId}`     | 300s | Low stock list       |

Cache is invalidated on every stock mutation via the event bus.

## Query Optimization

- Paginated inventory lists
- Selective field projection
- Compound indexes for common queries
- Sparse indexes for variant-specific lookups
