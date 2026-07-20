# 13 - Event Architecture

## Overview

The event architecture decouples all modules. Instead of services calling each other directly, they publish and subscribe to business events. This enables the loose coupling required for the Automation Engine, Reporting Engine, Analytics Engine, and Notification Engine to operate independently.

---

## Event Bus

The Event Bus is the central nervous system of the platform. It supports both synchronous (in-process) and asynchronous (BullMQ) event delivery.

### Architecture

```
Publisher (Service/Action)
    │
    ├── EventBus.publish(event)
    │       │
    │       ├── Synchronous Handlers (in-process)
    │       │   ├── AuditLogger
    │       │   ├── ActivityRecorder
    │       │   └── Fast, non-blocking handlers
    │       │
    │       ├── Async Handlers (BullMQ)
    │       │   ├── AutomationEngine
    │       │   ├── AnalyticsEngine
    │       │   ├── NotificationEngine
    │       │   ├── SearchIndexUpdater
    │       │   ├── DashboardRefresher
    │       │   └── ReportQueue
    │       │
    │       └── External Webhooks (Future)
    │           ├── Zapier
    │           ├── Custom webhook endpoints
    │           └── Partner integrations
    │
    ▼
All subscribers receive the event
```

---

## Event Structure

```typescript
interface BusinessEvent {
  id: string; // Unique event ID (UUID)
  type: string; // Event type (e.g., "product.created")
  source: string; // Module name (e.g., "product-service")
  timestamp: Date; // When the event occurred
  actor?: {
    // Who triggered the event
    id: string;
    role: string;
  };
  data: Record<string, any>; // Event payload
  metadata?: {
    // Optional context
    correlationId?: string; // Trace across multiple events
    causationId?: string; // Parent event ID
    tenantId?: string;
  };
}
```

---

## Event Types Catalog

### Product Events

```
product.created
product.updated
product.published
product.archived
product.deleted
product.viewed
```

### Pricing Events

```
pricing.created
pricing.updated
pricing.overridden
pricing.bulk_updated
pricing.campaign_started
pricing.campaign_ended
```

### Inventory Events

```
inventory.created
inventory.stock_in
inventory.stock_out
inventory.adjusted
inventory.reserved
inventory.released
inventory.low_stock
inventory.out_of_stock
inventory.back_in_stock
inventory.transferred
```

### Order Events

```
order.created
order.updated
order.fulfilled
order.cancelled
order.returned
order.refunded
order.payment_received
order.payment_failed
order.shipment_created
order.shipment_delivered
```

### User Events

```
user.registered
user.verified
user.logged_in
user.logged_out
user.profile_updated
user.password_changed
user.deleted
```

### Reseller Events

```
reseller.created
reseller.updated
reseller.verified
reseller.suspended
reseller.activated
reseller.product_assigned
reseller.product_removed
reseller.price_updated
```

### Supplier Events

```
supplier.created
supplier.updated
supplier.verified
supplier.suspended
supplier.product_added
supplier.price_changed
supplier.stock_updated
```

### System Events

```
system.config_updated
system.maintenance_mode
system.report_generated
system.backup_completed
```

---

## Event Bus Implementation

```typescript
class EventBus {
  private handlers: Map<string, EventHandler[]>;
  private asyncHandlers: Map<string, string[]>; // event type → BullMQ queue

  publish(event: BusinessEvent): void {
    // 1. Call synchronous handlers
    for (const handler of this.handlers.get(event.type) || []) {
      handler.handle(event);
    }

    // 2. Enqueue async handlers
    for (const queueName of this.asyncHandlers.get(event.type) || []) {
      BullMQQueue.add(queueName, event);
    }

    // 3. Log event
    AuditLogger.log("event.published", event);
  }

  subscribe(eventType: string, handler: EventHandler): void;
  subscribeAsync(eventType: string, queueName: string): void;
}
```

---

## Event Handler Types

| Type           | Execution                | Use Case                                |
| -------------- | ------------------------ | --------------------------------------- |
| Synchronous    | In-process, same request | Audit log, activity timeline            |
| Async (BullMQ) | Background job           | Automation, analytics, notifications    |
| Delayed        | BullMQ with delay        | Future automations (e.g., 24h reminder) |
| Scheduled      | BullMQ cron              | Daily digests, report generation        |
| External       | Webhook                  | Third-party integrations                |

---

## Event Ordering & Consistency

- Events from the same aggregate are published in order
- Async handlers may process events out of order (eventual consistency)
- Idempotency keys prevent duplicate processing
- Dead letter queue captures failed events for manual inspection

---

## Event Store (Future)

For audit, debugging, and replay:

- All events stored in an `EventStore` collection
- Supports event sourcing patterns in the future
- Enables full system state reconstruction
- Powers the Business Timeline feature

---

## Module Communication Diagram

```
           ┌─────────────┐
           │   Product   │
           └──────┬──────┘
                  │ events
                  ▼
      ┌─────────────────────┐
      │     Event Bus       │
      └──┬───┬───┬───┬───┬─┘
         │   │   │   │   │
         ▼   ▼   ▼   ▼   ▼
    ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐
    │Prc│ │Inv│ │Res│ │Sup│ │Ord│
    │ing│ │ent│ │ell│ │pli│ │ers│
    └───┘ └───┘ └───┘ └───┘ └───┘

    Auto-Engine  │  Analytics  │  Notifications  │  Reports
    ─────────────┴─────────────┴────────────────┴──────────
```
