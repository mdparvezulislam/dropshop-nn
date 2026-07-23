import { FeatureFlags, Settings } from "@/lib/core/feature-flags";

export function registerInventoryModule(): void {
  FeatureFlags.register({
    key: "inventory-module",
    name: "Inventory Module",
    description: "Enterprise Inventory & Stock Management Engine",
    defaultState: "on",
  });

  FeatureFlags.register({
    key: "inventory-enable-supplier-stock",
    name: "Enable Supplier Stock Tracking",
    description: "Track supplier-level inventory per product",
    defaultState: "on",
  });

  FeatureFlags.register({
    key: "inventory-auto-reserve",
    name: "Auto Reserve on Order",
    description: "Automatically reserve stock when order is created",
    defaultState: "on",
  });

  FeatureFlags.register({
    key: "inventory-low-stock-alerts",
    name: "Low Stock Alerts",
    description: "Emit low stock alerts when threshold is crossed",
    defaultState: "on",
  });

  Settings.register({
    key: "inventory.default-low-stock-threshold",
    name: "Default Low Stock Threshold",
    description: "Default threshold for low stock warning",
    scope: "global",
    defaultValue: 5,
  });

  Settings.register({
    key: "inventory.reservation-ttl-minutes",
    name: "Reservation TTL Minutes",
    description: "Default time-to-live for stock reservations in minutes",
    scope: "global",
    defaultValue: 30,
  });

  Settings.register({
    key: "inventory.allow-backorder-default",
    name: "Allow Backorder Default",
    description: "Default setting for backorder allowance",
    scope: "global",
    defaultValue: false,
  });

  Settings.register({
    key: "inventory.allow-preorder-default",
    name: "Allow Pre-Order Default",
    description: "Default setting for pre-order allowance",
    scope: "global",
    defaultValue: false,
  });
}
