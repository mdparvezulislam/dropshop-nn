# 13 - Settings Foundation

## Overview

The settings foundation provides a type-safe registry for configuration values that can be changed at runtime. Settings are scoped to different levels of the platform.

---

## Setting Scope

| Scope      | Description           | Example                      |
| ---------- | --------------------- | ---------------------------- |
| `global`   | Platform-wide setting | Default currency, tax rate   |
| `business` | Per-business setting  | Payout threshold, commission |
| `role`     | Per-role setting      | Max discount for resellers   |
| `user`     | Per-user setting      | Notification preferences     |

---

## Setting Definition

```typescript
interface SettingDefinition<T = unknown> {
  key: string;
  name: string;
  description: string;
  scope: SettingScope;
  defaultValue: T;
  options?: T[]; // Allowed values (for validation)
}
```

---

## Default Registered Settings

| Key                               | Default     | Scope  |
| --------------------------------- | ----------- | ------ |
| `pricing.default-currency`        | BDT         | global |
| `pricing.default-tax-rate`        | 5           | global |
| `pricing.default-commission-rate` | 10          | global |
| `inventory.low-stock-threshold`   | 10          | global |
| `inventory.safety-stock`          | 5           | global |
| `reseller.auto-approve`           | false       | global |
| `wholesaler.auto-approve`         | false       | global |
| `supplier.auto-approve`           | false       | global |
| `notifications.email-enabled`     | true        | global |
| `notifications.sms-enabled`       | false       | global |
| `business.minimum-payout`         | 50000 (BDT) | global |
| `order.cod-enabled`               | true        | global |
| `order.auto-cancel-hours`         | 24          | global |

---

## Usage

```typescript
import { Settings } from "@/shared/core";

// Read setting
const currency = Settings.get<string>("pricing.default-currency");

// Register new setting (during engine initialization)
Settings.register({
  key: "my-engine.some-config",
  name: "Some Config",
  description: "Controls something in My Engine",
  scope: "global",
  defaultValue: "default-value",
});
```
