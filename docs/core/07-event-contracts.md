# 07 - Event Contracts

## Overview

Event contracts define the standard structure for every business event published across the platform. All events follow the `BusinessEvent` interface defined in `src/shared/lib/event-bus/types.ts`.

---

## Event Structure

```typescript
interface BusinessEvent {
  eventId: string              // UUID v7 — unique identifier
  eventType: string            // e.g., "product.created"
  eventVersion: number         // Payload schema version
  timestamp: string            // ISO 8601 UTC
  source: string               // Module name (e.g., "product-service")
  correlationId: string        // Trace across event chain
  causationId?: string         // Parent event ID (if triggered by another event)
  actor?: EventActor           // Who triggered the event
  data: Record<string, unknown> // Domain payload
}

interface EventActor {
  id: string
  name?: string
  role?: string
}
```

---

## Metadata Fields

| Field | Required | Purpose |
|-------|----------|---------|
| `eventId` | ✅ | Unique idempotency key |
| `eventType` | ✅ | Routing key for subscribers |
| `eventVersion` | ✅ | Schema version for payload compatibility |
| `timestamp` | ✅ | When the event occurred |
| `source` | ✅ | Which module published it |
| `correlationId` | ✅ | Links all events in a request chain |
| `causationId` | ❌ | Links child event to parent |
| `actor` | ❌ | Identity of the user/actor |

---

## Naming Convention

```
<domain>.<action>
```

- Lowercase, dot-separated
- Past tense verbs
- Examples: `product.created`, `order.shipped`, `inventory.stock_adjusted`

---

## Payload Standards

Every event payload in `data` follows:
- Monetary values: integer cents
- Timestamps: ISO 8601 UTC
- Identifiers: MongoDB ObjectId strings
- Enums: snake_case, lowercase
- Changes: standardized `{ field, oldValue, newValue }[]` array

---

## Publisher Contract

```typescript
interface EventPublisherContract {
  publish(
    eventType: string,
    data: Record<string, unknown>,
    actor?: ActorInfo,
    correlationId?: string,
  ): Promise<BusinessEvent>
}
```
