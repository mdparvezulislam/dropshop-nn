# 08 - Customer Events

## Overview

Customer events are published by the Customer Service when customer accounts are created, verified, or updated.

---

## Event: customer.registered

Published when a new customer registers on the platform.

### Payload

```typescript
interface CustomerRegisteredPayload {
  customerId: string;
  email: string;
  name: string;
  phone?: string;
  registrationMethod: "self" | "social" | "admin";
  referralSource?: string;
  registeredAt: string;
}
```

### Subscribers

| Subscriber       | Action                     | Queue     |
| ---------------- | -------------------------- | --------- |
| AnalyticsHandler | Track customer acquisition | analytics |
| DashboardHandler | Refresh customer widget    | dashboard |
| AuditHandler     | Record audit entry         | audit     |

### Validation

- `email` must be valid email format
- `name` must be non-empty

### Retry Strategy

Max 3 retries, exponential backoff. DLQ on exhaustion.

---

## Event: customer.verified

Published when a customer's email or identity is verified.

### Payload

```typescript
interface CustomerVerifiedPayload {
  customerId: string;
  email: string;
  verificationType: "email" | "phone" | "identity";
  verifiedAt: string;
}
```

### Subscribers

| Subscriber          | Action                    | Queue         |
| ------------------- | ------------------------- | ------------- |
| NotificationHandler | Send welcome notification | notifications |
| AnalyticsHandler    | Track verification        | analytics     |

---

## Event: customer.profile_updated

Published when a customer updates their profile information.

### Payload

```typescript
interface CustomerProfileUpdatedPayload {
  customerId: string;
  changes: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
  updatedAt: string;
}
```

### Subscribers

| Subscriber       | Action               | Queue     |
| ---------------- | -------------------- | --------- |
| AnalyticsHandler | Track profile update | analytics |
