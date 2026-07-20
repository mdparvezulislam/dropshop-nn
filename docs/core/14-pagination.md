# 14 - Pagination

## Overview

Pagination follows a standardized pattern across every list query in the platform. The same `PaginationParams`, `SortParams`, and `PaginatedResult` types are used everywhere.

---

## Types

```typescript
interface PaginationParams {
  page?: number; // Default: 1
  limit?: number; // Default: 10, Max: 100
}

interface SortParams {
  sortBy: string; // Field name
  sortOrder: SortOrder; // "asc" | "desc"
}

type SortOrder = "asc" | "desc";

interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

---

## Default Pagination Constants

```typescript
const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;
```

---

## Usage in Repositories

The `BaseRepository.findPaginated()` method handles pagination automatically:

```typescript
const result = await repository.findPaginated(
  { status: "active" },
  { page: 1, limit: 20 },
  { sortBy: "createdAt", sortOrder: "desc" },
);
// Returns: { items: [...], totalCount: 50, page: 1, limit: 20, totalPages: 3 }
```

---

## Usage in Server Actions

```typescript
"use server";

export async function listProductsAction(params: PaginationParams & SortParams) {
  const validated = paginationQuerySchema.parse(params);
  const result = await productService.list(validated);
  return { success: true, data: result };
}
```

---

## Query Builder

The `parsePaginationAndSort()` utility in `src/shared/lib/database/query-builder.ts` converts pagination parameters into Mongoose-compatible skip/limit/sort values:

```typescript
const { skip, limit, sort } = parsePaginationAndSort(
  { page: 1, limit: 10 },
  { sortBy: "name", sortOrder: "asc" },
);
// Result: { skip: 0, limit: 10, sort: { name: 1 } }
```
