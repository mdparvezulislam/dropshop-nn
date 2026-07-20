import { logger } from "@/shared/utils/logger";
import { generateUUID } from "@/shared/utils/id-utils";
import { EventRegistry } from "./event-registry";
import { IdempotencyStore } from "./idempotency";
import { getQueue } from "@/shared/lib/bullmq";
import type {
  BusinessEvent,
  EventActor,
  EventRegistryEntry,
  RetryConfig,
} from "./types";
import { EventPublishError } from "./types";

export class EventBus {
  private static instance: EventBus;
  private readonly idempotencyStore: IdempotencyStore;

  private constructor() {
    this.idempotencyStore = new IdempotencyStore();
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  async publish(
    eventType: string,
    data: Record<string, unknown>,
    options?: {
      actor?: EventActor;
      correlationId?: string;
      causationId?: string;
      eventVersion?: number;
      source?: string;
    },
  ): Promise<BusinessEvent> {
    const entry = EventRegistry.getEntry(eventType);
    if (!entry) {
      logger.warn("EventBus: publishing unregistered event type", { eventType });
    }

    const event: BusinessEvent = {
      eventId: generateUUID(),
      eventType,
      eventVersion: options?.eventVersion ?? entry?.version ?? 1,
      timestamp: new Date().toISOString(),
      source: options?.source ?? "unknown",
      correlationId: options?.correlationId ?? generateUUID(),
      causationId: options?.causationId,
      actor: options?.actor,
      data,
    };

    try {
      await this.dispatch(event, entry);
      logger.info("EventBus: event published", {
        eventId: event.eventId,
        eventType,
        correlationId: event.correlationId,
      });
    } catch (error) {
      logger.error("EventBus: event dispatch failed", error, {
        eventId: event.eventId,
        eventType,
      });
      throw new EventPublishError(eventType, event.eventId, error as Error);
    }

    return event;
  }

  private async dispatch(
    event: BusinessEvent,
    entry?: EventRegistryEntry,
  ): Promise<void> {
    const syncHandlers = EventRegistry.getSyncHandlers(event.eventType);
    const asyncHandlers = EventRegistry.getAsyncHandlers(event.eventType);

    const globalSyncHandlers = EventRegistry.getSyncHandlers("*");

    const allSync = [...syncHandlers, ...globalSyncHandlers].sort(
      (a, b) => a.priority - b.priority,
    );

    const results = await Promise.allSettled(
      allSync.map((handler) =>
        this.executeSyncHandler(handler.eventType, handler, event),
      ),
    );

    for (const result of results) {
      if (result.status === "rejected") {
        logger.error("EventBus: sync handler failed", result.reason, {
          eventId: event.eventId,
          eventType: event.eventType,
        });
      }
    }

    for (const handler of asyncHandlers) {
      await this.enqueueAsyncHandler(event, handler.handlerName, handler.queue, entry);
    }
  }

  private async executeSyncHandler(
    originalEventType: string,
    handler: { eventType: string; handle: (event: BusinessEvent) => Promise<void> },
    event: BusinessEvent,
  ): Promise<void> {
    const handlerName = handler.constructor?.name ?? "anonymous";

    if (handler.eventType !== "*" && handler.eventType !== event.eventType) return;

    try {
      await handler.handle(event);
    } catch (error) {
      logger.error("EventBus: sync handler error", error, {
        handlerName,
        eventId: event.eventId,
        eventType: event.eventType,
      });
    }
  }

  private async enqueueAsyncHandler(
    event: BusinessEvent,
    handlerName: string,
    queueName: string,
    entry?: EventRegistryEntry,
  ): Promise<void> {
    const retryConfig = entry?.retryConfig;
    const initialBackoff = retryConfig?.initialBackoffMs ?? 1000;
    const maxRetries = retryConfig?.maxRetries ?? 3;

    try {
      const queue = getQueue(queueName);
      await queue.add(handlerName, event, {
        attempts: maxRetries + 1,
        backoff: {
          type: "exponential",
          delay: initialBackoff,
        },
        removeOnComplete: true,
        removeOnFail: false,
      });
    } catch (error) {
      logger.error("EventBus: failed to enqueue async handler", error, {
        handlerName,
        queueName,
        eventId: event.eventId,
        eventType: event.eventType,
      });
      throw error;
    }
  }

  static async publish(
    eventType: string,
    data: Record<string, unknown>,
    options?: {
      actor?: EventActor;
      correlationId?: string;
      causationId?: string;
      eventVersion?: number;
      source?: string;
    },
  ): Promise<BusinessEvent> {
    return EventBus.getInstance().publish(eventType, data, options);
  }
}
