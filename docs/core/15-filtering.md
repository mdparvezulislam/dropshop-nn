# 15 - Filtering & Sorting

## Overview

The filtering and sorting contracts provide a standardized interface for query operations. Every engine that supports list queries uses the same filter and sort types.

---

## Filter Rules

```typescript
interface FilterRule {
  field: string; // Field name (dot notation for nested)
  operator: string; // See operators below
  value: FilterValue;
}

type FilterValue = string | number | boolean | Date | null | FilterOperator;

interface FilterOperator {
  eq?: unknown;
  neq?: unknown;
  gt?: number;
  gte?: number;
  lt?: number;
  lte?: number;
  in?: unknown[];
  nin?: unknown[];
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  exists?: boolean;
  between?: [number, number];
}
```

---

## Filter Operators

| Operator     | Description        | Example                                                             |
| ------------ | ------------------ | ------------------------------------------------------------------- |
| `eq`         | Equal to           | `{ field: "status", operator: "eq", value: "active" }`              |
| `neq`        | Not equal          | `{ field: "status", operator: "neq", value: "archived" }`           |
| `gt`         | Greater than       | `{ field: "price", operator: "gt", value: 1000 }`                   |
| `gte`        | Greater or equal   | `{ field: "price", operator: "gte", value: 500 }`                   |
| `lt`         | Less than          | `{ field: "stock", operator: "lt", value: 10 }`                     |
| `lte`        | Less or equal      | `{ field: "stock", operator: "lte", value: 5 }`                     |
| `in`         | In array           | `{ field: "status", operator: "in", value: ["active", "pending"] }` |
| `nin`        | Not in array       | `{ field: "status", operator: "nin", value: ["archived"] }`         |
| `contains`   | String contains    | `{ field: "name", operator: "contains", value: "wireless" }`        |
| `startsWith` | String starts with | `{ field: "sku", operator: "startsWith", value: "PRD" }`            |
| `endsWith`   | String ends with   | `{ field: "sku", operator: "endsWith", value: "BLK" }`              |
| `exists`     | Field exists       | `{ field: "deletedAt", operator: "exists", value: false }`          |
| `between`    | Range              | `{ field: "price", operator: "between", value: [1000, 5000] }`      |

---

## Sort Rules

```typescript
interface SortRule {
  field: string;
  order: SortOrder; // "asc" | "desc"
}
```

---

## Mongo Filter Builder

The `buildMongoFilter()` utility converts filter rules to MongoDB query objects:

```typescript
import { buildMongoFilter } from "@/shared/core";

const filters = [
  { field: "status", operator: "eq", value: "active" },
  { field: "price", operator: "between", value: [1000, 5000] },
  { field: "name", operator: "contains", value: "wireless" },
];

const mongoQuery = buildMongoFilter(filters);
// Result: { status: "active", price: { $gte: 1000, $lte: 5000 }, name: { $regex: "wireless", $options: "i" } }
```

---

## Query Options

```typescript
interface QueryOptions {
  filters?: FilterRule[];
  sort?: SortRule[];
  page?: number;
  limit?: number;
  search?: string;
  searchFields?: string[];
}

interface QueryResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```
