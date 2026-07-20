# Order Module — Timeline & Audit Trail

## Purpose
Every action on an order is recorded in the timeline. The timeline lives in two places:
1. **Embedded** in the `Order` document (`order.timeline[]`) for fast read access
2. **Separate collection** (`order_timeline`) for queryable, indexed audit trail

## Timeline Actions

| Action | Trigger | Description |
|---|---|---|
| `order.created` | Order creation | Order created from checkout draft |
| `order.status_changed` | Status transition | Status changed with old/new values |
| `order.note_added` | Note added | Public or internal note |
| `order.cancelled` | Cancellation | Order cancelled with reason |
| `order.return_requested` | Return request | Customer requested return |
| `order.return_processed` | Return processed | Admin processed return |
| `order.refunded` | Refund | Refund processed |
| `order.courier_assigned` | Courier assignment | Courier assigned to order |
| `order.tracking_updated` | Tracking update | Tracking number/URL updated |
| `order.shipping_cost_updated` | Shipping cost | Shipping cost changed |
| `order.delivered` | Delivery | Order marked delivered |
| `order.completed` | Completion | Order completed |
| `order.failed` | Failure | Order processing failed |
| `order.inventory_released` | Inventory | Inventory released |
| `order.inventory_committed` | Inventory | Inventory committed |
| `order.payment_received` | Payment | Payment received |
| `order.flagged` | Flag | Order flagged for review |
| `order.system_action` | System | Automated system action |
| `order.automation_triggered` | Automation | Automation workflow triggered |

## Timeline Entry Structure

```typescript
interface OrderTimelineEntry {
  id: string;                    // UUID v4
  eventType: string;             // Domain event type
  action: TimelineAction;        // Specific action key
  summary: string;               // Human-readable description
  actor?: { id: string; name?: string; role?: string };
  changes?: Array<{
    field: string;
    oldValue?: unknown;
    newValue?: unknown;
  }>;
  metadata?: Record<string, unknown>;
  correlationId?: string;
  timestamp: Date;
}
```

## Timeline Service
`OrderTimelineService` provides:
- `addEntry()` — creates entry in both embedded document and separate collection
- `getTimeline()` — paginated timeline for an entity
- `getTimelineByAction()` — filter by action type

## Query Indexes
- `{ entityType: 1, entityId: 1, createdAt: -1 }` — primary lookup
- `{ action: 1, createdAt: -1 }` — action-based queries
- `{ correlationId: 1 }` — correlation across modules
