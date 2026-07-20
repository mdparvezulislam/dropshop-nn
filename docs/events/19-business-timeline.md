# 19 - Business Timeline

## Overview

Every business entity (product, supplier, inventory, order, customer, reseller, wholesaler) has an activity timeline generated from events. The timeline provides a chronological, human-readable history of everything that happened to an entity.

---

## Timeline Architecture

```
Event Published
    │
    ├── [Sync] Timeline Subscriber
    │       │
    │       ├── Extract entity type & ID from event
    │       ├── Transform event → TimelineEntry
    │       └── Store in timeline collection
    │
    ▼
TimelineEntry {
  entityType: string      // "product", "order", "reseller", etc.
  entityId: string        // The entity's ID
  eventType: string       // Original event type
  action: string          // Human-readable action text
  actor: { id, name, role }
  changes: { field, oldValue, newValue }[]
  timestamp: Date
  correlationId: string
}
```

---

## Timeline Entry Structure

```typescript
interface TimelineEntry {
  id: string;
  entityType: string;
  entityId: string;
  eventType: string;
  action: string; // Human-readable
  summary: string; // One-line description
  actor?: {
    id: string;
    name: string;
    role: string;
  };
  changes?: {
    field: string;
    oldValue?: unknown;
    newValue?: unknown;
  }[];
  metadata?: Record<string, unknown>;
  correlationId?: string;
  timestamp: Date;
}
```

---

## Event to Timeline Mapping

| Event Type                   | Action Text         | Summary Template                         |
| ---------------------------- | ------------------- | ---------------------------------------- |
| product.created              | Created             | "Product created in draft status"        |
| product.updated              | Updated             | "Name, description changed"              |
| product.published            | Published           | "Product published by {actor.name}"      |
| product.archived             | Archived            | "Product archived — reason: {reason}"    |
| product.deleted              | Deleted             | "Product soft-deleted by {actor.name}"   |
| price.created                | Pricing Created     | "Default pricing initialized"            |
| price.updated                | Pricing Updated     | "Selling price updated: ৳1,000 → ৳1,200" |
| price.campaign_started       | Campaign Started    | "Flash sale started — 20% off"           |
| inventory.adjusted           | Stock Adjusted      | "Stock adjusted: +50 units"              |
| stock.reserved               | Stock Reserved      | "Stock reserved for Order #1234"         |
| inventory.low_stock_detected | Low Stock Alert     | "Low stock: 5 remaining (threshold: 10)" |
| order.created                | Order Created       | "Order placed — ৳3,450"                  |
| order.shipped                | Order Shipped       | "Shipped via SteadFast — TRK123456"      |
| order.delivered              | Order Delivered     | "Order delivered"                        |
| order.cancelled              | Order Cancelled     | "Cancelled: out of stock"                |
| customer.registered          | Customer Registered | "New customer registered"                |
| customer.verified            | Email Verified      | "Email verified"                         |
| reseller.registered          | Reseller Registered | "Reseller {businessName} registered"     |
| reseller.approved            | Reseller Approved   | "Reseller account approved"              |
| supplier.created             | Supplier Created    | "New supplier: {businessName}"           |
| supplier.approved            | Supplier Approved   | "Supplier approved"                      |
| system.login                 | Login               | "User logged in from {ip}"               |

---

## Storage

### MongoDB Collection: `business_timelines`

```typescript
BusinessTimelineEntry {
  entityType: string        // Indexed
  entityId: string          // Indexed
  eventType: string
  action: string
  summary: string
  actor: {
    id: string
    name: string
    role: string
  }
  changes: [{
    field: string
    oldValue: Schema.Types.Mixed
    newValue: Schema.Types.Mixed
  }]
  metadata: Schema.Types.Mixed
  correlationId: string
  timestamp: Date
  createdAt: Date
}
```

### Indexes

```
{ entityType: 1, entityId: 1, timestamp: -1 }  // Entity timeline queries
{ actor.id: 1, timestamp: -1 }                   // User activity queries
{ eventType: 1, timestamp: -1 }                  // Event type queries
{ createdAt: 1 }                                  // TTL index (90 days)
```

### Retention

- Active: 90 days in primary collection
- Archive: Moved to `business_timelines_archive` after 90 days
- Permanent: Critical events (status changes, payments) never deleted

---

## Timeline Service

```typescript
class BusinessTimelineService {
  async record(event: BusinessEvent): Promise<void>;
  async getEntityTimeline(
    entityType: string,
    entityId: string,
    options?: TimelineQueryOptions,
  ): Promise<TimelineEntry[]>;
  async getUserActivity(userId: string, options?: TimelineQueryOptions): Promise<TimelineEntry[]>;
  async getEntityTimelineByEventType(
    entityType: string,
    entityId: string,
    eventTypes: string[],
  ): Promise<TimelineEntry[]>;
  async archiveBefore(date: Date): Promise<number>;
}
```

---

## Timeline UI

### Entity Timeline Widget

```
┌──────────────────────────────────────────────────┐
│ Activity History — Product: Wireless Headphones   │
├──────────────────────────────────────────────────┤
│ 🔵 Jul 19, 2026 14:30 — Admin                    │
│    Stock adjusted: +50 units                      │
│    Reason: Supplier restock                       │
├──────────────────────────────────────────────────┤
│ 🔵 Jul 18, 2026 10:15 — Manager                  │
│    Selling price updated: ৳1,000 → ৳1,200        │
├──────────────────────────────────────────────────┤
│ 🔵 Jul 15, 2026 09:00 — Admin                    │
│    Product published                             │
├──────────────────────────────────────────────────┤
│ 🔵 Jul 10, 2026 16:45 — Manager                  │
│    Name, description changed                      │
├──────────────────────────────────────────────────┤
│ 🔵 Jul 01, 2026 11:30 — System                   │
│    Product created in draft status                │
└──────────────────────────────────────────────────┘
```

### Timeline Features

- **Filter by event type**: Show only pricing changes, inventory changes, etc.
- **Filter by date range**: Custom date range selection
- **Filter by actor**: Show only actions by specific user
- **Expand details**: Click to show full change details
- **Export**: Download timeline as CSV
- **Search**: Full-text search across timeline entries

---

## Timeline Subscriber

```typescript
class TimelineSubscriber implements SyncEventSubscriber {
  private readonly timelineService = new BusinessTimelineService();

  get eventType(): string {
    return "*"; // Subscribe to all events
  }

  get priority(): number {
    return 2; // After audit
  }

  async handle(event: BusinessEvent): Promise<void> {
    const entityInfo = this.extractEntityInfo(event);
    if (!entityInfo) return; // Not a business entity event

    await this.timelineService.record({
      entityType: entityInfo.entityType,
      entityId: entityInfo.entityId,
      eventType: event.eventType,
      action: this.getActionText(event),
      summary: this.getSummary(event),
      actor: event.actor,
      changes: this.extractChanges(event),
      metadata: event.metadata,
      correlationId: event.correlationId,
      timestamp: new Date(event.timestamp),
    });
  }

  private extractEntityInfo(event: BusinessEvent): { entityType: string; entityId: string } | null {
    const data = event.data as Record<string, unknown>;
    const domain = event.eventType.split(".")[0];

    const entityMap: Record<string, string> = {
      product: "Product",
      supplier: "Supplier",
      price: "ProductPricing",
      inventory: "ProductInventory",
      order: "Order",
      customer: "Customer",
      reseller: "Reseller",
      wholesaler: "Wholesaler",
      payment: "Payment",
    };

    const entityType = entityMap[domain];
    if (!entityType) return null;

    const entityId = data[`${domain}Id`] as string;
    if (!entityId) return null;

    return { entityType, entityId };
  }
}
```
