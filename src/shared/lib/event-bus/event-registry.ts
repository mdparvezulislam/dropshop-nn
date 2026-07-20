import type { EventRegistryEntry, SyncEventSubscriber, AsyncEventSubscriber, SubscriberConfig, RetryConfig } from "./types";

export class EventRegistry {
  private static entries = new Map<string, EventRegistryEntry>();
  private static syncHandlers = new Map<string, SyncEventSubscriber[]>();
  private static asyncHandlers = new Map<string, AsyncEventSubscriber[]>();

  private constructor() {}

  static register(eventType: string, config: EventRegistryEntry): void {
    if (this.entries.has(eventType)) {
      throw new Error(`Event type "${eventType}" is already registered`);
    }
    this.entries.set(eventType, config);
  }

  static registerSyncSubscriber(eventType: string, subscriber: SyncEventSubscriber): void {
    const handlers = this.syncHandlers.get(eventType) || [];
    handlers.push(subscriber);
    handlers.sort((a, b) => a.priority - b.priority);
    this.syncHandlers.set(eventType, handlers);
  }

  static registerAsyncSubscriber(eventType: string, subscriber: AsyncEventSubscriber): void {
    const handlers = this.asyncHandlers.get(eventType) || [];
    handlers.push(subscriber);
    handlers.sort((a, b) => {
      const aEntry = this.entries.get(eventType);
      const bEntry = this.entries.get(eventType);
      const aPriority = aEntry?.subscribers.find((s) => s.name === subscriber.handlerName)?.priority ?? 5;
      const bPriority = bEntry?.subscribers.find((s) => s.name === subscriber.handlerName)?.priority ?? 5;
      return aPriority - bPriority;
    });
    this.asyncHandlers.set(eventType, handlers);
  }

  static getEntry(eventType: string): EventRegistryEntry | undefined {
    return this.entries.get(eventType);
  }

  static getSubscribers(eventType: string): SubscriberConfig[] {
    return this.entries.get(eventType)?.subscribers ?? [];
  }

  static getRetryConfig(eventType: string): RetryConfig | undefined {
    return this.entries.get(eventType)?.retryConfig;
  }

  static getHandlerType(eventType: string): "sync" | "async" | undefined {
    return this.entries.get(eventType)?.handlerType;
  }

  static getSyncHandlers(eventType: string): SyncEventSubscriber[] {
    return this.syncHandlers.get(eventType) ?? [];
  }

  static getAsyncHandlers(eventType: string): AsyncEventSubscriber[] {
    return this.asyncHandlers.get(eventType) ?? [];
  }

  static isRegistered(eventType: string): boolean {
    return this.entries.has(eventType);
  }

  static getAllEvents(): Map<string, EventRegistryEntry> {
    return new Map(this.entries);
  }

  static remove(eventType: string): boolean {
    this.syncHandlers.delete(eventType);
    this.asyncHandlers.delete(eventType);
    return this.entries.delete(eventType);
  }

  static clear(): void {
    this.entries.clear();
    this.syncHandlers.clear();
    this.asyncHandlers.clear();
  }
}
