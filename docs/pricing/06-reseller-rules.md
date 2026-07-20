# 06 - Reseller Rules

## Overview

Reseller pricing rules control how resellers set custom selling prices. Admins define bounds; the system enforces them.

## Admin Controls

| Control | Type | Description |
|---------|------|-------------|
| `minimumSellingPrice` | Number | Reseller cannot sell below this |
| `recommendedSellingPrice` | Number | Suggested selling price (guideline) |
| `allowCustomPrice` | Boolean | Whether reseller can set custom price |
| `maximumDiscountPercent` | Number | Max discount % reseller can offer |
| `maximumMarkupPercent` | Number | Max markup % above recommended |

## Validation Rules

### Rule 1: Minimum Price Floor
```
IF customPrice < minimumSellingPrice
THEN
  Reject
  Error: "Selling price cannot be lower than the minimum allowed price."
```

### Rule 2: Custom Price Allowed
```
IF allowCustomPrice == false
AND customPrice != recommendedSellingPrice
THEN
  Reject
  Error: "Custom pricing is not allowed."
```

### Rule 3: Maximum Discount
```
IF discountPercent > maximumDiscountPercent
THEN
  Reject
  Error: "Discount cannot exceed {maxDiscount}%"
```

### Rule 4: Maximum Markup
```
IF markupPercent > maximumMarkupPercent
THEN
  Reject
  Error: "Markup cannot exceed {maxMarkup}%"
```

## Enforcement Points

| Point | Enforcement |
|-------|-------------|
| Product Save | Validate reseller price before saving |
| Checkout | Validate final price before order creation |
| Order Creation | Validate all line item prices |
| Bulk Import | Validate every row against rules |
| API Requests | Validate all price mutations |

## Reseller Price Visibility

Reseller sees:
- Reseller price (their base)
- Minimum selling price
- Recommended selling price
- Expected profit at current price

Reseller never sees:
- Supplier cost
- Purchase cost
- Internal cost breakdown
- Platform commission

## Event Publication

- `pricing.minimum_selling_price_changed` — floor price updated
- `pricing.recommended_selling_price_changed` — guideline updated
