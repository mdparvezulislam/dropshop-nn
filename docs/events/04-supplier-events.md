# 04 - Supplier Events

## Overview

Supplier events are published by the Supplier Service when supplier profiles, statuses, or inventory mappings change.

---

## Event: supplier.created

Published when a new supplier is registered on the platform.

### Payload

```typescript
interface SupplierCreatedPayload {
  supplierId: string
  code: string
  businessName: string
  ownerName: string
  email: string
  phone: string
  businessType: string
  status: string
  createdBy?: string
  createdAt: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| AnalyticsHandler | Track supplier registration | analytics |
| DashboardHandler | Refresh supplier widget | dashboard |
| AuditHandler | Record audit entry | audit |

### Validation

- `supplierId` must be a valid ObjectId string
- `code` must be unique
- `email` must be valid email format

### Retry Strategy

Max 3 retries, exponential backoff. DLQ on exhaustion.

---

## Event: supplier.updated

Published when supplier profile fields are modified.

### Payload

```typescript
interface SupplierUpdatedPayload {
  supplierId: string
  changes: {
    field: string
    oldValue: unknown
    newValue: unknown
  }[]
  updatedBy: string
  updatedAt: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| AnalyticsHandler | Track supplier update | analytics |
| DashboardHandler | Refresh supplier widget | dashboard |

---

## Event: supplier.approved

Published when a pending supplier is approved by an admin.

### Payload

```typescript
interface SupplierApprovedPayload {
  supplierId: string
  code: string
  businessName: string
  approvedBy: string
  approvedAt: string
  autoApproved: boolean
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| NotificationHandler | Send approval notification | notifications |
| AnalyticsHandler | Track supplier approval | analytics |
| DashboardHandler | Refresh supplier widget | dashboard |

---

## Event: supplier.rejected

Published when a supplier application is rejected.

### Payload

```typescript
interface SupplierRejectedPayload {
  supplierId: string
  code: string
  businessName: string
  rejectedBy: string
  rejectedAt: string
  reason: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| NotificationHandler | Send rejection notification | notifications |
| AnalyticsHandler | Track supplier rejection | analytics |

---

## Event: supplier.inventory_updated

Published when a supplier updates their inventory levels or pricing.

### Payload

```typescript
interface SupplierInventoryUpdatedPayload {
  supplierId: string
  productId: string
  variantSku?: string
  supplierSku: string
  oldStock?: number
  newStock?: number
  oldCost?: number
  newCost?: number
  leadTimeDays?: number
  updatedBy: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| InventoryRefreshHandler | Refresh platform inventory | inventory |
| AnalyticsHandler | Track inventory update | analytics |

---

## Event: supplier.status_changed

Published when a supplier's operational status changes.

### Payload

```typescript
interface SupplierStatusChangedPayload {
  supplierId: string
  code: string
  businessName: string
  oldStatus: string
  newStatus: string
  changedBy: string
  reason?: string
  changedAt: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| AnalyticsHandler | Track status change | analytics |
| DashboardHandler | Refresh supplier widget | dashboard |
