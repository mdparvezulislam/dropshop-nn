# 04 - Base Repository

## Overview

The `BaseRepository` in `src/shared/lib/database/generic-repository.ts` provides the generic CRUD foundation that every feature repository extends. It abstracts Mongoose operations behind a clean domain interface.

---

## Generic Parameters

```typescript
abstract class BaseRepository<TDocument, TDomain extends { id: string }>
```

- `TDocument` — The Mongoose document type (from the model)
- `TDomain` — The clean domain entity type (must have `id: string`)

---

## Methods

| Method | Description | Transaction Support |
|--------|-------------|-------------------|
| `create(data)` | Create a new record | ✅ session |
| `findById(id)` | Find by primary key | ✅ session |
| `findOne(filter)` | Find first matching | ✅ session |
| `find(filter)` | Find all matching | ✅ session |
| `findPaginated(filter, pagination, sort)` | Paginated query | ✅ session |
| `update(id, data)` | Update by primary key | ✅ session |
| `delete(id)` | Soft delete | ✅ session |
| `hardDelete(id)` | Permanently remove | ✅ session |
| `count(filter)` | Count matching | ✅ session |

---

## Transaction Support

All methods accept optional `DatabaseQueryOptions` with a `session` property:

```typescript
interface DatabaseQueryOptions {
  session?: ClientSession
  lean?: boolean
  showDeleted?: boolean
}
```

Use `runInTransaction()` from `src/shared/lib/database/query-builder.ts` for multi-document transactions:

```typescript
await runInTransaction(async (session) => {
  const pricing = await pricingRepo.create(data, { session })
  const inventory = await inventoryRepo.create(data, { session })
})
```

---

## Domain Mapping

Every repository must provide a `toDomainEntity` function that converts a Mongoose document to a clean domain entity:

```typescript
class MyRepository extends BaseRepository<MyDocument, MyEntity> {
  constructor() {
    super(MyModel, (doc) => ({
      id: doc.id,
      name: doc.name,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }))
  }
}
```

---

## Contract

Every feature repository should implement `ContractRepository` from the core contracts:

```typescript
class MyRepository extends BaseRepository<MyDocument, MyEntity>
  implements ContractRepository<MyEntity, CreateInput, UpdateInput>
```
