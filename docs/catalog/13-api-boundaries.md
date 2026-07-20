# 13 - API Boundaries

## Overview

The Catalog Engine exposes a strict API boundary. External consumers use only the defined service methods. Direct database access by other engines is forbidden.

## Public Service API

### ProductService

| Method | Input | Output | Description |
|--------|-------|--------|-------------|
| `create` | CreateProductInput | Product | Create new product |
| `findById` | id | Product \| null | Get by ID |
| `findBySlug` | slug | Product \| null | Get by URL slug |
| `findBySku` | sku | Product \| null | Get by SKU |
| `update` | id, UpdateProductInput | Product | Update product |
| `delete` | id | boolean | Soft-delete product |
| `publish` | id | Product | Set status → active |
| `archive` | id, reason? | Product | Set status → archived |
| `duplicate` | id | Product | Create copy with -DUP suffix |
| `addVariant` | productId, variant | Product | Add new variant |
| `updateVariant` | productId, sku, variant | Product | Update variant |
| `removeVariant` | productId, sku | Product | Remove variant |
| `setFeaturedMedia` | productId, mediaId | Product | Set featured image |
| `addMedia` | productId, media | Product | Add media |
| `removeMedia` | productId, mediaId | Product | Remove media |
| `updateSEO` | productId, seo | Product | Update SEO fields |
| `changeVisibility` | productId, visibility | Product | Change visibility |
| `list` | filter, pagination | PaginatedResult<Product> | Cursor-paginated listing |

### CatalogSearchService

| Method | Input | Output | Description |
|--------|-------|--------|-------------|
| `search` | query, filters, pagination | PaginatedResult<Product> | Full-text search |
| `filterByCategory` | categoryId, pagination | PaginatedResult<Product> | Category products |
| `filterByBrand` | brandId, pagination | PaginatedResult<Product> | Brand products |
| `filterByCollection` | collectionId, pagination | PaginatedResult<Product> | Collection products |
| `autocomplete` | query, limit | string[] | Search suggestions |

### ClassificationService

| Method | Input | Output | Description |
|--------|-------|--------|-------------|
| `createBrand` | data | Brand | Create brand |
| `createCategory` | data | Category | Create category |
| `createCollection` | data | Collection | Create collection |
| `createTag` | data | ProductTag | Create tag |
| `getCategoryTree` | - | Category[] | Full category tree |
| `getBrands` | - | Brand[] | All brands |
| `getCollections` | - | Collection[] | Active collections |

## Prohibited Access Patterns

| ❌ Not Allowed | ✅ Correct |
|---------------|------------|
| `ProductModel.find(...)` in pricing service | `productService.findById(id)` |
| Direct MongoDB query in server action | Server action → service → repository |
| Importing Product model in inventory code | Consume via event or service API |
| Writing catalog data from order engine | Publish event for catalog to consume |

## Repository Access

Only services within the Catalog Engine use repositories directly. External code must use service methods or subscribe to catalog events.

## Event-Based Integration

Downstream engines should subscribe to catalog events rather than polling the database:

```
Pricing Engine subscribes to catalog.product.created
→ On event: initialize default pricing for new product

Search Engine subscribes to catalog.product.updated
→ On event: reindex product
```
