# 10 - Wholesaler Events

## Overview

Wholesaler events are published by the Wholesaler Service when wholesaler accounts are registered, approved, or interact with wholesale pricing.

---

## Event: wholesaler.registered

Published when a new wholesaler registers or is onboarded.

### Payload

```typescript
interface WholesalerRegisteredPayload {
  wholesalerId: string;
  code: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessType: string;
  registrationMethod: "self" | "invitation";
  status: string;
  registeredAt: string;
}
```

### Subscribers

| Subscriber       | Action                       | Queue     |
| ---------------- | ---------------------------- | --------- |
| AnalyticsHandler | Track wholesaler acquisition | analytics |
| DashboardHandler | Refresh dashboard            | dashboard |
| AuditHandler     | Record audit entry           | audit     |

### Validation

- `email` must be unique
- `businessType` must be valid (partnership / limited_company / sole_proprietorship)

### Retry Strategy

Max 3 retries, exponential backoff. DLQ on exhaustion.

---

## Event: wholesaler.approved

Published when a pending wholesaler is approved.

### Payload

```typescript
interface WholesalerApprovedPayload {
  wholesalerId: string;
  code: string;
  businessName: string;
  approvedBy: string;
  approvedAt: string;
  autoApproved: boolean;
  assignedTier?: string;
}
```

### Subscribers

| Subscriber          | Action                     | Queue         |
| ------------------- | -------------------------- | ------------- |
| NotificationHandler | Send approval notification | notifications |
| AnalyticsHandler    | Track approval             | analytics     |

---

## Event: wholesaler.pricing_viewed

Published when a wholesaler views wholesale pricing tiers.

### Payload

```typescript
interface WholesalePricingViewedPayload {
  wholesalerId: string;
  productId: string;
  variantSku?: string;
  viewedTiers: number;
  viewedAt: string;
}
```

### Subscribers

| Subscriber       | Action                 | Queue     |
| ---------------- | ---------------------- | --------- |
| AnalyticsHandler | Track pricing interest | analytics |
