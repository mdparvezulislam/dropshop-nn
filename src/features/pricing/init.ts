import { FeatureFlags, Settings } from "@/shared/core/feature-flags";

export function registerPricingModule(): void {
  FeatureFlags.register({
    key: "pricing-module",
    name: "Pricing Module",
    description: "Pricing & Profit Engine",
    defaultState: "on",
  });

  FeatureFlags.register({
    key: "pricing-enable-wholesale-tiers",
    name: "Enable Wholesale Tiers",
    description: "Enable wholesale quantity-based tier pricing",
    defaultState: "on",
  });

  FeatureFlags.register({
    key: "pricing-enable-campaigns",
    name: "Enable Campaign Pricing",
    description: "Enable time-windowed campaign pricing",
    defaultState: "on",
  });

  FeatureFlags.register({
    key: "pricing-enable-media-visibility",
    name: "Enable Media Visibility",
    description: "Enable role-based media collection visibility",
    defaultState: "on",
  });

  FeatureFlags.register({
    key: "pricing-enable-reseller-rules",
    name: "Enable Reseller Rules",
    description: "Enable reseller custom price validation rules",
    defaultState: "on",
  });

  Settings.register({
    key: "pricing.default-currency",
    name: "Default Currency",
    description: "Default currency for new pricing records",
    scope: "global",
    defaultValue: "BDT",
  });

  Settings.register({
    key: "pricing.default-commission-rate",
    name: "Default Commission Rate",
    description: "Default platform commission rate percentage",
    scope: "global",
    defaultValue: 5,
  });

  Settings.register({
    key: "pricing.price-below-cost-warning",
    name: "Price Below Cost Warning",
    description: "Emit warning when selling price is below total cost",
    scope: "global",
    defaultValue: true,
  });

  Settings.register({
    key: "pricing.cache-ttl-seconds",
    name: "Price Cache TTL",
    description: "Time-to-live for resolved price cache in seconds",
    scope: "global",
    defaultValue: 300,
  });
}
