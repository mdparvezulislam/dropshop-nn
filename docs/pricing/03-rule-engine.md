# 03 - Rule Engine

## Overview

The Rule Engine is a centralized, reusable system for evaluating pricing rules. Every pricing decision routes through the Rule Engine before being applied.

## Rule Types

| Rule Type | Evaluation Time | Description |
|-----------|----------------|-------------|
| Reseller Price Rules | On product save, checkout, order create | Validate reseller custom prices |
| Wholesale Tier Rules | On price resolution | Auto-select matching tier |
| Campaign Override Rules | On price resolution | Apply active campaign prices |
| Price Protection Rules | On any price write | Prevent below-minimum prices |
| Visibility Rules | On media access | Control which media is visible |

## Rule Structure

```typescript
interface PricingRule {
  id: string;
  name: string;
  description: string;
  ruleType: "reseller" | "wholesale" | "campaign" | "protection" | "visibility";
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number;
  isActive: boolean;
}

interface RuleCondition {
  field: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "between";
  value: unknown;
}

interface RuleAction {
  type: "reject" | "override" | "validate" | "transform";
  config: Record<string, unknown>;
}
```

## Rule Evaluation Flow

```
RuleEngine.evaluate(context: RuleContext)
  │
  ├── Load Active Rules (sorted by priority)
  ├── For Each Rule:
  │     ├── Evaluate Conditions
  │     ├── If All Conditions Met:
  │     │     ├── Execute Actions
  │     │     └── Collect Results
  │     └── If Condition Fails:
  │           └── Skip Rule
  │
  └── Return Aggregate RuleResult
```

## Business Rules Implemented

### Rule 1: Reseller Price Floor
```
IF user.role == "reseller"
AND customPrice < minimumSellingPrice
THEN → Reject with error
```

### Rule 2: Wholesale Tier Selection
```
IF user.role == "wholesaler"
AND quantity >= tier.minQty
THEN → Apply tier price
```

### Rule 3: Campaign Override
```
IF campaign.isActive == true
AND currentDate between effectiveFrom..effectiveTo
THEN → Override price with campaignPrice
```

### Rule 4: Reseller Custom Price
```
IF user.role == "reseller"
AND allowCustomPrice == true
AND customPrice between minSellingPrice..maxMarkup
THEN → Accept custom price
```

## Extensibility

New rules can be added without changing core architecture:
1. Define a new rule type
2. Register conditions and actions
3. The Rule Engine evaluates it automatically

## Future Rule Types

- Coupon/Discount rules
- Regional pricing rules
- VIP/Distributor/Franchise pricing
- Dynamic pricing (time-of-day, demand-based)
- Bundle pricing rules
