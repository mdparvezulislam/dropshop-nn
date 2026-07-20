# 20 - Future Queue Architecture

## Overview

The current event system uses BullMQ as its async transport. The architecture is designed to support alternative queue backends — Redis, cloud queues (SQS, Pub/Sub), or a mix — without redesigning the event bus.

---

## Queue Abstraction Layer

```
Event Bus
    │
    ▼
QueueAdapter interface
    │
    ├── BullMQAdapter (current)
    ├── RedisStreamAdapter (future)
    ├── SQSAdapter (future)
    └── GooglePubSubAdapter (future)
```

---

## Queue Adapter Interface

```typescript
interface QueueAdapter {
  enqueue(queueName: string, event: BusinessEvent, options?: QueueOptions): Promise<void>;
  enqueueBulk(queueName: string, events: BusinessEvent[], options?: QueueOptions): Promise<void>;
  getQueueStatus(queueName: string): Promise<QueueStatus>;
  pause(queueName: string): Promise<void>;
  resume(queueName: string): Promise<void>;
}

interface QueueOptions {
  delay?: number; // ms
  priority?: number; // 1-10
  attempts?: number;
  backoff?: BackoffOptions;
  idempotencyKey?: string;
  deduplicationId?: string; // SQS FIFO dedup
}

interface QueueStatus {
  waiting: number;
  active: number;
  delayed: number;
  failed: number;
  completed: number;
}
```

---

## BullMQ Adapter (Current)

```typescript
class BullMQAdapter implements QueueAdapter {
  private queues: Map<string, Queue> = new Map();

  async enqueue(queueName: string, event: BusinessEvent, options?: QueueOptions): Promise<void> {
    const queue = this.getOrCreateQueue(queueName);
    await queue.add(event.eventType, event, {
      delay: options?.delay,
      priority: options?.priority,
      attempts: options?.attempts,
      backoff: options?.backoff,
      deduplication: options?.deduplicationId ? { id: options.deduplicationId } : undefined,
    });
  }

  async enqueueBulk(
    queueName: string,
    events: BusinessEvent[],
    options?: QueueOptions,
  ): Promise<void> {
    const queue = this.getOrCreateQueue(queueName);
    await queue.addBulk(
      events.map((event) => ({
        name: event.eventType,
        data: event,
        opts: {
          delay: options?.delay,
          priority: options?.priority,
          attempts: options?.attempts,
        },
      })),
    );
  }

  private getOrCreateQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      this.queues.set(name, new Queue(name, { connection: bullMQConnection }));
    }
    return this.queues.get(name)!;
  }

  async getQueueStatus(queueName: string): Promise<QueueStatus> {
    const queue = this.getOrCreateQueue(queueName);
    const [waiting, active, delayed, failed, completed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getDelayedCount(),
      queue.getFailedCount(),
      queue.getCompletedCount(),
    ]);
    return { waiting, active, delayed, failed, completed };
  }

  async pause(queueName: string): Promise<void> {
    const queue = this.getOrCreateQueue(queueName);
    await queue.pause();
  }

  async resume(queueName: string): Promise<void> {
    const queue = this.getOrCreateQueue(queueName);
    await queue.resume();
  }
}
```

---

## Redis Streams Adapter (Future)

```typescript
class RedisStreamAdapter implements QueueAdapter {
  private readonly streamPrefix = "dropshop:stream:";

  async enqueue(queueName: string, event: BusinessEvent, options?: QueueOptions): Promise<void> {
    const streamKey = `${this.streamPrefix}${queueName}`;
    await redis.xadd(
      streamKey,
      "MAXLEN",
      "~",
      "10000", // Approximate trim
      "*",
      "event",
      JSON.stringify(event),
      "idempotencyKey",
      options?.idempotencyKey || event.eventId,
    );
  }

  async enqueueBulk(
    queueName: string,
    events: BusinessEvent[],
    options?: QueueOptions,
  ): Promise<void> {
    const streamKey = `${this.streamPrefix}${queueName}`;
    const pipeline = redis.pipeline();
    for (const event of events) {
      pipeline.xadd(
        streamKey,
        "MAXLEN",
        "~",
        "10000",
        "*",
        "event",
        JSON.stringify(event),
        "idempotencyKey",
        options?.idempotencyKey || event.eventId,
      );
    }
    await pipeline.exec();
  }
}
```

---

## SQS Adapter (Future)

```typescript
class SQSAdapter implements QueueAdapter {
  private readonly queueUrls: Map<string, string> = new Map();

  async enqueue(queueName: string, event: BusinessEvent, options?: QueueOptions): Promise<void> {
    const queueUrl = await this.getQueueUrl(queueName);
    await sqs.sendMessage({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(event),
      MessageDeduplicationId: options?.deduplicationId || event.eventId,
      MessageGroupId: event.eventType,
      DelaySeconds: options?.delay ? Math.floor(options.delay / 1000) : undefined,
    });
  }

  async enqueueBulk(
    queueName: string,
    events: BusinessEvent[],
    options?: QueueOptions,
  ): Promise<void> {
    const queueUrl = await this.getQueueUrl(queueName);
    const entries = events.map((event, index) => ({
      Id: `msg-${index}`,
      MessageBody: JSON.stringify(event),
      MessageDeduplicationId: options?.deduplicationId || event.eventId,
      MessageGroupId: event.eventType,
    }));

    // SQS supports max 10 messages per batch
    for (let i = 0; i < entries.length; i += 10) {
      await sqs.sendMessageBatch({
        QueueUrl: queueUrl,
        Entries: entries.slice(i, i + 10),
      });
    }
  }
}
```

---

## Configuration

```typescript
// src/shared/config/app-config.ts
eventBus: {
  adapter: "bullmq" | "redis_streams" | "sqs" | "google_pubsub";
  bullmq: {
    connection: {
      (host, port, password);
    }
    prefix: "dropshop:queue:";
  }
  redisStreams: {
    maxLength: 10000;
    consumerGroup: "dropshop-events";
  }
  sqs: {
    region: "ap-southeast-1";
    queuePrefix: "dropshop-events-";
  }
}
```

---

## Queue Naming Convention

```
<category>-<priority>

Examples:
  pricing-high
  inventory-medium
  notifications-low
  analytics-low
  reporting-low
```

---

## Switching Queues

To switch from BullMQ to SQS (or any future queue):

1. Implement the `QueueAdapter` interface
2. Update `appConfig.eventBus.adapter`
3. Deploy worker services that read from SQS
4. Monitor both queues during transition
5. Decommission old queue

No changes to the Event Bus, subscribers, or publishers are required.

---

## Multi-Queue Strategy

Different event categories can use different queue backends:

| Event Category  | Recommended Queue | Rationale                         |
| --------------- | ----------------- | --------------------------------- |
| order.*         | BullMQ            | Needs retry, DLQ, delayed jobs    |
| payment.*       | BullMQ            | Transactional, needs exactly-once |
| analytics.*     | Redis Streams     | High throughput, loss-tolerant    |
| notifications.* | SQS               | High durability, managed service  |
| reporting.*     | SQS/Scheduled     | Batch processing, low priority    |
