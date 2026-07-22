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

  FeatureFlags.register({
    key: "pricing-global-rules",
    name: "Global Pricing Rules",
    description: "Enable global channel-based pricing rules",
    defaultState: "on",
  });

  FeatureFlags.register({
    key: "pricing-category-overrides",
    name: "Category Pricing Overrides",
    description: "Enable per-category pricing overrides",
    defaultState: "on",
  });

  FeatureFlags.register({
    key: "pricing-brand-overrides",
    name: "Brand Pricing Overrides",
    description: "Enable per-brand pricing overrides",
    defaultState: "on",
  });

  FeatureFlags.register({
    key: "pricing-supplier-rules",
    name: "Supplier Pricing Rules",
    description: "Enable per-supplier pricing rules",
    defaultState: "on",
  });

  FeatureFlags.register({
    key: "pricing-profiles",
    name: "Pricing Profiles",
    description: "Enable reusable pricing profiles",
    defaultState: "on",
  });

  FeatureFlags.register({
    key: "pricing-moq-tiers",
    name: "MOQ Pricing Tiers",
    description: "Enable minimum order quantity tier pricing",
    defaultState: "on",
  });

  FeatureFlags.register({
    key: "pricing-profit-protection",
    name: "Profit Protection",
    description: "Enable minimum price and margin protection",
    defaultState: "on",
  });

  FeatureFlags.register({
    key: "pricing-approval-workflow",
    name: "Price Approval Workflow",
    description: "Enable price change approval workflow",
    defaultState: "on",
  });

  FeatureFlags.register({
    key: "pricing-history",
    name: "Price History",
    description: "Track complete price change history",
    defaultState: "on",
  });

  FeatureFlags.register({
    key: "pricing-bulk-operations",
    name: "Bulk Pricing Operations",
    description: "Enable bulk price updates by filters",
    defaultState: "on",
  });

  FeatureFlags.register({
    key: "pricing-automation",
    name: "Price Automation",
    description: "Auto-recalculate prices when costs change",
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

  Settings.register({
    key: "pricing.default-retail-markup",
    name: "Default Retail Markup",
    description: "Default retail markup percentage",
    scope: "global",
    defaultValue: 40,
  });

  Settings.register({
    key: "pricing.default-wholesale-markup",
    name: "Default Wholesale Markup",
    description: "Default wholesale markup percentage",
    scope: "global",
    defaultValue: 25,
  });

  Settings.register({
    key: "pricing.default-reseller-markup",
    name: "Default Reseller Markup",
    description: "Default reseller markup percentage",
    scope: "global",
    defaultValue: 20,
  });

  Settings.register({
    key: "pricing.default-distributor-markup",
    name: "Default Distributor Markup",
    description: "Default distributor markup percentage",
    scope: "global",
    defaultValue: 15,
  });

  Settings.register({
    key: "pricing.round-to-nearest",
    name: "Round Prices To Nearest",
    description: "Default rounding value for computed prices",
    scope: "global",
    defaultValue: 1,
  });

  Settings.register({
    key: "pricing.min-profit-margin",
    name: "Minimum Profit Margin",
    description: "Minimum allowed profit margin percentage",
    scope: "global",
    defaultValue: 5,
  });

  Settings.register({
    key: "pricing.max-discount-percentage",
    name: "Maximum Discount",
    description: "Maximum allowed discount percentage",
    scope: "global",
    defaultValue: 70,
  });
}
