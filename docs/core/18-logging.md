# 18 - Logging Foundation

## Overview

The logging foundation provides structured logging across the entire platform. The `Logger` class in `src/shared/utils/logger.ts` is the single entry point for all logging.

---

## Log Levels

| Level   | Priority | Color  | Usage                             |
| ------- | -------- | ------ | --------------------------------- |
| `debug` | 0        | Purple | Development diagnostics           |
| `info`  | 1        | Green  | Normal operation events           |
| `warn`  | 2        | Yellow | Unexpected but handled conditions |
| `error` | 3        | Red    | Failures requiring investigation  |

---

## Log Format

```
[2026-07-19T14:30:00.000Z] [INFO] PricingService: pricing created | Meta: { "id": "...", "productId": "..." }
```

---

## Logger API

```typescript
logger.debug(message, meta?)
logger.info(message, meta?)
logger.warn(message, meta?)
logger.error(message, error?, meta?)
```

---

## Log Categories

### Application Logs

- Service operations (CRUD, business logic)
- Repository operations (database queries)
- Action execution (server action start/completion)

### Business Logs

- Audit events (entity creation, update, deletion)
- Status changes
- Financial transactions
- Permission changes

### Error Logs

- Exceptions with stack traces
- Database errors
- External API failures
- Queue processing failures

---

## Configuration

Log level is configured via `LOG_LEVEL` environment variable:

```env
LOG_LEVEL=debug    # Show all logs
LOG_LEVEL=info     # Default
LOG_LEVEL=warn     # Only warnings and errors
LOG_LEVEL=error    # Only errors
```

---

## Health Check

The health check system in `src/shared/core/health.ts` provides:

| Check       | Description                 |
| ----------- | --------------------------- |
| Application | Server uptime, memory usage |
| Database    | MongoDB connection status   |
| Redis       | Redis connectivity (ping)   |
| Queue       | BullMQ queue status         |
| Storage     | ImageKit/CDN connectivity   |

### Registering Checks

```typescript
import {
  healthService,
  createDatabaseHealthChecker,
  createRedisHealthChecker,
} from "@/shared/core";

healthService.register("database", createDatabaseHealthChecker());
healthService.register("redis", createRedisHealthChecker());

// Run all checks
const result = await healthService.checkAll();
// Returns: { status: "healthy", checks: [...], timestamp: "...", uptime: 3600 }
```
