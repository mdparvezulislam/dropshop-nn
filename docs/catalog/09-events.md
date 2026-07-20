# 09 - Catalog Events

## Event Types

| Event | Payload | Trigger |
|-------|---------|---------|
| `catalog.product.created` | productId, name, sku, brandId, categoryId | Product created |
| `catalog.product.updated` | productId, changedFields | Product fields updated |
| `catalog.product.deleted` | productId, sku | Product soft-deleted |
| `catalog.product.published` | productId, visibility, publishedAt | Product status → active |
| `catalog.product.archived` | productId, reason | Product status → archived |
| `catalog.variant.created` | productId, variantSku, variantDimensions | New variant added |
| `catalog.variant.updated` | productId, variantSku, changedFields | Variant modified |
| `catalog.media.updated` | productId, mediaCount | Media added/removed/reordered |
| `catalog.seo.updated` | productId, changedFields | SEO metadata changed |
| `catalog.visibility.changed` | productId, oldVisibility, newVisibility | Product visibility changed |
| `catalog.classification.changed` | productId, brandId?, categoryId? | Brand/category changed |

## Event Payloads

### ProductCreated
```typescript
{
  productId: string,
  name: string,
  sku: string,
  slug: string,
  brandId?: string,
  categoryId?: string,
  status: string,
  visibility: string,
  createdAt: string,
}
```

### ProductUpdated
```typescript
{
  productId: string,
  sku: string,
  changedFields: string[],
  updatedAt: string,
}
```

### ProductPublished
```typescript
{
  productId: string,
  name: string,
  sku: string,
  visibility: string,
  publishedAt: string,
}
```

## Subscriber Actions

| Event | Downstream Effect |
|-------|------------------|
| `catalog.product.created` | Pricing Engine: create default pricing; Inventory Engine: create zero stock record; Search: index product; Analytics: track new product |
| `catalog.product.updated` | Search: reindex; Analytics: track change; Cache: invalidate product cache |
| `catalog.product.published` | Search: make searchable; Analytics: track publish; Notification: notify subscribers |
| `catalog.product.archived` | Search: remove from index; Pricing: mark pricing inactive; Inventory: mark stock unavailable |
| `catalog.variant.created` | Pricing: create variant pricing; Inventory: create variant stock |
| `catalog.visibility.changed` | Search: update visibility filter; Cache: invalidate |

## Event Publication Pattern

```typescript
await EventBus.publish("catalog.product.created", {
  productId: product.id,
  name: product.name,
  sku: product.sku,
  slug: product.slug,
  brandId: product.brandId,
  categoryId: product.categoryId,
  status: product.status,
  visibility: product.visibility,
  createdAt: new Date().toISOString(),
}, {
  actor: actor ? { id: actor.id, name: actor.name, role: actor.role } : undefined,
  source: "catalog-service",
})
```
