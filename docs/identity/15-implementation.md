# 15 - Implementation Guide

## Module Structure

```
src/features/identity/
├── domain/
│   ├── business-profile-entity.ts    # BusinessProfile type
│   ├── store-profile-entity.ts       # StoreProfile type
│   ├── business-workspace-entity.ts  # BusinessWorkspace type
│   └── identity-events.ts            # Event payload types
├── repositories/
│   ├── business-profile-model.ts     # Mongoose schema + model
│   ├── business-profile-repository.ts
│   ├── store-profile-model.ts
│   ├── store-profile-repository.ts
│   ├── business-workspace-model.ts
│   └── business-workspace-repository.ts
├── services/
│   ├── identity-service.ts           # Registration orchestration
│   ├── business-profile-service.ts   # Business profile CRUD
│   ├── approval-service.ts           # Approval logic
│   ├── verification-service.ts       # Email/phone verification
│   ├── workspace-service.ts          # Workspace automation
│   └── session-service.ts            # Session management
├── actions/
│   ├── registration-actions.ts       # Registration server actions
│   ├── business-profile-actions.ts   # Business profile CRUD actions
│   ├── verification-actions.ts       # Approval/rejection actions
│   ├── session-actions.ts            # Session management actions
│   └── profile-actions.ts            # Personal profile actions
├── types/
│   └── validation.ts                 # Zod schemas for all inputs
├── index.ts                          # Barrel exports
├── components/
│   └── .gitkeep
└── hooks/
    └── .gitkeep
```

## Implementation Order

1. **Domain entities** — Define types first (no dependencies)
2. **Event payload types** — Define event structure
3. **Validation schemas** — Define Zod schemas
4. **Mongoose models** — Define DB schemas
5. **Repositories** — Data access layer
6. **Services** — Business logic layer
7. **Actions** — Server action layer
8. **Index** — Barrel exports

## Dependencies

| File            | Imports From                                                    |
| --------------- | --------------------------------------------------------------- |
| Domain entities | `@/shared/lib/database/types` (BaseDBEntity)                    |
| Models          | `@/shared/lib/database/base-schema`, mongoose                   |
| Repositories    | `@/shared/lib/database/generic-repository`, models              |
| Services        | Repositories, `@/shared/lib/event-bus`, `@/shared/utils/logger` |
| Actions         | Services, `@/shared/lib/auth`, `@/shared/errors/app-error`      |
| Validation      | `@/shared/utils/validation`, zod                                |

## Key Patterns

### Repository Pattern

```typescript
class BusinessProfileRepository extends BaseRepository<TDoc, TDomain> {
  constructor() {
    super(Model, this.mapToDomain)
  }
  private static mapToDomain(doc): TDomain { ... }
}
```

### Service Orchestration

```typescript
class ApprovalService {
  async approve(businessProfileId: string, actor: ActorInfo) {
    // 1. Validate business exists and is pending
    // 2. Update status and verification
    // 3. Publish event
    // 4. Trigger workspace creation automation
    // 5. Return updated entity
  }
}
```

### Action Guard

```typescript
"use server";
export async function action(formData: any) {
  const session = await auth();
  checkPermission(session, "Identity.Approve");
  const validated = schema.parse(formData);
  // ... service call
}
```

## Testing (Future)

- Unit tests for each service
- Integration tests for approval flow
- E2E tests for registration flows
- Permission tests for RBAC enforcement
