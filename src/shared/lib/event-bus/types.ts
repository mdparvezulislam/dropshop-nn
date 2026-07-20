export interface BusinessEvent {
  eventId: string
  eventType: string
  eventVersion: number
  timestamp: string
  source: string
  correlationId: string
  causationId?: string
  actor?: EventActor
  data: Record<string, unknown>
}

export interface EventActor {
  id: string
  name?: string
  role?: string
}

export interface SyncEventSubscriber {
  readonly eventType: string
  readonly priority: number
  handle(event: BusinessEvent): Promise<void>
}

export interface AsyncEventSubscriber {
  readonly eventType: string
  readonly queue: string
  readonly handlerName: string
  handle(event: BusinessEvent): Promise<void>
}

export interface SubscriberConfig {
  name: string
  description?: string
  eventType: string
  handlerType: "sync" | "async"
  queue?: string
  priority: number
  enabled: boolean
  maxRetries?: number
  maxProcessingTime?: number
  concurrency?: number
}

export interface RetryConfig {
  maxRetries: number
  initialBackoffMs: number
  backoffMultiplier: number
  maxBackoffMs: number
  retryableErrors: string[]
  deadLetterQueue: string
}

export interface IdempotencyRecord {
  eventId: string
  subscriberName: string
  processedAt: Date
  status: "completed" | "processing" | "failed"
  resultHash?: string
  expiresAt: Date
}

export interface TimelineEntry {
  id: string
  entityType: string
  entityId: string
  eventType: string
  action: string
  summary: string
  actor?: EventActor
  changes?: TimelineChange[]
  metadata?: Record<string, unknown>
  correlationId?: string
  timestamp: Date
}

export interface TimelineChange {
  field: string
  oldValue?: unknown
  newValue?: unknown
}

export interface QueueStatus {
  waiting: number
  active: number
  delayed: number
  failed: number
  completed: number
}

export interface QueueOptions {
  delay?: number
  priority?: number
  attempts?: number
  backoff?: { delay: number; multiplier?: number }
  idempotencyKey?: string
  deduplicationId?: string
}

export interface QueueAdapter {
  enqueue(queueName: string, event: BusinessEvent, options?: QueueOptions): Promise<void>
  enqueueBulk(queueName: string, events: BusinessEvent[], options?: QueueOptions): Promise<void>
  getQueueStatus(queueName: string): Promise<QueueStatus>
  pause(queueName: string): Promise<void>
  resume(queueName: string): Promise<void>
}

export interface EventRegistryEntry {
  eventType: string
  description: string
  version: number
  handlerType: "sync" | "async"
  subscribers: SubscriberConfig[]
  retryConfig: RetryConfig
  idempotencyWindow: number
  maxProcessingTime: number
}

export interface EventVersionInfo {
  eventType: string
  currentVersion: number
  versions: {
    version: number
    createdAt: string
    changelog: string
  }[]
  deprecatedVersions: number[]
  sunsetDate?: string
}

export class EventError extends Error {
  constructor(
    message: string,
    public readonly eventType: string,
    public readonly eventId: string,
    public readonly cause?: Error,
  ) {
    super(message)
    this.name = "EventError"
  }
}

export class EventPublishError extends EventError {
  constructor(eventType: string, eventId: string, cause?: Error) {
    super(`Failed to publish event: ${eventType}`, eventType, eventId, cause)
    this.name = "EventPublishError"
  }
}

export class EventHandlerError extends EventError {
  constructor(
    eventType: string,
    eventId: string,
    public readonly handlerName: string,
    cause?: Error,
  ) {
    super(
      `Handler ${handlerName} failed for event: ${eventType}`,
      eventType,
      eventId,
      cause,
    )
    this.name = "EventHandlerError"
  }
}
