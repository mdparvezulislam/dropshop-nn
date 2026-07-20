# 05 - Base Service

## Overview

`BaseService` in `src/shared/core/base-service.ts` is the abstract foundation that every feature service extends. It provides standardized lifecycle hooks for validation, authorization, event publishing, audit, analytics, and notifications.

---

## Generic Parameters

```typescript
abstract class BaseService<T extends DomainEntity, TCreate, TUpdate>
  implements ContractService<T, TCreate, TUpdate>
```

- `T` — Domain entity type
- `TCreate` — Create input type
- `TUpdate` — Update input type

---

## Lifecycle Hooks

```typescript
interface ServiceHooks<T, TUpdate> {
  beforeUpdate?: (id: string, data: TUpdate, actor?: ActorInfo) => Promise<void>
  afterUpdate?: (entity: T, actor?: ActorInfo) => Promise<void>
  beforeDelete?: (id: string, actor?: ActorInfo) => Promise<void>
  afterDelete?: (id: string, actor?: ActorInfo) => Promise<void>
  validateCreate?: (data: Record<string, unknown>) => Promise<void>
  validateUpdate?: (id: string, data: Record<string, unknown>) => Promise<void>
  authorize?: (action: string, actor?: ActorInfo) => Promise<boolean>
}
```

Hooks are injected via the constructor and called automatically.

---

## Built-in Publishing Methods

Every `BaseService` has access to:

| Method | Description | Implementation |
|--------|-------------|---------------|
| `checkAuthorization(action, actor)` | Authorization guard | Uses `hooks.authorize` |
| `publishEvent(eventType, data, actor)` | Publish business event | Uses `EventBus.publish` |
| `logAudit(action, entityType, entityId, actor, changes)` | Record audit | Uses logger |
| `trackAnalytics(event, data, actor)` | Track analytics | Uses logger |
| `triggerNotification(type, recipients, data)` | Send notification | Publishes `notification.trigger` event |

---

## Service Contract

Every feature service must extend `BaseService` and implement the `ContractService` interface:

```typescript
class MyService extends BaseService<MyEntity, CreateInput, UpdateInput> {
  protected readonly domainName = "my-module"

  constructor() {
    super({
      authorize: async (action, actor) => {
        // Custom authorization logic
        return true
      },
      validateCreate: async (data) => {
        // Custom validation
      },
    })
  }

  async create(data: CreateInput, actor?: ActorInfo): Promise<MyEntity> {
    await this.checkAuthorization("create", actor)
    await this.hooks?.validateCreate?.(data as unknown as Record<string, unknown>)

    const entity = await this.repository.create(data, actor)

    await this.publishEvent("my-entity.created", { id: entity.id }, actor)
    await this.logAudit("Created", "MyEntity", entity.id, actor)
    await this.trackAnalytics("my-entity.created", { id: entity.id }, actor)

    return entity
  }
}
```

---

## Pattern: Every Service Should

1. **Check authorization** first — `await this.checkAuthorization(action, actor)`
2. **Validate** before processing — via hooks or explicit calls
3. **Execute business logic** — call repository, apply domain rules
4. **Publish event** — `await this.publishEvent(eventType, data, actor)`
5. **Log audit** — `await this.logAudit(action, entityType, entityId, actor, changes)`
6. **Track analytics** — `await this.trackAnalytics(event, data, actor)`
7. **Return result** — domain entity or error
