# 01 - Core Foundation Overview

## Purpose

The Core Foundation is the shared infrastructure layer that every engine — Identity, Catalog, Pricing, Inventory, Order, Finance, Analytics, Automation, Notification, Reporting — depends on. It provides reusable types, contracts, base classes, utilities, and config that ensure consistency across the entire platform.

## Design Principles

### 1. Generic & Reusable
Everything in `src/shared/core/` is generic by design. No engine-specific logic exists here. Every class, interface, and utility can be used by any module without modification.

### 2. Loosely Coupled
Core modules depend only on TypeScript standard library and other core modules. No feature module is ever imported into core.

### 3. Strongly Typed
All public APIs have explicit TypeScript types. No `any` types in public interfaces.

### 4. Tree Shake Friendly
Each export is independently importable. Importing `result` does not pull in `localization`.

### 5. Production Ready
All core code includes error handling, logging hooks, and is designed for edge cases.

---

## Package Structure

```
src/shared/core/
├── index.ts              # Public API — re-exports everything
├── types.ts              # Shared domain types (enums, interfaces, type aliases)
├── result.ts             # Result pattern (Success/Failure)
├── contracts.ts          # Domain contracts (Entity, Repository, Service, Publisher)
├── base-service.ts       # Abstract base service with lifecycle hooks
├── feature-flags.ts      # Feature flag system + settings registry
├── localization.ts       # i18n (Bangla/English), currency, date, mobile validation
├── permissions.ts        # Permission definitions, role definitions, RBAC types
├── filtering.ts          # Reusable filter, sort, pagination contracts
├── search.ts             # Search engine contracts
├── import-export.ts      # CSV/JSON import/export utilities
└── health.ts             # Health check infrastructure
```

---

## Dependency Map

```
src/shared/types/    (pre-existing)
    └── BaseEntity, PaginationParams, etc.

src/shared/core/
    ├── types.ts         → extends src/shared/types/
    ├── result.ts        → no deps
    ├── contracts.ts     → depends on event-bus types
    ├── base-service.ts  → depends on contracts, event-bus, logger
    ├── feature-flags.ts → no deps
    ├── localization.ts  → no deps
    ├── permissions.ts   → no deps
    ├── filtering.ts     → no deps
    ├── search.ts        → no deps
    ├── import-export.ts → no deps
    └── health.ts        → depends on DB/Redis connection managers

src/shared/lib/event-bus/    (pre-existing)
    └── EventBus, BusinessEvent, etc.
```

---

## Usage Pattern

Every future engine follows this pattern:

```typescript
import { BaseService } from "@/shared/core";
import type { Result, DomainEntity, ContractRepository } from "@/shared/core";
import { success, failure } from "@/shared/core";

// Everything reusable comes from @/shared/core
// Engine-specific logic stays in its own feature module
```

---

## List of All Shared Core Exports

| Export | Source | Description |
|--------|--------|-------------|
| BaseEntity | types.ts | Base domain entity interface |
| AuditFields | types.ts | Audit tracking fields |
| PaginationParams | types.ts | Page/limit for pagination |
| SortParams | types.ts | Sort field + direction |
| SortOrder | types.ts | asc \| desc |
| QueryFilter | types.ts | Generic query filter |
| Result, success, failure | result.ts | Result pattern |
| DomainEntity | contracts.ts | Core entity contract |
| ContractRepository | contracts.ts | Repository contract interface |
| ContractService | contracts.ts | Service contract interface |
| EventPublisherContract | contracts.ts | Event publishing contract |
| AuditPublisherContract | contracts.ts | Audit recording contract |
| BaseService | base-service.ts | Abstract base service with hooks |
| FeatureFlags | feature-flags.ts | Feature flag registry |
| Settings | feature-flags.ts | Settings registry |
| Localization | localization.ts | i18n utilities |
| SYSTEM_ROLES | permissions.ts | Built-in role definitions |
| HealthService | health.ts | Health check infrastructure |
| FilterRule, buildMongoFilter | filtering.ts | Reusable filtering |
| SearchEngineContract | search.ts | Search interface |
| generateCsv, parseCsv | import-export.ts | CSV utilities |
