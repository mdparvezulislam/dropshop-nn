import { FeatureFlags, Settings } from "@/shared/core/feature-flags";

export function registerCostModule(): void {
  FeatureFlags.register({
    key: "cost-engine",
    name: "Cost Engine",
    description: "Versioned product cost intelligence & history",
    defaultState: "on",
  });

  FeatureFlags.register({
    key: "cost-auto-recalculate-pricing",
    name: "Auto Recalculate Pricing",
    description: "Automatically recalculate prices when cost changes",
    defaultState: "on",
  });

  FeatureFlags.register({
    key: "cost-use-landed-cost",
    name: "Use Landed Cost",
    description: "Use landed cost instead of base cost for pricing engine",
    defaultState: "off",
  });

  FeatureFlags.register({
    key: "cost-approval-workflow",
    name: "Cost Approval Workflow",
    description: "Require approval for cost changes",
    defaultState: "off",
  });

  Settings.register({
    key: "cost.default-currency",
    name: "Default Cost Currency",
    description: "Default currency for cost entries",
    scope: "global",
    defaultValue: "BDT",
  });
}
