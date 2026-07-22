import { logger } from "@/shared/utils/logger";
import { env } from "@/shared/config/env";

const CACHE_TTL = {
  EXECUTIVE: 300,
  ORDER: 300,
  PRODUCT: 300,
  CUSTOMER: 300,
  RESELLER: 300,
  WHOLESALE: 300,
  FINANCE: 300,
  LOGISTICS: 300,
  INVENTORY: 300,
  PAYMENT: 300,
  LIVE: 15,
  REPORT: 600,
  SEARCH: 60,
} as const;

type CacheKey =
  | "executive"
  | "order"
  | "product"
  | "customer"
  | "reseller"
  | "wholesale"
  | "finance"
  | "logistics"
  | "inventory"
  | "payment"
  | "live"
  | "report"
  | "search";

let redisClient: any = null;

async function getRedis(): Promise<any> {
  if (redisClient) return redisClient;
  try {
    const { default: Redis } = await import("ioredis");
    redisClient = new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD || undefined,
      lazyConnect: true,
      maxRetriesPerRequest: null,
    });
    await redisClient.connect();
    logger.info("AnalyticsCacheService: Redis connected");
  } catch (err) {
    logger.warn("AnalyticsCacheService: Redis unavailable, caching disabled", { err });
    redisClient = null;
  }
  return redisClient;
}

function buildKey(type: CacheKey, suffix?: string): string {
  return `analytics:${type}${suffix ? `:${suffix}` : ""}`;
}

export class AnalyticsCacheService {
  private static instance: AnalyticsCacheService;
  private cache: Map<string, { data: unknown; expiresAt: number }> = new Map();

  static getInstance(): AnalyticsCacheService {
    if (!AnalyticsCacheService.instance) {
      AnalyticsCacheService.instance = new AnalyticsCacheService();
    }
    return AnalyticsCacheService.instance;
  }

  async get<T>(key: CacheKey, suffix?: string): Promise<T | null> {
    const cacheKey = buildKey(key, suffix);
    const inMemory = this.cache.get(cacheKey);
    if (inMemory && Date.now() < inMemory.expiresAt) {
      return inMemory.data as T;
    }
    if (inMemory) this.cache.delete(cacheKey);

    try {
      const redis = await getRedis();
      if (redis) {
        const raw = await redis.get(cacheKey);
        if (raw) {
          const parsed = JSON.parse(raw) as T;
          const ttl = await redis.ttl(cacheKey);
          if (ttl > 0) {
            this.cache.set(cacheKey, {
              data: parsed,
              expiresAt: Date.now() + ttl * 1000,
            });
          }
          return parsed;
        }
      }
    } catch {
      return null;
    }
    return null;
  }

  async set<T>(
    key: CacheKey,
    data: T,
    suffix?: string,
    ttl?: number,
  ): Promise<void> {
    const cacheKey = buildKey(key, suffix);
    const expiresIn = (ttl ?? CACHE_TTL[key.toUpperCase() as keyof typeof CACHE_TTL] ?? 300) * 1000;
    this.cache.set(cacheKey, { data, expiresAt: Date.now() + expiresIn });

    try {
      const redis = await getRedis();
      if (redis) {
        await redis.setex(cacheKey, expiresIn / 1000, JSON.stringify(data));
      }
    } catch {
      // cache write failure is non-critical
    }
  }

  async invalidate(key: CacheKey, suffix?: string): Promise<void> {
    const cacheKey = buildKey(key, suffix);
    this.cache.delete(cacheKey);
    try {
      const redis = await getRedis();
      if (redis) {
        await redis.del(cacheKey);
      }
    } catch {
      // cache invalidation failure is non-critical
    }
  }

  async invalidateAll(types?: CacheKey[]): Promise<void> {
    const keys = types ?? Object.keys(CACHE_TTL) as CacheKey[];
    const cacheKeys = keys.map((k) => buildKey(k));
    for (const key of cacheKeys) {
      this.cache.delete(key);
    }
    try {
      const redis = await getRedis();
      if (redis && cacheKeys.length > 0) {
        await redis.del(...cacheKeys);
        const pattern = "analytics:*";
        const stream = redis.scanStream({ match: pattern, count: 100 });
        const pipeline = redis.pipeline();
        stream.on("data", (resultKeys: string[]) => {
          for (const key of resultKeys) {
            pipeline.del(key);
          }
        });
        await new Promise((resolve) => stream.on("end", resolve));
        await pipeline.exec();
      }
    } catch {
      // batch invalidation failure is non-critical
    }
  }
}

export default AnalyticsCacheService;
