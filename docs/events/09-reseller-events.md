# 09 - Reseller Events

## Overview

Reseller events are published by the Reseller Service when reseller accounts are registered, approved, or update their business profile, pricing, or storefront.

---

## Event: reseller.registered

Published when a new reseller registers or is onboarded.

### Payload

```typescript
interface ResellerRegisteredPayload {
  resellerId: string
  code: string
  businessName: string
  ownerName: string
  email: string
  phone: string
  businessType: string
  registrationMethod: 'self' | 'invitation'
  status: string
  registeredAt: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| AnalyticsHandler | Track reseller acquisition | analytics |
| DashboardHandler | Refresh reseller widget | dashboard |
| AuditHandler | Record audit entry | audit |

### Validation

- `email` must be unique
- `code` must follow RSL-XXXX format

### Retry Strategy

Max 3 retries, exponential backoff. DLQ on exhaustion.

---

## Event: reseller.approved

Published when a pending reseller is approved by an admin (or auto-approved).

### Payload

```typescript
interface ResellerApprovedPayload {
  resellerId: string
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
| AnalyticsHandler | Track reseller approval | analytics |
| DashboardHandler | Refresh reseller widget | dashboard |

---

## Event: reseller.business_profile_completed

Published when a reseller completes their business profile.

### Payload

```typescript
interface BusinessProfileCompletedPayload {
  resellerId: string
  code: string
  businessName: string
  completedFields: string[]
  completedAt: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| AnalyticsHandler | Track profile completion | analytics |
| DashboardHandler | Refresh reseller widget | dashboard |

---

## Event: reseller.selling_price_updated

Published when a reseller updates their selling price for a product.

### Payload

```typescript
interface SellingPriceUpdatedPayload {
  resellerId: string
  productId: string
  variantSku?: string
  oldSellingPrice: number
  newSellingPrice: number
  updatedBy: string
  updatedAt: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| AnalyticsHandler | Track pricing change | analytics |
| ReportingHandler | Queue reseller report | reporting |

---

## Event: reseller.store_published

Published when a reseller publishes or updates their store.

### Payload

```typescript
interface StorePublishedPayload {
  resellerId: string
  code: string
  storeUrl?: string
  publishedProductCount: number
  publishedAt: string
}
```

### Subscribers

| Subscriber | Action | Queue |
|-----------|--------|-------|
| SearchIndexHandler | Index reseller store | search |
| AnalyticsHandler | Track store publication | analytics |
