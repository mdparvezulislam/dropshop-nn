# 15 - Subscriber Guidelines

## Overview

Subscribers process events published through the Event Bus. This document defines how to create, register, and handle subscribers correctly.

---

## Subscriber Types

### Synchronous Subscriber
Executes in the same process and request. Use for fast, critical operations.

```typescript
class AuditSubscriber implements SyncEventSubscriber {
  get eventType(): string {
    return '*'
  }

  get priority(): number {
    return 1
  }

  async handle(event: BusinessEvent): Promise<void> {
    await AuditLogger.log(event)
  }
}
```

**Rules:**
- Must complete in < 100ms
- Never throw (catch all errors)
- No external API calls
- No heavy computation
- Used only for: Audit, Timeline, Cache invalidation

### Asynchronous Subscriber
Executes in a BullMQ worker. Use for all business logic that can be deferred.

```typescript
class PricingInitSubscriber implements AsyncEventSubscriber {
  get eventType(): string {
    return 'product.created'
  }

  get queue(): string {
    return 'pricing'
  }

  async handle(event: BusinessEvent): Promise<void> {
    const { productId } = event.data
    const pricingService = new PricingService()
    await pricingService.createDefault({ productId })
  }
}
```

**Rules:**
- Must be idempotent (can run multiple times safely)
- Must handle failures gracefully
- Should log processing time
- Should validate event version before processing

---

## Subscriber Registration

All subscribers must be registered in the Event Registry.

### In Code

```typescript
// src/shared/lib/event-bus/registrations.ts

import { EventRegistry } from './event-registry'
import { AuditSubscriber } from '@/features/audit/subscribers/audit-subscriber'
import { PricingInitSubscriber } from '@/features/pricing/subscribers/pricing-init-subscriber'
import { InventoryInitSubscriber } from '@/features/inventory/subscribers/inventory-init-subscriber'

export function registerAllSubscribers(): void {
  // Sync subscribers
  EventRegistry.registerSubscriber('*', new AuditSubscriber())

  // Async subscribers
  EventRegistry.registerSubscriber('product.created', new PricingInitSubscriber())
  EventRegistry.registerSubscriber('product.created', new InventoryInitSubscriber())
}
```

### In Configuration

```typescript
// Alternatively use config-based registration
EventRegistry.register('product.created', {
  subscribers: [
    {
      name: 'PricingInitHandler',
      handler: 'pricing-init-handler',
      queue: 'pricing',
      priority: 1,
      enabled: true,
    },
  ],
})
```

---

## Subscriber Best Practices

### 1. Be Idempotent
```typescript
class MySubscriber {
  async handle(event: BusinessEvent): Promise<void> {
    // Check if already processed
    const existing = await this.store.findById(event.data.entityId)
    if (existing) {
      return  // Already processed, skip
    }

    // Process
    await this.store.create(event.data)
  }
}
```

### 2. Validate Event Version
```typescript
async handle(event: BusinessEvent): Promise<void> {
  if (event.eventVersion < 1) {
    throw new Error(`Unsupported event version: ${event.eventVersion}`)
  }

  if (event.eventVersion === 1) {
    return this.handleV1(event)
  }

  // Future version handling
}
```

### 3. Use Correlation ID for Tracing
```typescript
async handle(event: BusinessEvent): Promise<void> {
  const logger = logger.child({ correlationId: event.correlationId })
  logger.info('Processing event', { eventType: event.eventType })

  // All downstream operations use same correlation ID
  await this.service.process(event.data, {
    correlationId: event.correlationId,
  })
}
```

### 4. Handle Errors Gracefully
```typescript
async handle(event: BusinessEvent): Promise<void> {
  try {
    await this.service.process(event.data)
  } catch (error) {
    // Log with full context
    logger.error('Failed to process event', error, {
      eventId: event.eventId,
      eventType: event.eventType,
      correlationId: event.correlationId,
    })

    // Re-throw for retry mechanism
    throw error
  }
}
```

### 5. Monitor Processing Time
```typescript
async handle(event: BusinessEvent): Promise<void> {
  const start = Date.now()
  try {
    await this.service.process(event.data)
  } finally {
    const duration = Date.now() - start
    if (duration > 1000) {
      logger.warn('Slow subscriber', {
        eventType: event.eventType,
        duration,
        threshold: 1000,
      })
    }
  }
}
```

---

## Subscriber Contract

Every subscriber MUST:

1. Implement `SyncEventSubscriber` or `AsyncEventSubscriber` interface
2. Register with the Event Registry before the app starts
3. Handle event versioning
4. Be idempotent
5. Log failures with correlation ID
6. Complete within the configured `maxProcessingTime`

Every subscriber SHOULD:

1. Validate event payload before processing
2. Monitor processing time
3. Use the correlation ID for tracing
4. Handle graceful degradation (downstream service unavailable)
5. Publish child events with the parent causationId

---

## Subscriber Configuration

```typescript
interface SubscriberConfig {
  name: string
  description?: string
  eventType: string
  handlerType: 'sync' | 'async'
  queue?: string           // Required for async
  priority: number         // 1-10 (1 = highest)
  enabled: boolean
  maxRetries?: number
  maxProcessingTime?: number  // ms
  concurrency?: number        // Async workers per queue
}
```
