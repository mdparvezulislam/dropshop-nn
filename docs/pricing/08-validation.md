# 08 - Validation

## Overview

All pricing inputs are validated at multiple layers. The Rule Engine provides centralized validation for all pricing rules.

## Validation Layers

```
Zod Schema (action boundary)
  │  Type validation, required fields, integer cents
  ▼
Rule Engine (business rules)
  │  Reseller rules, price protection, campaign rules
  ▼
Repository (data integrity)
  │  Unique constraints, required fields
  ▼
MongoDB
```

## Input Validation

| Field                 | Rule                          |
| --------------------- | ----------------------------- |
| All monetary values   | Must be integer (cents/paise) |
| Supplier price        | >= 0                          |
| Selling prices        | >= minimumSellingPrice        |
| Wholesale tier prices | > 0, decreasing with quantity |
| Discount %            | 0-100                         |
| Campaign dates        | effectiveTo > effectiveFrom   |
| Minimum selling price | >= total cost                 |

## Business Rule Validation

### Price Protection

```
IF sellingPrice < totalCost
THEN Warning: "Selling price is below cost"
     (Allow but flag for admin review)
```

### Reseller Price

```
IF customPrice < minimumSellingPrice
THEN Error: "Selling price cannot be lower than the minimum allowed price"
     Block operation
```

### Wholesale Order

```
IF quantity < minimumTier.minQty (MOQ)
THEN Error: "Minimum order quantity is {MOQ}"
     Block order
```

### Campaign Dates

```
IF effectiveTo <= effectiveFrom
THEN Error: "Campaign end date must be after start date"
     Block save
```

## Error Response Format

```typescript
{
  success: false,
  error: "Price validation failed",
  code: "PRICE_BELOW_MINIMUM",
  details: {
    field: "sellingPrice",
    currentValue: 85000,
    minimumValue: 90000,
    message: "Selling price cannot be lower than the minimum allowed price.",
  },
}
```

## Validation at Scale

All validations are:

- Centralized in the Rule Engine
- Reusable across all enforcement points
- Configurable via admin settings
- Audited for compliance tracking
