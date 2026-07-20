# 03 - Base Model

## Overview

The base model defines the standard fields and behavior for every MongoDB collection in the platform. It is implemented through Mongoose schema composition in `src/shared/lib/database/base-schema.ts`.

---

## Fields

Every collection automatically includes:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | String | Auto | - | Virtual field mapped from `_id` |
| `createdAt` | Date | Auto | - | Set by Mongoose timestamps |
| `updatedAt` | Date | Auto | - | Set by Mongoose timestamps |
| `createdBy` | String | No | - | Who created the record |
| `updatedBy` | String | No | - | Who last updated the record |
| `deletedAt` | Date | No | null | When soft-deleted |
| `isDeleted` | Boolean | No | false | Soft delete flag |
| `status` | String | No | "active" | Record status |
| `metadata` | Mixed | No | - | Flexible metadata map |

---

## JSON Serialization

On serialization (`.toJSON()` / `.toObject()`):

- `_id` → `id` (string)
- `__v` → removed
- `isDeleted: true` records are hidden by default

---

## Soft Delete

Soft-deleted records are automatically excluded from queries via the `softDeletePlugin`:

- `find`, `findOne`, `findOneAndUpdate`, `updateOne`, `updateMany`, `countDocuments` all filter `{ isDeleted: { $ne: true } }`
- Use `.isDeleted(true)` to include deleted records
- Hard delete is available via `hardDelete()` for cleanup

---

## Usage

Every Mongoose model uses the base schema:

```typescript
import { Schema } from "mongoose"
import { baseFieldsDefinition, baseSchemaOptions, softDeletePlugin } from "@/shared/lib/database/base-schema"

const mySchema = new Schema(
  {
    // Engine-specific fields
    name: { type: String, required: true },
    ...baseFieldsDefinition,
  },
  baseSchemaOptions,
)

softDeletePlugin(mySchema)
```
