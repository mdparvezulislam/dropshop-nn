# 16 - Retry Strategy

## Overview

Every event subscriber has a configurable retry strategy. The system uses BullMQ's built-in retry mechanism with exponential backoff and dead letter queue support.

---

## Retry Configuration

```typescript
interface RetryConfig {
  maxRetries: number;
  initialBackoffMs: number;
  backoffMultiplier: number;
  maxBackoffMs: number;
  retryableErrors: string[]; // Error types that trigger retry
  deadLetterQueue: string; // Queue for failed jobs
}
```

---

## Retry Strategies by Event Type

| Event Type             | Max Retries | Backoff | Backoff Multiplier | Max Backoff |
| ---------------------- | ----------- | ------- | ------------------ | ----------- |
| product.created        | 3           | 1000ms  | 2x                 | 30000ms     |
| product.updated        | 3           | 1000ms  | 2x                 | 30000ms     |
| product.deleted        | 3           | 1000ms  | 2x                 | 30000ms     |
| price.updated          | 3           | 1000ms  | 2x                 | 30000ms     |
| order.created          | 5           | 1000ms  | 2x                 | 60000ms     |
| order.shipped          | 3           | 2000ms  | 2x                 | 30000ms     |
| payment.completed      | 3           | 1000ms  | 2x                 | 30000ms     |
| payment.failed         | 2           | 1000ms  | 2x                 | 10000ms     |
| inventory.low_stock    | 2           | 5000ms  | 1x                 | 30000ms     |
| inventory.out_of_stock | 2           | 5000ms  | 1x                 | 30000ms     |
| supplier.approved      | 3           | 1000ms  | 2x                 | 30000ms     |
| customer.registered    | 3           | 1000ms  | 2x                 | 30000ms     |
| system.login           | 2           | 500ms   | 2x                 | 5000ms      |

---

## Backoff Calculation

```
Attempt 0: initialBackoffMs (e.g., 1000ms)
Attempt 1: initialBackoffMs * backoffMultiplier (e.g., 2000ms)
Attempt 2: initialBackoffMs * backoffMultiplier^2 (e.g., 4000ms)
Attempt N: min(initialBackoffMs * backoffMultiplier^N, maxBackoffMs)
```

Example with 1000ms initial, 2x multiplier, 30000ms max:

```
Retry 1: 1000ms  (1s)
Retry 2: 2000ms  (2s)
Retry 3: 4000ms  (4s)
Retry 4: 8000ms  (8s)
Retry 5: 16000ms (16s)
Retry 6: 30000ms (30s, capped)
```

---

## Retryable Errors

Only certain errors should trigger a retry:

| Error Type          | Retry? | Description                        |
| ------------------- | ------ | ---------------------------------- |
| NetworkError        | ✅     | Downstream service unreachable     |
| TimeoutError        | ✅     | External API timeout               |
| DatabaseError       | ✅     | Temporary database failure         |
| RateLimitError      | ✅     | API rate limit exceeded            |
| ConflictError       | ✅     | Optimistic locking conflict        |
| ValidationError     | ❌     | Invalid payload — will always fail |
| NotFoundError       | ❌     | Referenced entity missing          |
| ForbiddenError      | ❌     | Permission denied                  |
| InternalServerError | ⚠️     | Retry once, then DLQ               |

```typescript
const RETRYABLE_ERRORS = [
  "NetworkError",
  "TimeoutError",
  "DatabaseError",
  "RateLimitError",
  "ConflictError",
];
```

---

## Dead Letter Queue

After exhausting all retries, the event is moved to the Dead Letter Queue (DLQ).

### DLQ Structure

```
Queue: dropshop:dlq:{originalQueueName}

DLQ Entry:
{
  originalEvent: BusinessEvent
  originalQueue: string
  subscriberName: string
  failureReason: string
  errorStack: string
  retryAttempts: number
  firstFailedAt: string
  lastFailedAt: string
}
```

### DLQ Management

- **Monitoring**: Dashboard widget shows DLQ count
- **Manual Retry**: Admin can requeue DLQ entries
- **Alert**: Notification sent when DLQ count exceeds threshold
- **Auto-Cleanup**: DLQ entries older than 7 days are archived

---

## Implementation

```typescript
function getRetryOptions(config: RetryConfig): { attempts: number; backoff: BackoffOptions } {
  return {
    attempts: config.maxRetries + 1, // +1 for initial attempt
    backoff: {
      type: "exponential",
      delay: config.initialBackoffMs,
    },
  };
}

async function enqueueWithRetry(
  queue: Queue,
  event: BusinessEvent,
  subscriberName: string,
  retryConfig: RetryConfig,
): Promise<void> {
  await queue.add(subscriberName, event, {
    attempts: retryConfig.maxRetries + 1,
    backoff: {
      type: "exponential",
      delay: retryConfig.initialBackoffMs,
    },
    removeOnComplete: true,
    removeOnFail: false, // Keep in DLQ for inspection
  });
}
```

---

## Circuit Breaker

For subscribers that repeatedly fail, a circuit breaker prevents wasted retries:

```typescript
interface CircuitBreakerState {
  failureCount: number;
  lastFailureAt: Date | null;
  state: "closed" | "open" | "half_open";
  threshold: number;
  cooldownMs: number;
}
```

- **Closed**: Normal operation (default)
- **Open**: Rejecting all events (after N consecutive failures)
- **Half-Open**: Testing if service recovered (after cooldown)

Circuit breaker state is stored in Redis and checked before each retry.
