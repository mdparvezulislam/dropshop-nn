# 14 - API Boundaries

## Overview

The Pricing Engine exposes a strict service API. All price resolution, validation, and mutation must go through these public methods.

## Public Service API

### PricingService

| Method | Input | Output | Description |
|--------|-------|--------|-------------|
| `createPricing` | productId, data, actor | ProductPricing | Create pricing record |
| `getPricing` | productId, variantSku? | ProductPricing | Get full pricing |
| `updatePricing` | productId, data, actor | ProductPricing | Update pricing fields |
| `resolvePrice` | productId, role, quantity?, campaignCode? | ResolvedPrice | Get effective price |
| `resolveWholesaleTier` | productId, quantity | WholesaleTier | Get matching tier |
| `validateResellerPrice` | productId, customPrice | ValidationResult | Validate against rules |

### RuleEngineService

| Method | Input | Output | Description |
|--------|-------|--------|-------------|
| `evaluate` | context | RuleResult | Evaluate all applicable rules |
| `addRule` | rule | PricingRule | Add new rule |
| `updateRule` | ruleId, data | PricingRule | Update rule |
| `removeRule` | ruleId | void | Remove rule |

### ProfitCalculationService

| Method | Input | Output |
|--------|-------|--------|
| `calculateProfit` | pricing | ProfitBreakdown |
| `calculateBulkProfit` | pricing, quantity | ProjectedProfit |

### MediaVisibilityService

| Method | Input | Output |
|--------|-------|--------|
| `filterMediaByRole` | media[], role | ProductMedia[] |
| `checkAccess` | collection, role | boolean |

## Prohibited Access

| ❌ Not Allowed | ✅ Correct |
|---------------|------------|
| Calculating price in checkout service | `pricingService.resolvePrice()` |
| Reading supplier cost in catalog | `pricingService.getPricing()` |
| Bypassing rule validation in order create | `pricingService.validateResellerPrice()` |
| Storing price copies in other engines | Always read from Pricing Engine |
