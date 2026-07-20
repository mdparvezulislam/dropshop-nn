export interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  checks: HealthCheck[];
  timestamp: string;
  uptime: number;
}

export interface HealthCheck {
  name: string;
  status: "healthy" | "degraded" | "unhealthy";
  message?: string;
  latencyMs?: number;
  details?: Record<string, unknown>;
}

export type HealthChecker = () => Promise<HealthCheck>;

export class HealthService {
  private checkers: Map<string, HealthChecker> = new Map();
  private startTime = Date.now();

  register(name: string, checker: HealthChecker): void {
    this.checkers.set(name, checker);
  }

  async checkAll(): Promise<HealthCheckResult> {
    const checks: HealthCheck[] = [];

    for (const [name, checker] of this.checkers) {
      try {
        const result = await checker();
        checks.push(result);
      } catch (error) {
        checks.push({
          name,
          status: "unhealthy",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const failed = checks.filter((c) => c.status === "unhealthy");
    const degraded = checks.filter((c) => c.status === "degraded");

    const overall: HealthCheckResult["status"] =
      failed.length > 0 ? "unhealthy" : degraded.length > 0 ? "degraded" : "healthy";

    return {
      status: overall,
      checks,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  getUptime(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }
}

export const healthService = new HealthService();

export function createDatabaseHealthChecker(): HealthChecker {
  return async () => {
    const start = Date.now();
    try {
      const { DatabaseConnectionManager } = await import("@/shared/lib/database/connection-manager");
      const healthStatus = DatabaseConnectionManager.getHealthStatus();
      const connectionState = typeof healthStatus === "string" ? healthStatus : healthStatus.status;
      return {
        name: "database",
        status: connectionState === "connected" ? "healthy" : "degraded",
        message: `MongoDB status: ${connectionState}`,
        latencyMs: Date.now() - start,
        details: { connectionState },
      };
    } catch (error) {
      return {
        name: "database",
        status: "unhealthy",
        message: error instanceof Error ? error.message : "Database check failed",
        latencyMs: Date.now() - start,
      };
    }
  };
}

export function createRedisHealthChecker(): HealthChecker {
  return async () => {
    const start = Date.now();
    try {
      const { default: getRedisClient } = await import("@/shared/lib/redis");
      const redis = getRedisClient();
      await redis.ping();
      return {
        name: "redis",
        status: "healthy",
        message: "Redis connected",
        latencyMs: Date.now() - start,
      };
    } catch (error) {
      return {
        name: "redis",
        status: "unhealthy",
        message: error instanceof Error ? error.message : "Redis check failed",
        latencyMs: Date.now() - start,
      };
    }
  };
}
