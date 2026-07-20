# 06 - Error System

## Overview

The error system provides a hierarchy of typed exception classes that every engine uses. Errors carry semantic meaning (what went wrong), HTTP status codes (for API responses), and optional details.

---

## Error Hierarchy

```
Error
 └── AppError (abstract)
      ├── ValidationError      (400)
      ├── NotFoundError        (404)
      ├── UnauthorizedError    (401)
      ├── ForbiddenError       (403)
      ├── ConflictError        (409)
      ├── DatabaseError        (500)
      └── InternalServerError  (500)
```

---

## Core Error Classes

All in `src/shared/errors/app-error.ts`:

| Class | Status Code | When to Use |
|-------|-------------|-------------|
| `AppError` | 500 (default) | Base class for all application errors |
| `ValidationError` | 400 | Invalid input, schema validation failure |
| `NotFoundError` | 404 | Requested resource does not exist |
| `UnauthorizedError` | 401 | Authentication required |
| `ForbiddenError` | 403 | Insufficient permissions |
| `ConflictError` | 409 | Duplicate, state conflict |
| `DatabaseError` | 500 | Database operation failure |
| `InternalServerError` | 500 | Unexpected system error |

---

## Structure

```typescript
class AppError extends Error {
  statusCode: number     // HTTP status code
  isOperational: boolean // True = expected error, False = bug
  details?: unknown      // Additional error context
}
```

---

## Usage Pattern

```typescript
// Throw in service layer
if (!entity) throw new NotFoundError("Product not found")

if (duplicate) throw new ConflictError("SKU already exists", { sku })

// Catch in action layer
try {
  return await service.create(data)
} catch (error) {
  if (error instanceof AppError) {
    return { success: false, error: error.message }
  }
  throw error
}
```
