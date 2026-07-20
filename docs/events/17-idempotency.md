# 17 - Idempotency

## Overview

Idempotency ensures that processing the same event multiple times produces the same result. This is critical for reliability — network failures, retries, and duplicate deliveries must not cause data corruption.

---

## Idempotency Key

Every event has a unique `eventId` (UUID v7). The event ID serves as the idempotency key.

```typescript
interface IdempotencyRecord {
  eventId: string           // The idempotency key
  subscriberName: string    // Which subscriber processed it
  processedAt: Date         // When it was first processed
  status: 'completed' | 'processing' | 'failed'
  resultHash?: string       // Hash of the result (for verification)
  expiresAt: Date           // TTL expiration
}
```

---

## Idempotency Check Flow

```
Event Received by Subscriber
    │
    ├── Generate idempotency key = eventId + subscriberName
    │
    ├── Check Idempotency Store (Redis)
    │       │
    │       ├── Found & 'completed' → SKIP (return cached result)
    │       ├── Found & 'processing' → WAIT (concurrent detection)
    │       ├── Found & 'failed' → REPROCESS (previous attempt failed)
    │       └── Not found → PROCESS (first attempt)
    │
    ├── If processing:
    │       ├── SET idempotency key → 'processing' (with TTL)
    │       ├── Execute handler logic
    │       ├── SET idempotency key → 'completed' (with TTL)
    │       └── Return result
    │
    └── If skipped:
        └── Return cached result (if available)
```

---

## Idempotency Store

### Redis Implementation

```typescript
class IdempotencyStore {
  private readonly prefix = 'dropshop:idempotency:'
  private readonly defaultTTL = 60 * 60 * 24  // 24 hours

  async isProcessed(eventId: string, subscriber: string): Promise<boolean> {
    const key = this.buildKey(eventId, subscriber)
    const record = await redis.get(key)
    if (!record) return false

    const parsed: IdempotencyRecord = JSON.parse(record)
    return parsed.status === 'completed'
  }

  async markProcessing(eventId: string, subscriber: string): Promise<boolean> {
    const key = this.buildKey(eventId, subscriber)
    const result = await redis.set(key, JSON.stringify({
      eventId,
      subscriberName: subscriber,
      processedAt: new Date(),
      status: 'processing',
      expiresAt: new Date(Date.now() + this.defaultTTL * 1000),
    }), 'NX', 'EX', this.defaultTTL)

    return result === 'OK'
  }

  async markCompleted(eventId: string, subscriber: string, ttl?: number): Promise<void> {
    const key = this.buildKey(eventId, subscriber)
    const record: IdempotencyRecord = {
      eventId,
      subscriberName: subscriber,
      processedAt: new Date(),
      status: 'completed',
      expiresAt: new Date(Date.now() + (ttl || this.defaultTTL) * 1000),
    }
    await redis.setex(key, ttl || this.defaultTTL, JSON.stringify(record))
  }

  async markFailed(eventId: string, subscriber: string): Promise<void> {
    const key = this.buildKey(eventId, subscriber)
    const existing = await redis.get(key)
    const record: IdempotencyRecord = existing
      ? { ...JSON.parse(existing), status: 'failed' }
      : {
          eventId,
          subscriberName: subscriber,
          processedAt: new Date(),
          status: 'failed',
          expiresAt: new Date(Date.now() + this.defaultTTL * 1000),
        }
    await redis.setex(key, this.defaultTTL, JSON.stringify(record))
  }

  private buildKey(eventId: string, subscriber: string): string {
    return `${this.prefix}${eventId}:${subscriber}`
  }
}
```

### MongoDB Fallback

If Redis is unavailable, a MongoDB collection `idempotency_keys` serves as the fallback:

```typescript
IdempotencyKey {
  _id: string           // eventId + subscriberName composite
  eventId: string
  subscriberName: string
  processedAt: Date
  status: 'completed' | 'processing' | 'failed'
  createdAt: Date       // TTL index: expireAfterSeconds: 86400
}
```

---

## Idempotency Window

The idempotency window defines how long the system remembers processed events.

| Event Type | Idempotency Window | Rationale |
|-----------|-------------------|-----------|
| order.created | 7 days | Prevent duplicate orders |
| payment.completed | 7 days | Prevent double charges |
| inventory.adjusted | 24 hours | Stock double-count prevention |
| price.updated | 24 hours | Pricing consistency |
| notification.sent | 1 hour | Prevent duplicate notifications |
| analytics.event | 5 minutes | Acceptable dedup window |

---

## Concurrent Processing Detection

When two workers pick up the same event simultaneously:

1. Worker A calls `markProcessing` → succeeds (NX)
2. Worker B calls `markProcessing` → fails (key exists with 'processing')
3. Worker B waits 100ms and retries
4. Worker A completes and calls `markCompleted`
5. Worker B reads 'completed' → skips

If Worker A crashes:
- `markProcessing` set a TTL (e.g., 5 minutes)
- After TTL expires, key is removed
- BullMQ retries the job
- Next attempt succeeds

---

## Subscriber Implementation

```typescript
class IdempotentSubscriber {
  private readonly idempotencyStore = new IdempotencyStore()
  private readonly subscriberName: string

  async handle(event: BusinessEvent): Promise<void> {
    // Check idempotency
    if (await this.idempotencyStore.isProcessed(event.eventId, this.subscriberName)) {
      logger.debug('Skipping already processed event', {
        eventId: event.eventId,
        subscriber: this.subscriberName,
      })
      return
    }

    // Mark as processing (atomic)
    const acquired = await this.idempotencyStore.markProcessing(
      event.eventId,
      this.subscriberName,
    )
    if (!acquired) {
      // Another worker is processing — wait and retry
      await this.delay(500)
      return this.handle(event)
    }

    try {
      // Execute business logic
      await this.processEvent(event)

      // Mark as completed
      await this.idempotencyStore.markCompleted(event.eventId, this.subscriberName)
    } catch (error) {
      // Mark as failed (allows retry)
      await this.idempotencyStore.markFailed(event.eventId, this.subscriberName)
      throw error
    }
  }

  protected async processEvent(event: BusinessEvent): Promise<void> {
    throw new Error('Subclasses must implement processEvent')
  }
}
```
