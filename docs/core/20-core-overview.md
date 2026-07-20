# 20 - Core Overview

## Overview

The Core Foundation provides the shared infrastructure that every engine in DropshopNN depends on. It ensures consistency, eliminates code duplication, and enforces architectural contracts across all feature modules.

---

## Dependency Graph

```
Every Feature Engine
    │
    ├── depends on → src/shared/core/  (contracts, base classes, utilities)
    ├── depends on → src/shared/types/ (base types + entities)
    ├── depends on → src/shared/errors/ (error hierarchy)
    ├── depends on → src/shared/constants/ (enums + constants)
    ├── depends on → src/shared/config/ (env + app config)
    ├── depends on → src/shared/lib/database/ (BaseRepository, connection)
    ├── depends on → src/shared/lib/event-bus/ (EventBus, event types)
    └── depends on → src/shared/utils/ (logger, validation, formatting)
```

---

## Core Layer Map

### src/shared/core/ (New — this phase)

```
core/
├── types.ts              → Shared domain enums, type aliases, interfaces
├── result.ts             → Result<T, E> pattern (Success / Failure)
├── contracts.ts          → Standardized contracts for Entity, Repository, Service, Publishers
├── base-service.ts       → Abstract BaseService with lifecycle hooks
├── feature-flags.ts      → FeatureFlag registry + Settings registry
├── localization.ts       → i18n (Bangla/English), currency, date, BD mobile
├── permissions.ts        → Permission definitions, Role definitions, RBAC types
├── filtering.ts          → Reusable FilterRule, SortRule, Mongo builder
├── search.ts             → SearchEngineContract interface
├── import-export.ts      → CSV/JSON generation and parsing
└── health.ts             → Health check infrastructure
```

### src/shared/lib/ (Pre-existing — foundation)

```
lib/
├── database/
│   ├── base-schema.ts          → Base fields, schema options, soft delete plugin
│   ├── generic-repository.ts   → BaseRepository (CRUD, pagination, transactions)
│   ├── connection-manager.ts   → MongoDB connection pool management
│   ├── query-builder.ts        → Pagination/sort parsing, transaction helper
│   └── types.ts                → BaseDocument, DatabaseQueryOptions
└── event-bus/
    ├── types.ts                → BusinessEvent, subscriber types
    ├── event-bus.ts            → EventBus (publish/dispatch)
    ├── event-registry.ts       → EventRegistry (type → subscriber mapping)
    ├── idempotency.ts          → IdempotencyStore (Redis)
    ├── retry-strategy.ts       → Retry configuration per event type
    └── business-timeline.ts    → Timeline entry recording
```

### src/shared/ (Pre-existing — utilities)

```
shared/
├── config/       → env.ts, app-config.ts
├── constants/    → Enums, route configs, permission constants
├── errors/       → AppError hierarchy
├── types/        → BaseEntity, PaginationParams, etc.
└── utils/        → logger, validation, currency, id, slug, date, etc.
```

---

## Engine Initialization Order

Every engine initializes in the same way:

```typescript
// 1. Register feature flags
FeatureFlags.register({ key: "my-engine", name: "My Engine", defaultState: "off" })

// 2. Register settings
Settings.register({ key: "my-engine.some-config", defaultValue: "value" })

// 3. Register events
EventRegistry.register("my-entity.created", { ... })
EventRegistry.registerAsyncSubscriber("my-entity.created", new MySubscriber())

// 4. Register health checks
healthService.register("my-engine", async () => ({ name: "my-engine", status: "healthy" }))

// 5. Engine is ready
```

---

## What Every Engine Inherits

| Capability            | Source                           | How                                |
| --------------------- | -------------------------------- | ---------------------------------- |
| Entity base contract  | `DomainEntity`                   | `implements DomainEntity`          |
| Repository CRUD       | `BaseRepository`                 | `extends BaseRepository`           |
| Service lifecycle     | `BaseService`                    | `extends BaseService`              |
| Event publishing      | `EventBus.publish()`             | `this.publishEvent()`              |
| Audit logging         | Logger                           | `this.logAudit()`                  |
| Analytics tracking    | Logger                           | `this.trackAnalytics()`            |
| Notification triggers | Event                            | `this.triggerNotification()`       |
| Authorization         | `AuthorizationService`           | `this.checkAuthorization()`        |
| Error handling        | `AppError` hierarchy             | `throw new NotFoundError()`        |
| Pagination            | `BaseRepository.findPaginated()` | Query params                       |
| Filtering             | `buildMongoFilter()`             | Filter rules                       |
| Search                | `SearchEngineContract`           | `implements SearchEngineContract`  |
| Import/Export         | `generateCsv()`, `parseCsv()`    | Data utilities                     |
| Localization          | `Localization`                   | `formatCurrency()`, `formatDate()` |
| Health checks         | `HealthService`                  | `healthService.register()`         |

---

## Future Implementation Roadmap

Based on the core foundation, the next engine implementation phases should be:

### Phase 1: Foundation (CORE-001 — This Phase)

- ✅ Core types, contracts, base classes
- ✅ Result pattern
- ✅ Feature flags + settings
- ✅ Permission definitions
- ✅ Localization utilities
- ✅ Filter/sort/search contracts
- ✅ Import/export utilities
- ✅ Health check infrastructure

### Phase 2: Identity Engine (AUTH-001)

- Multi-role authentication
- RBAC enforcement
- Session management
- User profile management
- Permission seeding

### Phase 3: Catalog Engine (CAT-001)

- Product CRUD with event publishing
- Category, brand, tag management
- Variant management
- Search indexing

### Phase 4: Pricing Engine (PRC-002)

- Price calculation engine
- Wholesale tier management
- Campaign/flash sale management
- Pricing rule engine integration

### Phase 5: Inventory Engine (INV-002)

- Stock management with events
- Reservation system
- Low stock detection
- Warehouse operations

### Phase 6: Order Engine (ORD-001)

- Order lifecycle management
- Fulfillment workflows
- Return/refund processing
- Courier dispatch integration

### Phase 7: Finance Engine (FIN-001)

- Payment gateway integration
- Wallet management
- Payout processing
- Invoice generation

### Phase 8: Automation Engine (AUTO-001)

- Event-driven automation workflows
- Cross-engine orchestration
- Scheduled tasks

### Phase 9: Analytics Engine (ANL-001)

- Dashboard metrics
- Report generation
- Event-based data aggregation

### Phase 10: Notification Engine (NTF-001)

- Multi-channel dispatch
- Template management
- User preference management
