# 07 - Order Events

## Overview

Order events are published by the Order Service throughout the order lifecycle — from creation through delivery, return, or cancellation.

---

## Event: order.created

Published when a new order is placed.

### Payload

```typescript
interface OrderCreatedPayload {
  orderId: string
  orderNumber: string
  customerId: string
  customerType: 'customer' | 'reseller' | 'wholesaler'
  items: {
    productId: string
    variantSku?: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
  totalAmount: number
  currency: string
  paymentMethod: string
  shippingAddress: object
  channel: 'platform' | 'reseller_store' | 'wholesale'
  createdAt: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| InventoryReserveHandler | Reserve stock for order | inventory |
| PricingSnapshotHandler | Record price snapshot | pricing |
| ProfitCalcHandler | Compute order profit | analytics |
| AnalyticsHandler | Track order creation | analytics |
| NotificationHandler | Send confirmation | notifications |
| ReportingHandler | Queue sales report | reporting |
| DashboardHandler | Refresh orders widget | dashboard |

### Validation

- All monetary values in integer cents
- `items` array must not be empty
- Each item quantity must be > 0

### Retry Strategy

Max 5 retries, exponential backoff (1s → 2s → 4s → 8s → 16s). DLQ on exhaustion. This event is critical — requires rollback on failure.

---

## Event: order.confirmed

Published when payment is confirmed or order is manually confirmed.

### Payload

```typescript
interface OrderConfirmedPayload {
  orderId: string
  orderNumber: string
  confirmedBy: string
  confirmedAt: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| AnalyticsHandler | Track confirmation | analytics |
| DashboardHandler | Refresh orders widget | dashboard |

---

## Event: order.paid

Published when payment for the order is completed.

### Payload

```typescript
interface OrderPaidPayload {
  orderId: string
  orderNumber: string
  paymentId: string
  amount: number
  currency: string
  paymentMethod: string
  paidAt: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| InventoryFulfillHandler | Update stock for fulfillment | inventory |
| AnalyticsHandler | Track payment | analytics |
| ReportingHandler | Queue financial report | reporting |

---

## Event: order.packed

Published when the order items are packed and ready for shipping.

### Payload

```typescript
interface OrderPackedPayload {
  orderId: string
  orderNumber: string
  packedBy: string
  packedAt: string
  packageCount: number
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| AnalyticsHandler | Track packing | analytics |
| DashboardHandler | Refresh orders widget | dashboard |

---

## Event: order.shipped

Published when the order is dispatched to the courier.

### Payload

```typescript
interface OrderShippedPayload {
  orderId: string
  orderNumber: string
  courierName: string
  trackingNumber: string
  shippedAt: string
  estimatedDelivery?: string
  shippedBy: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| NotificationHandler | Send shipping notification | notifications |
| AnalyticsHandler | Track shipment | analytics |
| DashboardHandler | Refresh orders widget | dashboard |

---

## Event: order.delivered

Published when the order is marked as delivered.

### Payload

```typescript
interface OrderDeliveredPayload {
  orderId: string
  orderNumber: string
  deliveredAt: string
  confirmedBy: 'customer' | 'system' | 'courier'
  signature?: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| WalletReleaseHandler | Release payment to merchant | wallet |
| AnalyticsHandler | Track delivery | analytics |
| ReportingHandler | Queue fulfillment report | reporting |
| NotificationHandler | Send delivery confirmation | notifications |

---

## Event: order.returned

Published when an order is returned.

### Payload

```typescript
interface OrderReturnedPayload {
  orderId: string
  orderNumber: string
  items: { productId: string; quantity: number }[]
  returnReason: string
  returnType: 'full' | 'partial'
  refundAmount: number
  authorizedBy: string
  returnedAt: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| InventoryReturnHandler | Add returned stock to inventory | inventory |
| AnalyticsHandler | Track return | analytics |
| ReportingHandler | Queue returns report | reporting |

---

## Event: order.cancelled

Published when an order is cancelled.

### Payload

```typescript
interface OrderCancelledPayload {
  orderId: string
  orderNumber: string
  cancelledBy: string
  reason: string
  cancelledAt: string
  stage: 'pending' | 'confirmed' | 'paid' | 'packed'
  refundRequired: boolean
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| InventoryReleaseHandler | Release reserved stock | inventory |
| AnalyticsHandler | Track cancellation | analytics |
| ReportingHandler | Queue update | reporting |
