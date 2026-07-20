# 11 - Notification Engine Architecture

## Overview

The Notification Engine is a centralized system that dispatches notifications across multiple channels based on business events. Every notification is defined as a template, configured per channel, and triggered by events from the Event Bus.

---

## Channel Support

| Channel           | Status       | Priority |
| ----------------- | ------------ | -------- |
| In-App            | ✅ Implement | High     |
| Email             | ✅ Implement | High     |
| SMS               | ⏳ Planned   | Medium   |
| WhatsApp          | 🔮 Future    | Low      |
| Push Notification | 🔮 Future    | Low      |

---

## Notification Types

### Transactional Notifications

| Type               | Channels           | Trigger               |
| ------------------ | ------------------ | --------------------- |
| Order Confirmation | In-App, Email, SMS | Order Created         |
| Order Shipped      | In-App, Email, SMS | Status → Shipped      |
| Order Delivered    | In-App, Email      | Status → Delivered    |
| Payment Received   | In-App, Email      | Payment Completed     |
| Payment Failed     | In-App, Email, SMS | Payment Failed        |
| Stock Alert        | In-App, Email      | Low/Out of Stock      |
| Price Change       | In-App, Email      | Pricing Updated       |
| Account Verified   | In-App, Email      | Verification Complete |

### Promotional Notifications

| Type            | Channels           | Trigger          |
| --------------- | ------------------ | ---------------- |
| Campaign Launch | In-App, Email, SMS | Campaign Active  |
| Flash Sale      | In-App, SMS        | Flash Sale Start |
| Price Drop      | In-App, Email      | Price Decrease   |
| Back in Stock   | In-App, Email      | Stock Available  |

### System Notifications

| Type                 | Channels      | Recipients        |
| -------------------- | ------------- | ----------------- |
| Reseller Application | In-App, Email | Admin             |
| Supplier Application | In-App, Email | Admin             |
| Report Ready         | In-App, Email | Requestor         |
| Payout Processed     | In-App, Email | Supplier/Reseller |
| Account Warning      | In-App, Email | User              |

---

## Notification Architecture

```
Business Event Published (Event Bus)
    │
    ▼
NotificationEngine.handle(event)
    │
    ├── Determine Recipients
    │   ├── Direct user
    │   ├── Role-based (all admins)
    │   └── Custom (order customer)
    │
    ├── Select Notification Template
    │   └── TemplateEngine.render(template, eventData)
    │
    ├── Resolve Channels
    │   ├── Check user preferences
    │   ├── Check channel availability
    │   └── Apply rate limits
    │
    └── Dispatch
        ├── In-App → NotificationRepository.create()
        ├── Email → EmailQueue (BullMQ)
        ├── SMS → SMSQueue (BullMQ)
        └── Push → PushQueue (BullMQ)
```

---

## Template Engine

Notifications use Handlebars-style templates that render with event data:

```typescript
Template {
  id: string
  name: string
  type: NotificationType
  channels: {
    inApp: { title: string, body: string, actionUrl?: string }
    email: { subject: string, htmlBody: string, textBody: string }
    sms: { body: string }
  }
  variables: string[]   // Expected variables from event data
}
```

---

## User Notification Preferences

```typescript
UserNotificationPreferences {
  userId: string
  channels: {
    email: { enabled: boolean, address: string }
    sms: { enabled: boolean, number: string }
    push: { enabled: boolean }
    whatsapp: { enabled: boolean, number: string }
  }
  types: {
    order_confirmation: { email: true, sms: true }
    promotional: { email: true, sms: false }
    // ... per-type channel overrides
  }
  quietHours?: {
    start: string  // "22:00"
    end: string    // "08:00"
    timezone: string
  }
}
```

---

## Rate Limiting & Batching

| Channel | Rate Limit        | Batching              |
| ------- | ----------------- | --------------------- |
| In-App  | Unlimited         | No                    |
| Email   | 100/hour per user | Digest (daily/weekly) |
| SMS     | 5/hour per user   | No                    |
| Push    | 50/hour per user  | No                    |

---

## Notification Repository

```typescript
class NotificationRepository extends BaseRepository {
  create(notification: Notification): Promise<Notification>;
  findUnreadByUser(userId: string): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  getPreferences(userId: string): Promise<UserNotificationPreferences>;
  updatePreferences(userId: string, prefs: UserNotificationPreferences): Promise<void>;
}
```

---

## Automation & Event Flow

```
Business Action
    │
    ▼
Event Bus Publish
    │
    ▼
NotificationEngine.handle(event)
    │
    ├── Notification Created (audit log)
    ├── In-App notification stored
    ├── Email/SMS queued (BullMQ)
    └── Analytics Event: "notification.sent"
```
