# 12 - Feature Flags

## Overview

The feature flag system allows enabling or disabling features without code changes. Every future module registers a feature flag on initialization.

---

## Feature Flag Structure

```typescript
interface FeatureFlagDefinition {
  key: string              // Unique identifier (e.g., "customer-module")
  name: string             // Human-readable name
  description: string      // What this flag controls
  defaultState: "on" | "off" | "partial"
  roles?: string[]         // Optional role-based gating
}
```

---

## Registered Default Flags

| Key | Default | Description |
|-----|---------|-------------|
| `customer-module` | off | Customer registration, profiles, cart |
| `order-management` | off | Order lifecycle, fulfillment, returns |
| `courier-integration` | off | Multi-courier dispatch and tracking |
| `payment-gateway` | off | bKash, Nagad, SSLCommerz |
| `wallet-system` | off | Digital wallet, payouts, ledger |
| `invoice-system` | off | Automated invoice generation |
| `multi-warehouse` | off | WMS with warehouse transfers |
| `analytics-engine` | off | Advanced analytics and dashboards |
| `reseller-portal` | on | Self-service reseller portal |
| `supplier-portal` | off | Self-service supplier portal |

---

## Usage

```typescript
import { FeatureFlags } from "@/shared/core"

if (FeatureFlags.isEnabled("customer-module")) {
  // Customer module is active
}

// Role-gated check
if (FeatureFlags.isEnabled("analytics-engine", "admin")) {
  // Only admins see analytics
}
```

---

## Settings Foundation

The `Settings` class provides a registry for global configuration values:

```typescript
import { Settings } from "@/shared/core"

// Read a setting
const currency = Settings.get<string>("pricing.default-currency")
const taxRate = Settings.get<number>("pricing.default-tax-rate")
```

Default settings are defined for pricing, inventory, reseller/wholesaler/supplier approval, notifications, and order management.
