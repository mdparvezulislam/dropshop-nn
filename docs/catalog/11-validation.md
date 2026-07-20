# 11 - Validation

## Overview

All catalog inputs are validated at multiple layers: Zod schemas at the action boundary, service-level business rules, and database-level constraints.

## Unique Constraints

| Field | Scope | Enforced At |
|-------|-------|-------------|
| SKU | Global | Repository (unique index) |
| Slug | Global | Repository (unique index) |
| Barcode | Global | Repository (unique sparse index) |
| GTIN | Global | Repository (unique sparse index) |

## Required Fields

### Product Creation
- `name` — min 2 characters, max 255
- `sku` — min 2 characters, alphanumeric + hyphens
- At least one variant must be provided
- `brandId` — recommended but not required
- `categoryId` — recommended but not required

### Variant
- `sku` — min 2 characters, unique within product
- At least one variant dimension

### Brand Creation
- `name` — min 2 characters, max 100
- `slug` — auto-generated if not provided

### Category Creation
- `name` — min 2 characters, max 100
- `slug` — auto-generated if not provided
- `parentCategoryId` — must reference existing category if provided

### Collection
- `name` — min 2 characters, max 100
- `productIds` — must reference existing products

## Business Rules

| Rule | Error | Layer |
|------|-------|-------|
| SKU must be unique | "SKU already exists" | Service |
| Slug must be unique | Auto-generated unique slug | Service |
| Cannot publish without variants | "Product must have at least one active variant" | Service |
| Cannot publish without category | "Product must have a category before publishing" | Service (configurable) |
| Cannot archive an already archived product | "Product is already archived" | Service |
| Only one featured image | "Only one featured image allowed" | Service |

## Validation Layers

```
Zod Schema (action boundary)
  │  Format validation, required fields, string lengths
  ▼
Service Layer (business logic)
  │  Uniqueness, status transitions, business rules
  ▼
Database (data integrity)
  │  Unique indexes, required schema fields
  ▼
MongoDB
```

## Error Format

Validation errors follow the standard format:

```typescript
{
  success: false,
  error: "Validation failed",
  errors: {
    sku: ["SKU already exists"],
    name: ["Product name is required"],
  }
}
```
