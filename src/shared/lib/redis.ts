import Redis, { RedisOptions } from "ioredis";
import { env } from "@/shared/config/env";
import { logger } from "@/shared/utils/logger";

interface RedisCache {
  client: Redis | null;
}

let cached: RedisCache = (global as any).redis;

if (!cached) {
  cached = (global as any).redis = { client: null };
}

export function getRedisClient(): Redis {
  if (cached.client) {
    logger.debug("Using cached Redis client connection");
    return cached.client;
  }

  const options: RedisOptions = {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    // maxRetriesPerRequest needs to be null for BullMQ compatibility when using the same connection options
    maxRetriesPerRequest: null,
    lazyConnect: true,
  };

  logger.info("Initializing new Redis client connection...");
  const client = new Redis(options);

  client.on("connect", () => {
    logger.info("Redis client connected successfully");
  });

  client.on("error", (err) => {
    logger.error("Redis client connection error", err);
  });

  cached.client = client;
  return client;
}

export default getRedisClient;
