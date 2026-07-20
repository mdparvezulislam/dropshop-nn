# 10 - Automation

## Overview

Pricing changes trigger automated updates across the platform. Every pricing mutation cascades through the event system.

## Automation Flows

### Pricing Updated
```
Pricing Updated
  │
  ├── Refresh Profit Preview (recalculate costs, margins)
  ├── Refresh Reseller Dashboard (update prices, profit)
  ├── Refresh Wholesaler Dashboard (update tiers, savings)
  ├── Refresh Reports (update product profitability)
  ├── Refresh Analytics (update pricing metrics)
  ├── Update Search Metadata (reindex price data)
  ├── Create Audit Log (record change, actor, timestamp)
  └── Generate Business Timeline (activity record)
```

### Wholesale Tier Updated
```
Wholesale Tier Updated
  │
  ├── Recalculate All Tier Prices
  ├── Refresh Wholesaler Dashboard
  ├── Refresh Reports
  ├── Notify Wholesalers (price change alert)
  ├── Create Audit Log
  └── Generate Business Timeline
```

### Campaign Started
```
Campaign Started
  │
  ├── Override Product Price in Checkout
  ├── Update Search Boost (increase search weight)
  ├── Notify Subscribers (campaign launch alert)
  ├── Update Dashboard (campaign metrics)
  ├── Create Analytics Event
  ├── Create Audit Log
  └── Generate Business Timeline
```

### Campaign Ended
```
Campaign Ended
  │
  ├── Revert to Base Price
  ├── Update Search Boost (restore normal weight)
  ├── Update Dashboard (campaign results)
  ├── Create Analytics Event
  ├── Create Audit Log
  └── Generate Business Timeline
```

## Automation Service

The automation flows are managed by `PricingService` which:
1. Mutates pricing data
2. Publishes events to Event Bus
3. Downstream services subscribe and react

Direct synchronous actions (within same transaction):
- Profit recalculation
- Rule re-evaluation

Asynchronous actions (via Event Bus):
- Dashboard refresh
- Report update
- Analytics tracking
- Notification dispatch
