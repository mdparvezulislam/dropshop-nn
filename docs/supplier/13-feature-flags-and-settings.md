# Feature Flags & Settings

## Feature Flags
Registered in `src/features/supplier/init.ts` via `registerSupplierFeatureFlags()`.

| Key | Default | Description |
|---|---|---|
| `supplier.management.enabled` | `true` | Master toggle for the supplier module |
| `supplier.auto_approve` | `false` | Auto-approve new suppliers |
| `supplier.product_mapping.enabled` | `true` | Enable product mapping |
| `supplier.performance_tracking.enabled` | `true` | Enable performance scoring |
| `supplier.notifications.enabled` | `true` | Email/in-app notifications for supplier events |

## Settings
| Key | Default | Type | Description |
|---|---|---|---|
| `supplier.default_lead_time_days` | `7` | number | Default lead time for new suppliers |
| `supplier.max_products_per_supplier` | `1000` | number | Max mapped products per supplier |
| `supplier.performance_decay_period_days` | `90` | number | Days before score decay starts |
| `supplier.auto_suspend_threshold` | `20` | number | Auto-suspend below this score |

## Registration
Call `registerSupplierFeatureFlags()` during application bootstrap to register all flags and settings.
