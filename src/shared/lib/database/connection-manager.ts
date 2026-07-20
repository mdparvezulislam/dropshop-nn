import mongoose from "mongoose";
import { env } from "@/shared/config/env";
import { logger } from "@/shared/utils/logger";

interface ConnectionCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: ConnectionCache = (global as any).mongooseConnection;

if (!cached) {
  cached = (global as any).mongooseConnection = { conn: null, promise: null };
}

export class DatabaseConnectionManager {
  private static maxRetries = 5;
  private static retryIntervalMs = 2000;

  static async connect(retries = DatabaseConnectionManager.maxRetries): Promise<typeof mongoose> {
    if (cached.conn) {
      logger.debug("Database connection already established (cached)");
      return cached.conn;
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        maxPoolSize: 10,
        minPoolSize: 2,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
      };

      logger.info(`Connecting to MongoDB... (Retries left: ${retries})`);
      cached.promise = mongoose
        .connect(env.MONGO_URI, opts)
        .then((mongooseInstance) => {
          logger.info("Database connected successfully");
          return mongooseInstance;
        })
        .catch(async (err) => {
          logger.error("Database connection failed", err);
          cached.promise = null;

          if (retries > 1) {
            logger.info(
              `Waiting ${DatabaseConnectionManager.retryIntervalMs / 1000}s before retrying...`,
            );
            await new Promise((resolve) =>
              setTimeout(resolve, DatabaseConnectionManager.retryIntervalMs),
            );
            return DatabaseConnectionManager.connect(retries - 1);
          }

          throw new Error("Unable to establish database connection after max retries");
        });
    }

    try {
      cached.conn = await cached.promise;

      // Bootstrap platform engines on connection
      if (typeof window === "undefined") {
        try {
          const { ensurePlatformInitialized } = await import("@/shared/platform/bootstrap-server");
          await ensurePlatformInitialized();
        } catch (err) {
          logger.warn("DatabaseConnectionManager: platform bootstrap failed", { error: err });
        }
      }
    } catch (e) {
      cached.promise = null;
      throw e;
    }

    return cached.conn;
  }

  static async disconnect(): Promise<void> {
    if (mongoose.connection.readyState === 0) {
      return;
    }
    logger.info("Closing database connection pool...");
    await mongoose.connection.close();
    cached.conn = null;
    cached.promise = null;
    logger.info("Database connection closed successfully");
  }

  static getHealthStatus() {
    const states = ["disconnected", "connected", "connecting", "disconnecting"];
    const stateIndex = mongoose.connection.readyState;

    return {
      status: stateIndex === 1 ? "healthy" : "unhealthy",
      connectionState: states[stateIndex] || "unknown",
      readyState: stateIndex,
      host: mongoose.connection.host,
      dbName: mongoose.connection.name,
      poolSize: mongoose.connection.getClient()?.options?.maxPoolSize || 10,
    };
  }
}

if (
  typeof process !== "undefined" &&
  process.env.NEXT_RUNTIME !== "edge" &&
  !(global as any).databaseShutdownRegistered
) {
  const shutdown = async (signal: string) => {
    logger.warn(`Received ${signal}. Starting graceful database shutdown...`);
    try {
      await DatabaseConnectionManager.disconnect();
      logger.info("Graceful shutdown completed");
      (process as any)["exit"](0);
    } catch (err) {
      logger.error("Error during graceful database disconnect", err);
      (process as any)["exit"](1);
    }
  };

  (process as any)["on"]("SIGINT", () => shutdown("SIGINT"));
  (process as any)["on"]("SIGTERM", () => shutdown("SIGTERM"));
  (global as any).databaseShutdownRegistered = true;
}
