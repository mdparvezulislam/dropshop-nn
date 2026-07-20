# 12 - Automation Engine Architecture

## Overview

The Automation Engine orchestrates the cascade of updates that follow every business action. Instead of each service manually calling every dependent system, the Automation Engine listens to events and triggers the appropriate workflows.

---

## Core Principle

> Every business action produces exactly one event. The Automation Engine handles all downstream effects.

---

## Automation Flows

### Product Created

```
Product Created
    │
    ├── Event Published: product.created
    │
    ▼
Automation Engine
    ├── Pricing Service → Initialize ProductPricing (default values)
    ├── Inventory Service → Initialize ProductInventory (zero stock)
    ├── Search Service → Index product for search
    ├── Analytics → Track event
    ├── Dashboard → Refresh product widget
    ├── Notification → None (internal action)
    └── Audit Log → Product Created
```

### Pricing Updated

```
Pricing Updated
    │
    ├── Event Published: pricing.updated
    │
    ▼
Automation Engine
    ├── Search Service → Re-index (price range update)
    ├── Reseller Service → Notify resellers with this product
    ├── Analytics → Track price event
    ├── Dashboard → Refresh pricing widget
    ├── Reports → Queue report data update
    ├── Notification → Price change alert (if enabled)
    └── Audit Log → Price Changed
```

### New Order

```
Order Created
    │
    ├── Event Published: order.created
    │
    ▼
Automation Engine
    ├── Inventory Service → Reserve stock
    ├── Pricing Service → Record sale price snapshot
    ├── Profit Calculation → Compute and store order profit
    ├── Analytics → Track order event
    ├── Dashboard → Refresh orders widget
    ├── Reports → Queue sales report update
    ├── Notification → Order confirmation (customer + admin)
    ├── Activity Feed → New order entry
    └── Audit Log → Order Created
```

### Order Fulfilled

```
Order Fulfilled
    │
    ├── Event Published: order.fulfilled
    │
    ▼
Automation Engine
    ├── Inventory Service → Reduce available stock
    ├── Wallet Service → Release payment to merchant
    ├── Analytics → Track fulfillment event
    ├── Dashboard → Refresh fulfillment metrics
    ├── Reports → Queue fulfillment report
    ├── Notification → Shipping details to customer
    ├── Activity Feed → Order status update
    └── Audit Log → Order Fulfilled
```

### Stock Updated

```
Stock Updated
    │
    ├── Event Published: inventory.stock_updated
    │
    ▼
Automation Engine
    ├── Availability Recalculation → Update product availability
    ├── Search Service → Re-index (availability filter)
    ├── Low Stock Check → Alert if below threshold
    ├── Analytics → Track inventory event
    ├── Dashboard → Refresh inventory widget
    ├── Reports → Queue inventory report
    ├── Notification → Low stock alert (admin)
    └── Audit Log → Stock Updated
```

### Reseller Product Assigned

```
Product Assigned to Reseller
    │
    ├── Event Published: reseller.product_assigned
    │
    ▼
Automation Engine
    ├── Reseller Dashboard → Update product list
    ├── Analytics → Track assignment event
    ├── Notification → Product added notification (reseller)
    └── Audit Log → Product Added
```

---

## Automation Engine Architecture

```
Business Event (Event Bus)
    │
    ▼
AutomationEngine.handle(event)
    │
    ├── Load Automation Rules
    │   └── Rules: Map<EventType, AutomationStep[]>
    │
    ├── Execute Steps (sequentially or parallel)
    │   ├── Step 1: Service Call
    │   ├── Step 2: Service Call
    │   └── Step n: ...
    │
    ├── Error Handling
    │   ├── Retry (BullMQ, exponential backoff, max 3)
    │   ├── Dead Letter Queue (after max retries)
    │   └── Alert Admin (on persistent failure)
    │
    └── Audit Log → Automation Step Executed
```

---

## Automation Rule Configuration

```typescript
// Stored in database or config
AutomationRule {
  eventType: string
  steps: [
    {
      service: 'pricing'
      action: 'initializeDefaults'
      params: { /* template params from event */ }
      order: 1
      async: false    // sequential if false
      required: true  // block entire cascade on failure
    },
    {
      service: 'inventory'
      action: 'initializeZeroStock'
      order: 2
      async: true
      required: true
    }
  ]
  onFailure: 'rollback' | 'continue' | 'alert'
}
```

---

## Rollback Strategy

For critical cascades (e.g., order creation), the Automation Engine supports rollback:

- If any required step fails, previously executed steps are reversed
- Each service must implement `rollback<Action>()` for critical operations
- Rollback is itself logged as an audit event

---

## Future Enhancements

- Configurable automation rules via admin UI
- Custom workflows per supplier/reseller
- Time-delayed automations (e.g., auto-cancel after 24h)
- Webhook triggers for external system integration
- Automation analytics (success/failure rates, execution times)
