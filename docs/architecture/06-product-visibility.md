# 06 - Product Visibility Architecture

## Overview

Different user roles see different product data. Visibility rules are enforced at the service layer, ensuring data protection regardless of the access point (UI, API, export).

---

## Visibility Matrix

### What Each Role Sees

| Data Field | Guest | Customer | Reseller | Wholesaler | Supplier | Manager | Admin |
|-----------|-------|----------|----------|------------|----------|---------|-------|
| Product Name | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Product Description | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Media | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Retail Price | ✓ | ✓ | Limited* | ✓ | ✓ | ✓ | ✓ |
| Compare Price | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Reseller Price | - | - | ✓ | - | - | ✓ | ✓ |
| Wholesale Price | - | - | - | ✓ | ✓ | ✓ | ✓ |
| Wholesale Tiers | - | - | - | ✓ | - | ✓ | ✓ |
| Cost Price | - | - | - | - | ✓ | ✓ | ✓ |
| Supplier Price | - | - | - | - | ✓ | ✓ | ✓ |
| Profit Margin | - | - | Preview | - | - | ✓ | ✓ |
| Inventory Level | Partial** | Partial** | - | - | ✓ | ✓ | ✓ |
| Supplier Info | - | - | - | - | ✓ | ✓ | ✓ |

*Resellers see the reseller price (which may differ from retail).
**Customers see availability status only (in_stock / low_stock / out_of_stock), not raw counts.

---

## Visibility Rule Engine

### Service Layer Enforcement

```typescript
class VisibilityService {
  filterForRole<T extends ProductData>(
    data: T | T[],
    role: UserRole,
  ): FilteredProductData | FilteredProductData[]
}
```

The `VisibilityService`:
1. Inspects the requesting user's role
2. Strips unauthorized fields from product data
3. Returns a role-appropriate view of the product

### Implementation Pattern

```
Server Action / API Route
    │
    ▼
Service Layer (business logic)
    │
    ├── PricingService.resolvePrice(role, ...)  → returns role-appropriate price
    ├── InventoryService.getAvailability(role)  → returns role-appropriate availability
    │
    ▼
VisibilityService.filterForRole(data, role)     → strips unauthorized fields
    │
    ▼
Response to client
```

---

## Price Visibility Rules

### Reseller Price Visibility

- Resellers see their assigned `ResellerProduct.pricing` (selling price, cost basis, profit preview)
- Resellers do NOT see the platform's base cost price or supplier price
- Resellers see the recommended selling price from the platform

### Wholesale Price Visibility

- Wholesalers see wholesale tiers and MOQ
- Wholesalers do NOT see reseller pricing or retail cost breakdown
- Wholesalers see the price applicable to their tier

### Customer Price Visibility

- Customers see the effective retail price only
- Customers see compare-at price (if applicable)
- Customers do NOT see any cost, wholesale, or reseller data
- Customers see availability as a human-readable status, not stock count

---

## Implementation Boundaries

| Layer | Responsibility |
|-------|---------------|
| **UI** | Renders only data passed by service layer; never re-fetches hidden data |
| **Service** | Invokes VisibilityService before returning data to actions |
| **API** | Same as service — visibility enforced before JSON response |
| **Export** | Visibility rules apply to CSV/PDF exports |
| **Repository** | No visibility logic; returns complete domain entities |

---

## Product Visibility Status

Products have their own visibility status independent of role visibility:

| Status | Description | Visible To |
|--------|-------------|------------|
| `published` | Visible in catalog | All roles |
| `draft` | Incomplete, not public | Admin, Manager, Creator |
| `archived` | Removed from active catalog | Admin only |
| `scheduled` | Scheduled for future publication | Admin, Manager |
| `hidden` | Exists but not in listings | Anyone with direct link |

---

## Future Extensions

- Location-based visibility (products visible only in certain divisions/districts)
- Group-based visibility (products visible only to specific customer groups)
- Time-based visibility (products visible during specific hours/seasons)
- A/B testing visibility (products visible to percentage of users)
