# 09 - Analytics Contracts

## Overview

Analytics contracts define how every engine publishes analytics events. The Analytics Engine captures these events and computes metrics for dashboards, reports, and business intelligence.

---

## Analytics Event Structure

```typescript
interface AnalyticsEvent {
  event: string; // e.g., "product.created", "order.placed"
  timestamp: Date;
  actor?: {
    id: string;
    role: string;
  };
  properties: Record<string, unknown>; // Event-specific data
  metrics?: {
    value?: number; // Numeric value (revenue, count, etc.)
    currency?: string; // ISO 4217
    unit?: string; // "count", "cents", "percentage"
  };
  dimensions?: {
    // For grouping/filtering
    category?: string;
    brand?: string;
    channel?: string;
    region?: string;
  };
}
```

---

## Analytics Publisher Contract

```typescript
interface AnalyticsPublisherContract {
  track(event: string, data: Record<string, unknown>, actor?: ActorInfo): Promise<void>;
}
```

---

## Standard Analytics Events

Every engine publishes these analytics events automatically:

| Engine    | Events                                                                                     |
| --------- | ------------------------------------------------------------------------------------------ |
| Catalog   | `product.created`, `product.updated`, `product.published`, `product.archived`              |
| Pricing   | `pricing.created`, `pricing.updated`, `pricing.campaign_started`                           |
| Inventory | `inventory.created`, `inventory.adjusted`, `inventory.low_stock`, `inventory.out_of_stock` |
| Order     | `order.created`, `order.completed`, `order.cancelled`, `order.returned`                    |
| Customer  | `customer.registered`, `customer.verified`                                                 |
| Reseller  | `reseller.registered`, `reseller.approved`                                                 |
| Supplier  | `supplier.registered`, `supplier.approved`                                                 |
| Payment   | `payment.completed`, `payment.failed`, `payment.refunded`                                  |
