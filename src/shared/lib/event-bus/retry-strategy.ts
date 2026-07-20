import { EventRegistry } from "./event-registry";
import type { RetryConfig } from "./types";

export const RETRYABLE_ERRORS = [
  "NetworkError",
  "TimeoutError",
  "DatabaseError",
  "RateLimitError",
  "ConflictError",
  "MongoNetworkError",
  "MongooseError",
  "RedisError",
];

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialBackoffMs: 1000,
  backoffMultiplier: 2,
  maxBackoffMs: 30000,
  retryableErrors: RETRYABLE_ERRORS,
  deadLetterQueue: "dlq",
};

export const RETRY_CONFIGS: Record<string, Partial<RetryConfig>> = {
  "order.created": {
    maxRetries: 5,
    initialBackoffMs: 1000,
    backoffMultiplier: 2,
    maxBackoffMs: 60000,
  },
  "order.shipped": {
    maxRetries: 3,
    initialBackoffMs: 2000,
    backoffMultiplier: 2,
    maxBackoffMs: 30000,
  },
  "payment.completed": {
    maxRetries: 3,
    initialBackoffMs: 1000,
    backoffMultiplier: 2,
    maxBackoffMs: 30000,
  },
  "payment.failed": {
    maxRetries: 2,
    initialBackoffMs: 1000,
    backoffMultiplier: 2,
    maxBackoffMs: 10000,
  },
  "inventory.low_stock_detected": {
    maxRetries: 2,
    initialBackoffMs: 5000,
    backoffMultiplier: 1,
    maxBackoffMs: 30000,
  },
  "inventory.out_of_stock": {
    maxRetries: 2,
    initialBackoffMs: 5000,
    backoffMultiplier: 1,
    maxBackoffMs: 30000,
  },
  "product.created": {
    maxRetries: 3,
    initialBackoffMs: 1000,
    backoffMultiplier: 2,
    maxBackoffMs: 30000,
  },
  "product.updated": {
    maxRetries: 3,
    initialBackoffMs: 1000,
    backoffMultiplier: 2,
    maxBackoffMs: 30000,
  },
  "product.deleted": {
    maxRetries: 3,
    initialBackoffMs: 1000,
    backoffMultiplier: 2,
    maxBackoffMs: 30000,
  },
  "price.updated": {
    maxRetries: 3,
    initialBackoffMs: 1000,
    backoffMultiplier: 2,
    maxBackoffMs: 30000,
  },
  "customer.registered": {
    maxRetries: 3,
    initialBackoffMs: 1000,
    backoffMultiplier: 2,
    maxBackoffMs: 30000,
  },
  "supplier.approved": {
    maxRetries: 3,
    initialBackoffMs: 1000,
    backoffMultiplier: 2,
    maxBackoffMs: 30000,
  },
  "system.login": {
    maxRetries: 2,
    initialBackoffMs: 500,
    backoffMultiplier: 2,
    maxBackoffMs: 5000,
  },
  "system.logout": {
    maxRetries: 2,
    initialBackoffMs: 500,
    backoffMultiplier: 2,
    maxBackoffMs: 5000,
  },
};

export function getRetryConfigForEvent(eventType: string): RetryConfig {
  const fromRegistry = EventRegistry.getRetryConfig(eventType);
  if (fromRegistry) return fromRegistry;

  const overrides = RETRY_CONFIGS[eventType];
  if (overrides) {
    return { ...DEFAULT_RETRY_CONFIG, ...overrides };
  }

  return { ...DEFAULT_RETRY_CONFIG };
}

export function getRetryOptions(config: RetryConfig): {
  attempts: number;
  backoff: { type: "exponential"; delay: number };
} {
  return {
    attempts: config.maxRetries + 1,
    backoff: {
      type: "exponential",
      delay: config.initialBackoffMs,
    },
  };
}

export function isRetryableError(error: Error): boolean {
  return RETRYABLE_ERRORS.some(
    (errorType) =>
      error.name === errorType ||
      error.name.includes(errorType) ||
      error.message.includes(errorType),
  );
}

export function calculateBackoff(
  attempt: number,
  config: RetryConfig,
): number {
  const backoff = config.initialBackoffMs * Math.pow(config.backoffMultiplier, attempt);
  return Math.min(backoff, config.maxBackoffMs);
}
