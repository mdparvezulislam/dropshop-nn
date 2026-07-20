# 02 - Event Registry

## Purpose

The Event Registry is the central mapping of event types to their subscribers. Every event type must be registered before it can be dispatched.

---

## Registry Structure

```typescript
interface EventRegistryEntry {
  eventType: string
  description: string
  version: number
  handlerType: 'sync' | 'async'
  subscribers: SubscriberConfig[]
  retryConfig: RetryConfig
  idempotencyWindow: number  // minutes
  maxProcessingTime: number  // ms
}

interface SubscriberConfig {
  name: string
  handler: string         // Handler class name
  queue: string           // BullMQ queue name (for async)
  priority: number        // 1 (highest) - 10 (lowest)
  enabled: boolean
}
```

---

## Registered Events

### Catalog Events

| Event Type | Version | Handler Type | Subscribers |
|-----------|---------|-------------|-------------|
| product.created | 1 | async | Pricing Init, Inventory Init, Search Index, Analytics, Dashboard |
| product.updated | 1 | async | Search Index, Analytics, Reporting, Dashboard |
| product.deleted | 1 | async | Search Index, Analytics, Dashboard |
| product.published | 1 | async | Search Index, Analytics, Dashboard |
| product.archived | 1 | async | Search Index, Analytics, Dashboard |
| product.visibility_changed | 1 | async | Search Index, Dashboard |
| product.status_changed | 1 | async | Search Index, Analytics, Dashboard |
| product.variant_created | 1 | async | Pricing Init, Inventory Init |
| product.variant_updated | 1 | async | Search Index |
| product.variant_deleted | 1 | async | Pricing Cleanup, Inventory Cleanup |

### Supplier Events

| Event Type | Version | Handler Type | Subscribers |
|-----------|---------|-------------|-------------|
| supplier.created | 1 | async | Analytics, Dashboard |
| supplier.updated | 1 | async | Analytics, Dashboard |
| supplier.approved | 1 | async | Notification, Analytics, Dashboard |
| supplier.rejected | 1 | async | Notification, Analytics |
| supplier.inventory_updated | 1 | async | Inventory Refresh, Analytics |
| supplier.status_changed | 1 | async | Analytics, Dashboard |

### Pricing Events

| Event Type | Version | Handler Type | Subscribers |
|-----------|---------|-------------|-------------|
| price.created | 1 | async | Search Index, Analytics |
| price.updated | 1 | async | Search Index, Reseller Notify, Analytics, Reporting, Dashboard |
| price.wholesale_tier_updated | 1 | async | Search Index, Analytics |
| price.minimum_price_updated | 1 | async | Reseller Notify, Analytics |
| price.recommended_price_updated | 1 | async | Reseller Notify, Analytics |
| price.campaign_started | 1 | async | Search Index, Notification, Analytics |
| price.campaign_ended | 1 | async | Search Index, Notification, Analytics |

### Inventory Events

| Event Type | Version | Handler Type | Subscribers |
|-----------|---------|-------------|-------------|
| inventory.created | 1 | async | Search Index, Analytics |
| inventory.adjusted | 1 | async | Availability Recalc, Search Index, Analytics |
| stock.increased | 1 | async | Availability Recalc, Low Stock Clear, Analytics |
| stock.decreased | 1 | async | Availability Recalc, Analytics |
| stock.reserved | 1 | async | Analytics |
| stock.released | 1 | async | Availability Recalc, Analytics |
| inventory.low_stock_detected | 1 | async | Notification, Analytics, Dashboard |
| inventory.out_of_stock | 1 | async | Notification, Analytics, Dashboard |
| inventory.warehouse_changed | 1 | async | Inventory Refresh, Analytics |

### Order Events

| Event Type | Version | Handler Type | Subscribers |
|-----------|---------|-------------|-------------|
| order.created | 1 | async | Inventory Reserve, Pricing Snapshot, Profit Calc, Analytics, Notification, Reporting, Dashboard |
| order.confirmed | 1 | async | Analytics, Dashboard |
| order.paid | 1 | async | Inventory Fulfill, Analytics, Reporting |
| order.packed | 1 | async | Analytics, Dashboard |
| order.shipped | 1 | async | Notification, Analytics, Dashboard |
| order.delivered | 1 | async | Wallet Release, Analytics, Reporting, Notification |
| order.returned | 1 | async | Inventory Return, Analytics, Reporting |
| order.cancelled | 1 | async | Inventory Release, Analytics, Reporting |

### Customer Events

| Event Type | Version | Handler Type | Subscribers |
|-----------|---------|-------------|-------------|
| customer.registered | 1 | async | Analytics, Dashboard |
| customer.verified | 1 | async | Notification, Analytics |
| customer.profile_updated | 1 | async | Analytics |

### Reseller Events

| Event Type | Version | Handler Type | Subscribers |
|-----------|---------|-------------|-------------|
| reseller.registered | 1 | async | Analytics, Dashboard |
| reseller.approved | 1 | async | Notification, Analytics, Dashboard |
| reseller.business_profile_completed | 1 | async | Analytics, Dashboard |
| reseller.selling_price_updated | 1 | async | Analytics, Reporting |
| reseller.store_published | 1 | async | Search Index, Analytics |

### Wholesaler Events

| Event Type | Version | Handler Type | Subscribers |
|-----------|---------|-------------|-------------|
| wholesaler.registered | 1 | async | Analytics, Dashboard |
| wholesaler.approved | 1 | async | Notification, Analytics |
| wholesaler.pricing_viewed | 1 | async | Analytics |

### Payment Events

| Event Type | Version | Handler Type | Subscribers |
|-----------|---------|-------------|-------------|
| payment.initiated | 1 | async | Analytics |
| payment.completed | 1 | async | Order Update, Notification, Analytics, Reporting |
| payment.failed | 1 | async | Notification, Analytics |
| payment.refund_created | 1 | async | Order Update, Analytics, Reporting |

### System Events

| Event Type | Version | Handler Type | Subscribers |
|-----------|---------|-------------|-------------|
| system.login | 1 | sync | Audit, Analytics |
| system.logout | 1 | sync | Audit, Analytics |
| system.role_changed | 1 | async | Authorization Cache, Analytics |
| system.permission_changed | 1 | async | Authorization Cache, Analytics |

---

## Registration API

```typescript
class EventRegistry {
  static register(eventType: string, config: EventRegistryEntry): void
  static getSubscribers(eventType: string): SubscriberConfig[]
  static getRetryConfig(eventType: string): RetryConfig
  static getHandlerType(eventType: string): 'sync' | 'async'
  static getAllEvents(): Map<string, EventRegistryEntry>
  static isRegistered(eventType: string): boolean
}
```

---

## Registration Example

```typescript
EventRegistry.register('product.created', {
  eventType: 'product.created',
  description: 'A new product has been created in the catalog',
  version: 1,
  handlerType: 'async',
  subscribers: [
    { name: 'PricingInitHandler', handler: 'PricingInitHandler', queue: 'pricing', priority: 1, enabled: true },
    { name: 'InventoryInitHandler', handler: 'InventoryInitHandler', queue: 'inventory', priority: 1, enabled: true },
    { name: 'SearchIndexHandler', handler: 'SearchIndexHandler', queue: 'search', priority: 2, enabled: true },
    { name: 'AnalyticsHandler', handler: 'AnalyticsHandler', queue: 'analytics', priority: 3, enabled: true },
    { name: 'DashboardHandler', handler: 'DashboardHandler', queue: 'dashboard', priority: 4, enabled: true },
  ],
  retryConfig: { maxRetries: 3, backoffMs: 1000, backoffMultiplier: 2 },
  idempotencyWindow: 60,
  maxProcessingTime: 30000,
})
```
