import { logger } from "@/lib/utils/logger";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const STORE = new Map<string, RateLimitEntry>();

export interface RateLimiterConfig {
  windowMs: number;
  maxRequests: number;
}

export const DEFAULT_RATE_LIMIT: RateLimiterConfig = {
  windowMs: 60_000,
  maxRequests: 100,
};

export class RateLimiter {
  private static configs = new Map<string, RateLimiterConfig>();

  static register(name: string, config: RateLimiterConfig): void {
    this.configs.set(name, config);
    logger.info(
      `RateLimiter: registered "${name}" (${config.maxRequests} req / ${config.windowMs}ms)`,
    );
  }

  static getConfig(name: string): RateLimiterConfig {
    return this.configs.get(name) ?? DEFAULT_RATE_LIMIT;
  }

  static async check(
    key: string,
    limiterName: string = "default",
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const config = this.getConfig(limiterName);
    const now = Date.now();
    const entry = STORE.get(key);

    if (!entry || now > entry.resetAt) {
      STORE.set(key, { count: 1, resetAt: now + config.windowMs });
      return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
    }

    if (entry.count >= config.maxRequests) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count += 1;
    return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
  }

  static clear(): void {
    STORE.clear();
  }

  static cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of STORE) {
      if (now > entry.resetAt) {
        STORE.delete(key);
      }
    }
  }
}

// Periodic cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => RateLimiter.cleanup(), 300_000);
}
