# 03 - Catalog Events

## Overview

Catalog events are published by the Product Service whenever a product or variant is created, updated, deleted, or has its status changed.

---

## Event: product.created

Published when a new product is added to the catalog.

### Payload

```typescript
interface ProductCreatedPayload {
  productId: string
  sku: string
  name: string
  slug: string
  categoryId?: string
  brandId?: string
  supplierId?: string
  variants: {
    sku: string
    name: string
    attributes: Record<string, string>
  }[]
  status: string
  createdAt: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| PricingInitHandler | Create default ProductPricing record | pricing |
| InventoryInitHandler | Create default ProductInventory record | inventory |
| SearchIndexHandler | Index product for search | search |
| AnalyticsHandler | Track product creation metric | analytics |
| DashboardHandler | Refresh product widget | dashboard |
| AuditHandler | Record audit entry | audit |

### Validation

- `productId` must be a valid ObjectId string
- `sku` must be unique across the platform
- `name` must be non-empty

### Retry Strategy

Max 3 retries, exponential backoff (1s → 2s → 4s). DLQ on exhaustion.

---

## Event: product.updated

Published when product catalog fields are modified.

### Payload

```typescript
interface ProductUpdatedPayload {
  productId: string
  sku: string
  changes: {
    field: string
    oldValue: unknown
    newValue: unknown
  }[]
  updatedBy: string
  updatedAt: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| SearchIndexHandler | Re-index product | search |
| AnalyticsHandler | Track product update | analytics |
| ReportingHandler | Queue report data refresh | reporting |
| DashboardHandler | Refresh product widget | dashboard |

---

## Event: product.deleted

Published when a product is soft-deleted.

### Payload

```typescript
interface ProductDeletedPayload {
  productId: string
  sku: string
  deletedBy: string
  deletedAt: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| SearchIndexHandler | Remove from index | search |
| AnalyticsHandler | Track product deletion | analytics |
| DashboardHandler | Refresh product widget | dashboard |

---

## Event: product.published

Published when a product's visibility changes to `published`.

### Payload

```typescript
interface ProductPublishedPayload {
  productId: string
  sku: string
  publishedBy: string
  publishedAt: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| SearchIndexHandler | Index with published flag | search |
| AnalyticsHandler | Track publication | analytics |
| DashboardHandler | Refresh product widget | dashboard |

---

## Event: product.archived

Published when a product is archived.

### Payload

```typescript
interface ProductArchivedPayload {
  productId: string
  sku: string
  archivedBy: string
  archivedAt: string
  reason?: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| SearchIndexHandler | Remove from active index | search |
| AnalyticsHandler | Track archival | analytics |
| DashboardHandler | Refresh product widget | dashboard |

---

## Event: product.visibility_changed

Published when the product's visibility status changes.

### Payload

```typescript
interface ProductVisibilityChangedPayload {
  productId: string
  sku: string
  oldVisibility: string
  newVisibility: string
  changedBy: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| SearchIndexHandler | Update search visibility | search |
| DashboardHandler | Refresh product widget | dashboard |

---

## Event: product.status_changed

Published when the product's operational status changes.

### Payload

```typescript
interface ProductStatusChangedPayload {
  productId: string
  sku: string
  oldStatus: string
  newStatus: string
  changedBy: string
  reason?: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| SearchIndexHandler | Update search status | search |
| AnalyticsHandler | Track status change | analytics |
| DashboardHandler | Refresh product widget | dashboard |

---

## Event: product.variant_created

Published when a new variant is added to an existing product.

### Payload

```typescript
interface ProductVariantCreatedPayload {
  productId: string
  variantSku: string
  variantName: string
  attributes: Record<string, string>
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| PricingInitHandler | Create variant pricing record | pricing |
| InventoryInitHandler | Create variant inventory record | inventory |

---

## Event: product.variant_updated

Published when a variant's catalog data is modified.

### Payload

```typescript
interface ProductVariantUpdatedPayload {
  productId: string
  variantSku: string
  changes: { field: string; oldValue: unknown; newValue: unknown }[]
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| SearchIndexHandler | Re-index variant | search |

---

## Event: product.variant_deleted

Published when a variant is removed from a product.

### Payload

```typescript
interface ProductVariantDeletedPayload {
  productId: string
  variantSku: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| PricingCleanupHandler | Remove variant pricing | pricing |
| InventoryCleanupHandler | Remove variant inventory | inventory |
