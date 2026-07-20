# 01 - Event System Overview

## Purpose

The Event System decouples all feature modules. Instead of services importing and calling each other directly, they publish typed business events. Any interested module subscribes and reacts asynchronously.

This is the foundation for the Automation Engine, Analytics Engine, Notification Engine, Reporting Engine, Audit System, and Business Timeline.

---

## Core Principle

> Every business action publishes exactly one event. Downstream effects are handled by subscribers, never by the publisher.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Publisher                          │
│  (Server Action / Service Layer)                     │
│                                                      │
│  1. Perform business operation                       │
│  2. Publish event via EventBus.publish()             │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│                    Event Bus                          │
│                                                      │
│  EventRegistry.lookup(eventType) → Subscriber[]       │
│                                                      │
│  For each subscriber:                                 │
│    ├── Sync  → Execute immediately (audit, timeline) │
│    └── Async → Enqueue to BullMQ queue               │
│                                                      │
│  Attach metadata:                                     │
│    ├── id (UUID)                                     │
│    ├── correlationId (trace across events)            │
│    └── causationId (parent event)                     │
└──────────────────────┬──────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
┌─────────────────┐    ┌─────────────────────────┐
│ Sync Subscribers │    │   Async Subscribers       │
│                  │    │   (BullMQ Workers)        │
│ • AuditLogger   │    │                           │
│ • Timeline      │    │ • AutomationEngine        │
│                 │    │ • AnalyticsEngine         │
│                 │    │ • NotificationEngine      │
│                 │    │ • ReportingEngine         │
│                 │    │ • SearchIndexService      │
│                 │    │ • DashboardService        │
│                 │    │ • WebhookDispatcher       │
│                 │    │                           │
│                 │    │ Retry → DLQ → Alert       │
└─────────────────┘    └─────────────────────────┘
```

---

## Key Concepts

| Concept             | Description                                        |
| ------------------- | -------------------------------------------------- |
| **Event**           | A typed message representing a business occurrence |
| **Publisher**       | The service/action that emits the event            |
| **Subscriber**      | A handler that processes the event                 |
| **Event Bus**       | Central dispatcher routing events to subscribers   |
| **Event Registry**  | Maps event types to their subscribers              |
| **Correlation ID**  | Traces a request across multiple events            |
| **Causation ID**    | Links a child event to its parent event            |
| **Idempotency Key** | Prevents duplicate processing                      |

---

## Event Lifecycle

```
1. CREATE
   └── Service performs business logic
       └── EventBus.publish(event)
           ├── Validate event payload
           ├── Generate event ID (UUID v7)
           ├── Attach metadata (correlationId, causationId)
           └── Store in EventLog

2. DISPATCH
   └── EventRegistry.lookup(eventType)
       ├── Sync handlers → execute immediately
       └── Async handlers → enqueue to BullMQ
           ├── Apply idempotency check
           └── Enqueue with retry config

3. PROCESS
   └── Async worker picks up job
       ├── Idempotency check (skip if already processed)
       ├── Execute handler logic
       ├── On success → acknowledge job
       ├── On failure → retry with backoff
       └── On max retries → DLQ

4. COMPLETE
   └── Log completion
       ├── Update EventLog status
       ├── Analytics event
       └── Audit trail entry
```

---

## Synchronous vs Asynchronous

| Aspect             | Synchronous                         | Asynchronous                         |
| ------------------ | ----------------------------------- | ------------------------------------ |
| Execution          | In-process, same request            | BullMQ worker                        |
| Blocking           | Blocks publisher                    | Non-blocking                         |
| Use Case           | Audit, Timeline, Cache invalidation | Automation, Analytics, Notifications |
| Reliability        | Fails with publisher                | Retry + DLQ                          |
| Ordering           | Guaranteed in-order                 | Best-effort order                    |
| Performance Impact | Adds latency                        | Zero latency impact                  |

---

## Event Naming Convention

```
<domain>.<action>.<past_tense>  (e.g., product.created)
```

- **Domain**: The feature module (product, pricing, inventory, order, customer, reseller, supplier, payment, system)
- **Action**: What happened (created, updated, deleted, published, archived, status_changed)
- **Past tense**: Past tense verb

Examples:

- `product.created`
- `pricing.updated`
- `inventory.stock_decreased`
- `order.shipped`
- `customer.registered`

---

## File Structure

```
src/shared/lib/event-bus/
├── index.ts                   # Public API (EventBus, publish, subscribe)
├── types.ts                   # Event interfaces and type definitions
├── event-bus.ts               # Core EventBus implementation
├── event-registry.ts          # Event type → subscriber mapping
├── idempotency.ts             # Idempotency key store
├── retry-strategy.ts          # Retry configuration per event type
├── business-timeline.ts       # Timeline event collector
└── errors.ts                  # Event-specific errors
```
