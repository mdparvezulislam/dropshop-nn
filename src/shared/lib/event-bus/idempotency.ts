import { getRedisClient } from "@/shared/lib/redis";
import { logger } from "@/shared/utils/logger";
import type { IdempotencyRecord } from "./types";

export class IdempotencyStore {
  private readonly prefix = "dropshop:idempotency:";
  private readonly defaultTTL = 60 * 60 * 24;

  async isProcessed(eventId: string, subscriber: string): Promise<boolean> {
    try {
      const key = this.buildKey(eventId, subscriber);
      const redis = getRedisClient();
      const record = await redis.get(key);
      if (!record) return false;

      const parsed: IdempotencyRecord = JSON.parse(record);
      return parsed.status === "completed";
    } catch (error) {
      logger.warn("IdempotencyStore: isProcessed check failed, defaulting to unprocessed", {
        error: error instanceof Error ? error.message : String(error),
        eventId,
        subscriber,
      });
      return false;
    }
  }

  async markProcessing(eventId: string, subscriber: string): Promise<boolean> {
    try {
      const key = this.buildKey(eventId, subscriber);
      const redis = getRedisClient();
      const ttl = this.defaultTTL;

      const record: IdempotencyRecord = {
        eventId,
        subscriberName: subscriber,
        processedAt: new Date(),
        status: "processing",
        expiresAt: new Date(Date.now() + ttl * 1000),
      };

      const result = await redis.set(key, JSON.stringify(record), "EX", ttl, "NX");

      return result === "OK";
    } catch (error) {
      logger.error("IdempotencyStore: markProcessing failed", error, {
        eventId,
        subscriber,
      });
      return false;
    }
  }

  async markCompleted(eventId: string, subscriber: string, ttl?: number): Promise<void> {
    try {
      const key = this.buildKey(eventId, subscriber);
      const redis = getRedisClient();
      const expiresIn = ttl ?? this.defaultTTL;

      const record: IdempotencyRecord = {
        eventId,
        subscriberName: subscriber,
        processedAt: new Date(),
        status: "completed",
        expiresAt: new Date(Date.now() + expiresIn * 1000),
      };

      await redis.setex(key, expiresIn, JSON.stringify(record));
    } catch (error) {
      logger.error("IdempotencyStore: markCompleted failed", error, {
        eventId,
        subscriber,
      });
    }
  }

  async markFailed(eventId: string, subscriber: string): Promise<void> {
    try {
      const key = this.buildKey(eventId, subscriber);
      const redis = getRedisClient();

      const existing = await redis.get(key);
      const record: IdempotencyRecord = existing
        ? { ...JSON.parse(existing), status: "failed" as const }
        : {
            eventId,
            subscriberName: subscriber,
            processedAt: new Date(),
            status: "failed" as const,
            expiresAt: new Date(Date.now() + this.defaultTTL * 1000),
          };

      await redis.setex(key, this.defaultTTL, JSON.stringify(record));
    } catch (error) {
      logger.error("IdempotencyStore: markFailed failed", error, {
        eventId,
        subscriber,
      });
    }
  }

  async remove(eventId: string, subscriber: string): Promise<void> {
    try {
      const key = this.buildKey(eventId, subscriber);
      const redis = getRedisClient();
      await redis.del(key);
    } catch (error) {
      logger.error("IdempotencyStore: remove failed", error, {
        eventId,
        subscriber,
      });
    }
  }

  private buildKey(eventId: string, subscriber: string): string {
    return `${this.prefix}${eventId}:${subscriber}`;
  }
}
