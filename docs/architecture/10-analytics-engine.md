# 10 - Analytics Engine Architecture

## Overview

The Analytics Engine is a centralized event-driven system that captures every meaningful business action and makes it available for dashboards, reports, and business intelligence.

---

## Core Principle

> Every business action generates analytics events. Analytics are not queried from live databases — they are pre-aggregated from event streams.

---

## Event Types

### User Events

| Event                  | Data                        |
| ---------------------- | --------------------------- |
| `user.registered`      | role, date, referral source |
| `user.logged_in`       | role, timestamp             |
| `user.profile_updated` | changed fields              |
| `user.verified`        | verification type           |

### Product Events

| Event               | Data                      |
| ------------------- | ------------------------- |
| `product.created`   | category, brand, supplier |
| `product.updated`   | changed fields            |
| `product.published` | publisher role            |
| `product.archived`  | reason                    |
| `product.viewed`    | user role, referrer       |

### Order Events

| Event                    | Data                  |
| ------------------------ | --------------------- |
| `order.created`          | total, items, channel |
| `order.fulfilled`        | fulfillment time      |
| `order.cancelled`        | reason, stage         |
| `order.returned`         | items, reason         |
| `order.payment_received` | amount, method        |
| `order.payment_refunded` | amount, reason        |

### Inventory Events

| Event                    | Data                     |
| ------------------------ | ------------------------ |
| `inventory.stock_in`     | quantity, supplier       |
| `inventory.stock_out`    | quantity, order ref      |
| `inventory.adjusted`     | delta, reason            |
| `inventory.low_stock`    | current stock, threshold |
| `inventory.out_of_stock` | duration                 |

### Pricing Events

| Event                      | Data                               |
| -------------------------- | ---------------------------------- |
| `pricing.updated`          | old price, new price, changer role |
| `pricing.campaign_started` | campaign type, discount            |
| `pricing.campaign_ended`   | campaign type, sales during        |
| `pricing.bulk_updated`     | count affected                     |

### Reseller Events

| Event                       | Data              |
| --------------------------- | ----------------- |
| `reseller.registered`       | business type     |
| `reseller.verified`         | verification type |
| `reseller.product_assigned` | product count     |
| `reseller.product_sold`     | product, profit   |

### Supplier Events

| Event                    | Data                        |
| ------------------------ | --------------------------- |
| `supplier.registered`    | business type               |
| `supplier.verified`      | verification type           |
| `supplier.stock_updated` | product, quantity           |
| `supplier.price_changed` | product, old cost, new cost |

---

## Analytics Pipeline

```
Business Action
    │
    ▼
Action / Service Layer
    │
    ├── Publish Analytics Event
    │       │
    │       ▼
    │   AnalyticsEventBus
    │       │
    │       ├── → Store in AnalyticsEvents collection (raw events)
    │       ├── → Update Aggregations (Counters, Sums, Averages)
    │       └── → Invalidate Cached Dashboard Data
    │
    ▼
Dashboard / Report / BI Tool reads aggregated data
```

---

## Aggregation Engine

### Real-time Aggregations

- Counters: total users, total orders, total products
- Sums: revenue, profit, commission
- Averages: average order value, average fulfillment time

### Scheduled Aggregations (BullMQ)

- Daily/Weekly/Monthly rollups
- Trend calculations
- Comparative analytics (MoM/YoY)

### Aggregation Storage

```typescript
// Counters (Redis)
SET analytics:count:users:total 15000
SET analytics:count:orders:today 342
SET analytics:sum:revenue:today 3420000  // in cents

// Time-series (MongoDB)
AnalyticsAggregation {
  metric: string          // e.g., "daily_revenue"
  period: string          // "2026-07-19"
  value: number
  dimensions: {           // Optional breakdowns
    channel?: string
    category?: string
    supplierId?: string
  }
}
```

---

## Analytics Service

```typescript
class AnalyticsService {
  track(event: AnalyticsEvent): void;
  getMetric(metric: string, period: DateRange): number;
  getTimeSeries(metric: string, period: DateRange, granularity: string): TimeSeriesData[];
  getDashboardMetrics(role: string): DashboardMetrics;
  getComparison(metric: string, period1: DateRange, period2: DateRange): ComparisonData;
}
```

---

## Dashboard Integration

The Analytics Engine powers all platform dashboards:

- **Admin Dashboard**: Revenue, orders, users, growth trends
- **Manager Dashboard**: Team performance, operational metrics
- **Reseller Dashboard**: Personal sales, profit, assigned products
- **Supplier Dashboard**: Listed products, orders, payouts

All dashboard widgets derive from AnalyticsService — never from live database queries.
