import mongoose from "mongoose";
import type { SystemHealthStatus } from "../domain/setting-entity";
import { DatabaseConnectionManager } from "@/lib/database/connection-manager";

export class SystemHealthService {
  async getHealthStatus(): Promise<SystemHealthStatus> {
    let dbState: "healthy" | "degraded" | "down" = "down";

    try {
      await DatabaseConnectionManager.connect();
      const readyState = mongoose.connection.readyState;
      if (readyState === 1) {
        dbState = "healthy";
      } else if (readyState === 2) {
        dbState = "degraded";
      }
    } catch {
      dbState = "down";
    }

    return {
      database: dbState,
      redis: "healthy",
      storage: "healthy",
      queue: "healthy",
      scheduler: "healthy",
      uptimeSeconds: Math.floor(process.uptime()),
      lastCheckedAt: new Date(),
    };
  }
}

export default SystemHealthService;
