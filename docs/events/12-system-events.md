# 12 - System Events

## Overview

System events are published by the Auth Service and System modules for authentication, authorization, and configuration changes. These events are typically synchronous (audit-logged immediately) and trigger cache invalidations.

---

## Event: system.login

Published when a user successfully logs in.

### Payload

```typescript
interface LoginPayload {
  userId: string;
  email: string;
  role: string;
  ip: string;
  userAgent: string;
  loginMethod: "credentials" | "social" | "token";
  loginAt: string;
}
```

### Subscribers

| Subscriber       | Action                   | Type  |
| ---------------- | ------------------------ | ----- |
| AuditHandler     | Record login audit entry | sync  |
| AnalyticsHandler | Track login event        | async |

### Validation

- `userId` must be a valid ObjectId
- `ip` must be a valid IP address

### Retry Strategy

Max 2 retries (sync handler fails with publisher). Async: max 3 retries.

---

## Event: system.logout

Published when a user logs out.

### Payload

```typescript
interface LogoutPayload {
  userId: string;
  email: string;
  role: string;
  logoutAt: string;
  sessionDuration: number;
}
```

### Subscribers

| Subscriber       | Action                    | Type  |
| ---------------- | ------------------------- | ----- |
| AuditHandler     | Record logout audit entry | sync  |
| AnalyticsHandler | Track logout event        | async |

---

## Event: system.role_changed

Published when a user's role is modified.

### Payload

```typescript
interface RoleChangedPayload {
  userId: string;
  email: string;
  oldRole: string;
  newRole: string;
  changedBy: string;
  changedAt: string;
  reason?: string;
}
```

### Subscribers

| Subscriber                | Action                       | Queue     |
| ------------------------- | ---------------------------- | --------- |
| AuthorizationCacheHandler | Clear user permissions cache | auth      |
| AnalyticsHandler          | Track role change            | analytics |

---

## Event: system.permission_changed

Published when role permissions are modified (add/remove permissions from a role).

### Payload

```typescript
interface PermissionChangedPayload {
  roleId: string;
  roleName: string;
  changes: {
    type: "added" | "removed";
    permissions: string[];
  };
  changedBy: string;
  changedAt: string;
}
```

### Subscribers

| Subscriber                | Action                       | Queue     |
| ------------------------- | ---------------------------- | --------- |
| AuthorizationCacheHandler | Clear role permissions cache | auth      |
| AnalyticsHandler          | Track permission change      | analytics |

---

## System-Specific Events (Future)

| Event                        | Description                    |
| ---------------------------- | ------------------------------ |
| `system.config_updated`      | Platform configuration changed |
| `system.maintenance_mode`    | Maintenance mode toggled       |
| `system.report_generated`    | Scheduled report completed     |
| `system.backup_completed`    | Database backup completed      |
| `system.data_exported`       | Data export completed          |
| `system.health_check_failed` | System health check alert      |
