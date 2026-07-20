# 11 - Payment Events

## Overview

Payment events are published by the Payment Service when payments are initiated, completed, fail, or refunds are created.

---

## Event: payment.initiated

Published when a payment process is started.

### Payload

```typescript
interface PaymentInitiatedPayload {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: "bkash" | "nagad" | "cod" | "bank_transfer" | "card";
  initiatedAt: string;
  initiatedBy: string;
}
```

### Subscribers

| Subscriber       | Action                   | Queue     |
| ---------------- | ------------------------ | --------- |
| AnalyticsHandler | Track payment initiation | analytics |

### Validation

- `amount` must be > 0 in integer cents
- `paymentMethod` must be a supported gateway

### Retry Strategy

Max 3 retries, exponential backoff.

---

## Event: payment.completed

Published when a payment is successfully processed.

### Payload

```typescript
interface PaymentCompletedPayload {
  paymentId: string;
  orderId: string;
  transactionId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  gatewayResponse: object;
  completedAt: string;
}
```

### Subscribers

| Subscriber          | Action                    | Queue         |
| ------------------- | ------------------------- | ------------- |
| OrderUpdateHandler  | Mark order as paid        | orders        |
| NotificationHandler | Send payment confirmation | notifications |
| AnalyticsHandler    | Track completed payment   | analytics     |
| ReportingHandler    | Queue financial report    | reporting     |

---

## Event: payment.failed

Published when a payment attempt fails.

### Payload

```typescript
interface PaymentFailedPayload {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  failureReason: string;
  failureCode?: string;
  failedAt: string;
  retryAttempt: number;
}
```

### Subscribers

| Subscriber          | Action                            | Queue         |
| ------------------- | --------------------------------- | ------------- |
| NotificationHandler | Send payment failure notification | notifications |
| AnalyticsHandler    | Track failed payment              | analytics     |

---

## Event: payment.refund_created

Published when a refund is initiated against a completed payment.

### Payload

```typescript
interface RefundCreatedPayload {
  refundId: string;
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  reason: string;
  initiatedBy: string;
  createdAt: string;
}
```

### Subscribers

| Subscriber         | Action                     | Queue     |
| ------------------ | -------------------------- | --------- |
| OrderUpdateHandler | Update order refund status | orders    |
| AnalyticsHandler   | Track refund               | analytics |
| ReportingHandler   | Queue financial report     | reporting |
