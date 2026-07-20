# 14 - Audit System Architecture

## Overview

The Audit System provides an immutable, append-only record of every meaningful business action. Every audit entry captures what happened, who did it, when, and what changed.

---

## Core Principle

> If it matters, audit it. If it changed data, audit it.

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
    oldValue: any;
    newValue: any;
  }[];
  context: {
    ip?: string;
    userAgent?: string;
    sessionId?: string;
    correlationId?: string; // Links to event that triggered this
    requestId?: string;
  };
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

---

## What Gets Audited

### Always Audited

- All CRUD operations on core entities (Product, Pricing, Inventory, User, Reseller, Supplier, Order)
- All status changes (active → suspended, pending → verified)
- All permission changes
- All configuration changes
- All login/logout events
- All payment events
- All export operations
- All bulk operations

### Configurable Audit

- View events (product views, page visits) — controlled by settings
- Search queries — controlled by settings
- API calls — controlled by rate

---

## Audit Storage

```typescript
AuditEntry {
  // ... fields as above
  // Indexed on:
  //   { entityType: 1, entityId: 1, timestamp: -1 }
  //   { actor.id: 1, timestamp: -1 }
  //   { action: 1, timestamp: -1 }
  //   { timestamp: -1 }  (TTL index for automatic archival)
}
```

Storage strategy:

- Active: MongoDB `audit_entries` collection (30-day retention)
- Archive: MongoDB `audit_entries_archive` or external storage (S3/Azure Blob)
- Retention: 1 year for regulatory compliance, configurable

---

## Audit Logger

```typescript
class AuditLogger {
  static log(action: string, params: AuditParams): Promise<AuditEntry>;
  static findByEntity(
    entityType: string,
    entityId: string,
    options?: QueryOptions,
  ): Promise<AuditEntry[]>;
  static findByActor(actorId: string, options?: QueryOptions): Promise<AuditEntry[]>;
  static findByAction(action: string, dateRange?: DateRange): Promise<AuditEntry[]>;
  static exportAuditLog(filters: AuditFilters, format: "csv" | "json"): Promise<ExportData>;
  static archiveBefore(date: Date): Promise<number>; // Archive old entries
}
```

---

## Integration with Event Bus

The Audit System subscribes to the Event Bus:

```
Event Published
    │
    ▼
AuditLogger Subscriber (Sync Handler)
    │
    ├── Transform event → AuditEntry
    ├── Enrich with actor context
    ├── Calculate changes (if update)
    └── Store in audit_entries collection
```

---

## Audit UI (Dashboard)

- **Audit Log**: Searchable, filterable list of all audit entries
- **Entity Timeline**: Chronological view of all actions on a specific entity
- **User Activity**: All actions performed by a specific user
- **Export**: Download audit log as CSV/JSON
- **Retention Settings**: Configure retention periods per action type

---

## Audit Permissions

| Action               | Admin | Manager | Support |
| -------------------- | :---: | :-----: | :-----: |
| View Audit Log       |   ✓   |    ✓    |    -    |
| View Entity Timeline |   ✓   |    ✓    |    ✓    |
| View User Activity   |   ✓   |    ✓    |    ✓    |
| Export Audit Log     |   ✓   |    ✓    |    -    |
| Configure Retention  |   ✓   |    -    |    -    |
| Delete Audit Entry   |  ✓*   |    -    |    -    |

*Soft-delete only; hard delete requires Super Admin.

---

## Business Timeline

Every entity has an activity timeline powered by the audit system:

```
Product Timeline
    │
    ├── Created (Jul 1, 2026 - Admin)
    ├── Updated (Jul 3, 2026 - Manager) → name, description changed
    ├── Published (Jul 3, 2026 - Manager)
    ├── Pricing Updated (Jul 5, 2026 - Admin) → sellingPrice 1000→1200
    ├── Stock Adjusted (Jul 10, 2026 - Inventory) → +50 units
    └── Archived (Jul 15, 2026 - Admin)
```

The same pattern applies to suppliers, orders, resellers, wholesalers, and any business entity.

---

## Regulatory Compliance

The audit system supports:

- **Data retention**: Configurable per entity type
- **Immutable records**: Append-only; no deletion of critical entries
- **Tamper evidence**: Hash chain for critical entries (future enhancement)
- **Export**: Full audit data export for regulatory review
- **GDPR compliance**: Ability to anonymize user-specific audit entries
