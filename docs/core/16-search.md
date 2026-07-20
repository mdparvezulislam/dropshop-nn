# 16 - Search Contracts

## Overview

The search contracts define a standardized interface for search operations. Every engine that supports search implements the `SearchEngineContract` interface, decoupling search logic from the underlying search provider.

---

## Search Engine Contract

```typescript
interface SearchEngineContract {
  index(entityType: string, entityId: string, data: Record<string, unknown>): Promise<void>
  update(entityType: string, entityId: string, data: Record<string, unknown>): Promise<void>
  remove(entityType: string, entityId: string): Promise<void>
  search<T>(query: SearchQuery): Promise<SearchResult<T>>
  reindex(entityType: string): Promise<number>
}
```

---

## Search Document

```typescript
interface SearchDocument {
  id: string
  type: string           // Entity type (e.g., "product", "supplier")
  title: string
  description?: string
  tags?: string[]
  status?: string
  visibility?: string
  price?: number
  categoryId?: string
  brandId?: string
  supplierId?: string
  sku?: string
  createdAt: string
  updatedAt: string
  [key: string]: unknown
}
```

---

## Search Query

```typescript
interface SearchQuery {
  query: string
  filters?: Record<string, unknown>
  page?: number
  limit?: number
  sort?: string
  order?: SortOrder
}
```

---

## Search Result

```typescript
interface SearchResult<T> {
  items: T[]
  totalCount: number
  page: number
  limit: number
  totalPages: number
  suggestions?: string[]
}
```

---

## Provider Abstraction

The contract supports multiple search providers:

| Provider | Status | Use Case |
|----------|--------|----------|
| MongoDB Text Index | ✅ Ready | Simple search, small datasets |
| MongoDB Atlas Search | ⏳ Planned | Full-text, faceted search |
| Meilisearch | 🔮 Future | High-performance typo-tolerant search |
| Algolia | 🔮 Future | Managed search-as-a-service |

Switching providers requires implementing `SearchEngineContract` — no changes to services or actions.

---

## Event-Driven Indexing

Search indexing is triggered by events:

```
product.created  →  SearchEngineContract.index("product", id, data)
product.updated  →  SearchEngineContract.update("product", id, data)
product.deleted  →  SearchEngineContract.remove("product", id)
```

Subscribers to catalog/pricing/inventory events automatically update the search index.
