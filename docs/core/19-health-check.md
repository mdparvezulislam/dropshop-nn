# 19 - Health Check

## Overview

The health check system provides a centralized way to monitor platform health. It aggregates checks from all infrastructure dependencies into a single status report.

---

## Health Check Result

```typescript
interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy"
  checks: HealthCheck[]
  timestamp: string
  uptime: number  // seconds
}

interface HealthCheck {
  name: string
  status: "healthy" | "degraded" | "unhealthy"
  message?: string
  latencyMs?: number
  details?: Record<string, unknown>
}
```

---

## Registered Checks

| Check | Type | Dependencies |
|-------|------|-------------|
| Application | Core | None — checks uptime |
| Database | Infrastructure | MongoDB |
| Redis | Infrastructure | Redis server |
| Queue | Infrastructure | BullMQ + Redis |
| Storage | Infrastructure | ImageKit |

---

## Health Check API

```typescript
import { healthService } from "@/shared/core"

// Register checks on app startup
healthService.register("database", createDatabaseHealthChecker())
healthService.register("redis", createRedisHealthChecker())

// Check all dependencies
const status = await healthService.checkAll()

// Get uptime only
const uptime = healthService.getUptime()  // seconds
```

---

## Response Format

```json
{
  "status": "healthy",
  "checks": [
    { "name": "application", "status": "healthy", "latencyMs": 0 },
    { "name": "database", "status": "healthy", "latencyMs": 5, "message": "MongoDB connected" },
    { "name": "redis", "status": "healthy", "latencyMs": 2, "message": "Redis connected" }
  ],
  "timestamp": "2026-07-19T14:30:00.000Z",
  "uptime": 86400
}
```

---

## Health Check Route

A `/api/health` route returns the aggregated health status. Internal services use this for monitoring and alerting.

---

## Status Interpretation

| Overall Status | Meaning |
|---------------|---------|
| `healthy` | All checks pass |
| `degraded` | Non-critical checks fail (e.g., caching layer) |
| `unhealthy` | Critical checks fail (e.g., database unreachable) |
