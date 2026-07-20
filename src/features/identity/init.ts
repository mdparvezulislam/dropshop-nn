import { FeatureFlags, Settings } from "@/shared/core/feature-flags";

export function registerIdentityModule(): void {
  FeatureFlags.register({
    key: "identity-module",
    name: "Identity Module",
    description: "Identity and business workspace engine",
    defaultState: "on",
  });

  FeatureFlags.register({
    key: "identity-auto-approve-reseller",
    name: "Auto Approve Reseller",
    description: "Automatically approve reseller business profiles",
    defaultState: "off",
  });

  FeatureFlags.register({
    key: "identity-auto-approve-wholesaler",
    name: "Auto Approve Wholesaler",
    description: "Automatically approve wholesaler business profiles",
    defaultState: "off",
  });

  FeatureFlags.register({
    key: "identity-auto-approve-supplier",
    name: "Auto Approve Supplier",
    description: "Automatically approve supplier business profiles",
    defaultState: "off",
  });

  Settings.register({
    key: "identity.auto-approve-reseller",
    name: "Auto Approve Reseller",
    description: "Automatically approve reseller business profiles",
    scope: "global",
    defaultValue: false,
  });

  Settings.register({
    key: "identity.auto-approve-wholesaler",
    name: "Auto Approve Wholesaler",
    description: "Automatically approve wholesaler business profiles",
    scope: "global",
    defaultValue: false,
  });

  Settings.register({
    key: "identity.auto-approve-supplier",
    name: "Auto Approve Supplier",
    description: "Automatically approve supplier business profiles",
    scope: "global",
    defaultValue: false,
  });

  Settings.register({
    key: "identity.session-ttl-hours",
    name: "Session TTL Hours",
    description: "Default session TTL in hours",
    scope: "global",
    defaultValue: 24,
  });

  Settings.register({
    key: "identity.remember-me-ttl-days",
    name: "Remember Me TTL Days",
    description: "Session TTL when Remember Me is enabled",
    scope: "global",
    defaultValue: 30,
  });
}
