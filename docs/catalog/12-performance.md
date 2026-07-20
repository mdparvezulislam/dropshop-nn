# 12 - Performance

## Overview

The Catalog Engine is the most-read data store in the platform. Performance optimizations focus on read efficiency while maintaining write integrity.

## Indexes

### Product Collection

| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| Unique SKU | `{ sku: 1 }` | Unique | SKU lookups |
| Unique Slug | `{ slug: 1 }` | Unique | URL lookups |
| Barcode | `{ barcode: 1 }` | Unique sparse | Barcode scanning |
| GTIN | `{ gtin: 1 }` | Unique sparse | GTIN lookups |
| Status + Visibility | `{ status: 1, visibility: 1 }` | Compound | Catalog listing queries |
| Category | `{ categoryId: 1 }` | Single | Category filtering |
| Brand | `{ brandId: 1 }` | Single | Brand filtering |
| Supplier | `{ supplierId: 1 }` | Single | Supplier product list |
| Featured | `{ featured: -1, status: 1 }` | Compound | Featured products |
| Created | `{ createdAt: -1 }` | Single | Newest first sorting |
| Search | `{ name: "text", shortDescription: "text" }` | Text | Full-text search |

### Category Collection

| Index | Fields | Purpose |
|-------|--------|---------|
| Unique Slug | `{ slug: 1 }` | URL lookups |
| Parent | `{ parentCategoryId: 1 }` | Tree traversal |

### Brand Collection

| Index | Fields | Purpose |
|-------|--------|---------|
| Unique Slug | `{ slug: 1 }` | URL lookups |

### Collection Collection

| Index | Fields | Purpose |
|-------|--------|---------|
| Unique Slug | `{ slug: 1 }` | URL lookups |

## Cursor Pagination

All product listing queries use cursor-based pagination instead of offset-based:

```typescript
interface CursorPaginationParams {
  cursor?: string;     // Last ID from previous page
  limit: number;        // Page size (default 20, max 100)
  sort?: string;        // Sort field
  order?: "asc" | "desc";
}
```

### Why Cursor Pagination
- Stable pagination through inserts/deletes
- No performance degradation on deep pages
- Consistent with real-time updates
- Lower database load than `skip/limit`

## Caching Strategy

### Cache Layers

| Layer | Cache | TTL | Invalidation |
|-------|-------|-----|-------------|
| Product detail | Redis | 1 hour | On product update |
| Product listing | Redis | 5 minutes | On any product change |
| Categories | Redis | 1 hour | On category change |
| Brands | Redis | 1 hour | On brand change |
| Collections | Redis | 1 hour | On collection change |

### Cache Invalidation

On any catalog write event:
1. Publish event to Event Bus
2. Cache subscriber invalidates affected keys:
   - Individual product cache
   - Listing caches (by clearing listing namespace)
   - Category/brand listing caches (if classification changed)

## Query Optimization

### Lean Queries
All read queries use `.lean()` to return plain JavaScript objects instead of Mongoose documents.

### Field Projection
Listing queries project only needed fields:
```typescript
{ name: 1, slug: 1, sku: 1, featuredImage: 1, status: 1 }
```

### Batch Loading
Related entities are loaded in batch:
```typescript
const products = await ProductRepository.find(...)
const brandIds = [...new Set(products.map(p => p.brandId))]
const brands = await BrandRepository.find({ _id: { $in: brandIds } })
```

## Write Performance

### Bulk Operations
Bulk product imports use `bulkWrite` for efficiency:
```typescript
ProductModel.bulkWrite([
  { insertOne: { document: {...} } },
  { updateOne: { filter: {...}, update: {...} } },
])
```

### Eventual Consistency
Catalog writes are synchronous (immediate consistency). Downstream engines consume events asynchronously (eventual consistency).
