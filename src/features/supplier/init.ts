import { FeatureFlags, type FeatureFlagDefinition } from "@/shared/core/feature-flags";
import { Settings, type SettingDefinition } from "@/shared/core/feature-flags";

export function registerSupplierFeatureFlags(): void {
  const flags: FeatureFlagDefinition[] = [
    {
      key: "supplier.management.enabled",
      name: "Supplier Management",
      description: "Enable the supplier management module",
      defaultState: "on",
    },
    {
      key: "supplier.auto_approve",
      name: "Auto Approve Suppliers",
      description: "Automatically approve new supplier registrations",
      defaultState: "off",
    },
    {
      key: "supplier.product_mapping.enabled",
      name: "Product Mapping",
      description: "Enable supplier-to-product mapping",
      defaultState: "on",
    },
    {
      key: "supplier.performance_tracking.enabled",
      name: "Performance Tracking",
      description: "Enable automated supplier performance scoring",
      defaultState: "on",
    },
    {
      key: "supplier.notifications.enabled",
      name: "Supplier Notifications",
      description: "Enable email and in-app notifications for supplier events",
      defaultState: "on",
    },
  ];

  flags.forEach((f) => FeatureFlags.register(f));

  const settings: SettingDefinition[] = [
    {
      key: "supplier.default_lead_time_days",
      name: "Default Lead Time (Days)",
      description: "Default lead time in days for new suppliers",
      scope: "global",
      defaultValue: 7,
    },
    {
      key: "supplier.max_products_per_supplier",
      name: "Max Products Per Supplier",
      description: "Maximum number of products a single supplier can be mapped to",
      scope: "global",
      defaultValue: 1000,
    },
    {
      key: "supplier.performance_decay_period_days",
      name: "Performance Decay Period (Days)",
      description: "Number of days before a performance score starts decaying without new data",
      scope: "global",
      defaultValue: 90,
    },
    {
      key: "supplier.auto_suspend_threshold",
      name: "Auto-Suspend Threshold",
      description: "Performance score below which a supplier is automatically suspended",
      scope: "global",
      defaultValue: 20,
    },
  ];

  settings.forEach((s) => Settings.register(s));
}
