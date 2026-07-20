# 02 - Domain Contracts

## Overview

Domain contracts define the standard interfaces that every engine must implement. They ensure consistency across all feature modules — every repository, service, and publisher follows the same contract.

---

## Entity Contract

```typescript
interface DomainEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SoftDeletableEntity extends DomainEntity {
  deletedAt?: Date | null;
  isDeleted: boolean;
}

interface AuditableEntity extends SoftDeletableEntity {
  createdBy?: string;
  updatedBy?: string;
  version: number;
  status: string;
}
```

Every domain entity must extend `DomainEntity` at minimum. Entities that support soft delete extend `SoftDeletableEntity`. Entities requiring full audit support extend `AuditableEntity`.

---

## Repository Contract

```typescript
interface ContractRepository<T extends DomainEntity, TCreate, TUpdate> {
  create(data: TCreate, actor?: ActorInfo): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(filters?: Record<string, unknown>): Promise<T[]>;
  update(id: string, data: TUpdate, actor?: ActorInfo): Promise<T>;
  delete(id: string, actor?: ActorInfo): Promise<boolean>;
  restore(id: string, actor?: ActorInfo): Promise<T>;
  count(filters?: Record<string, unknown>): Promise<number>;
}
```

Every engine's repository must implement this contract. The existing `BaseRepository` in `src/shared/lib/database/` provides the concrete implementation with MongoDB.

---

## Service Contract

```typescript
interface ContractService<T extends DomainEntity, TCreate, TUpdate> {
  create(data: TCreate, actor?: ActorInfo): Promise<T>;
  findById(id: string): Promise<T | null>;
  update(id: string, data: TUpdate, actor?: ActorInfo): Promise<T>;
  delete(id: string, actor?: ActorInfo): Promise<boolean>;
}
```

Every engine's service must implement this contract. The `BaseService` abstract class in core provides lifecycle hooks for validation, authorization, event publishing, audit, and analytics.

---

## Publisher Contracts

### Event Publisher

```typescript
interface EventPublisherContract {
  publish(
    eventType: string,
    data: Record<string, unknown>,
    actor?: ActorInfo,
    correlationId?: string,
  ): Promise<BusinessEvent>;
}
```

### Audit Publisher

```typescript
interface AuditPublisherContract {
  record(
    action: string,
    entityType: string,
    entityId: string,
    actor: ActorInfo,
    changes?: ChangeRecord[],
    metadata?: Record<string, unknown>,
  ): Promise<void>;
}
```

### Analytics Publisher

```typescript
interface AnalyticsPublisherContract {
  track(event: string, data: Record<string, unknown>, actor?: ActorInfo): Promise<void>;
}
```

### Notification Publisher

```typescript
interface NotificationPublisherContract {
  send(
    type: string,
    recipients: string[],
    data: Record<string, unknown>,
    channels?: string[],
  ): Promise<void>;
}
```

---

## Shared Types

```typescript
interface ActorInfo {
  id: string;
  name?: string;
  role?: string;
}

interface ChangeRecord {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}
```

---

## Contract Enforcement

Contracts are enforced through TypeScript types — not runtime checks. Every engine module must:

1. `implement ContractRepository<T, TCreate, TUpdate>` for its repository
2. Extend `BaseService<T, TCreate, TUpdate>` for its service
3. Use `EventPublisherContract` for event publishing
4. Use `AuditPublisherContract` for audit logging
5. Use the standardized `ActorInfo` type for user context
