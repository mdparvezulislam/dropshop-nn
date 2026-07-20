# 10 - Notification Contracts

## Overview

Notification contracts define how every engine triggers notifications through the centralized Notification Engine.

---

## Notification Structure

```typescript
interface NotificationPayload {
  type: string                  // "order.confirmation", "low.stock.alert"
  recipients: string[]          // User IDs
  channels: NotificationChannel[] // ["in_app", "email", "sms"]
  priority: NotificationPriority // "low" | "medium" | "high" | "urgent"
  template: string              // Template key for rendering
  data: Record<string, unknown>  // Template variables
  actor?: ActorInfo
  correlationId?: string
}
```

---

## Supported Channels

| Channel | Status | Engine |
|---------|--------|--------|
| In-App | ✅ Ready | Notification Engine |
| Email | ✅ Ready | Notification Engine |
| SMS | ⏳ Planned | Third-party provider |
| Push | 🔮 Future | Firebase/APNS |
| WhatsApp | 🔮 Future | Twilio/Solution |

---

## Notification Publisher Contract

```typescript
interface NotificationPublisherContract {
  send(
    type: string,
    recipients: string[],
    data: Record<string, unknown>,
    channels?: string[],
  ): Promise<void>
}
```

---

## Standard Notification Types

| Type | Trigger | Default Channels |
|------|---------|-----------------|
| `order.confirmation` | Order placed | In-App, Email |
| `order.shipped` | Order dispatched | In-App, Email |
| `order.delivered` | Order completed | In-App |
| `payment.received` | Payment completed | In-App, Email |
| `payment.failed` | Payment failed | In-App, Email |
| `low.stock.alert` | Stock below threshold | In-App, Email |
| `out.of.stock` | Stock at zero | In-App |
| `supplier.approved` | Supplier approved | In-App, Email |
| `reseller.approved` | Reseller approved | In-App, Email |
| `price.change` | Pricing updated | In-App |
| `campaign.start` | Campaign launched | In-App, Email |
| `account.verified` | Account verified | In-App, Email |

---

## User Preferences

Users can configure per-channel notification preferences stored in `UserNotificationPreferences`. The Notification Engine respects these preferences before dispatching.
