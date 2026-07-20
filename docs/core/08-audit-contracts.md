# 08 - Audit Contracts

## Overview

Audit contracts define how every engine records audit entries. The audit system provides an immutable, append-only record of meaningful business actions.

---

## Audit Entry Structure

```typescript
interface AuditEntry {
  id: string;
  action: string; // e.g., "product.created", "pricing.updated"
  entityType: string; // e.g., "Product", "ProductPricing"
  entityId: string; // ID of the affected entity
  actor: {
    id: string;
    name: string;
    role: string;
  };
  changes: {
    // What changed (for updates)
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
  context: {
    ip?: string;
    userAgent?: string;
    sessionId?: string;
    correlationId?: string;
    requestId?: string;
  };
  timestamp: Date;
  metadata?: Record<string, unknown>;
}
```

---

## What Gets Audited

| Action Type                  | Always Audited? |
| ---------------------------- | --------------- |
| Entity creation              | ✅              |
| Entity update (with changes) | ✅              |
| Status change                | ✅              |
| Soft delete                  | ✅              |
| Permission change            | ✅              |
| Login/logout                 | ✅              |
| Payment event                | ✅              |
| Export operation             | ✅              |
| Bulk operation               | ✅              |
| View event                   | ⚙️ Configurable |

---

## Audit Publisher Contract

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

---

## Storage

Active audit entries are stored in the `audit_entries` MongoDB collection with:

- 30-day retention in primary collection
- Archive to `audit_entries_archive` after 30 days
- 1-year total retention for compliance

Indexes:

```
{ entityType: 1, entityId: 1, timestamp: -1 }
{ actor.id: 1, timestamp: -1 }
{ action: 1, timestamp: -1 }
{ timestamp: -1 }  // TTL index
```
