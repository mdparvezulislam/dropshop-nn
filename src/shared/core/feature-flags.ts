import type { CurrencyCode } from "./types";

export type FeatureFlagState = "on" | "off" | "partial";

export interface FeatureFlagDefinition {
  key: string;
  name: string;
  description: string;
  defaultState: FeatureFlagState;
  roles?: string[];
}

const FEATURE_FLAGS = new Map<string, FeatureFlagDefinition>();

export class FeatureFlags {
  static register(definition: FeatureFlagDefinition): void {
    if (FEATURE_FLAGS.has(definition.key)) {
      throw new Error(`Feature flag "${definition.key}" is already registered`);
    }
    FEATURE_FLAGS.set(definition.key, definition);
  }

  static isEnabled(key: string, role?: string): boolean {
    const def = FEATURE_FLAGS.get(key);
    if (!def) return false;

    if (def.roles && role && !def.roles.includes(role)) return false;

    return def.defaultState === "on" || def.defaultState === "partial";
  }

  static getAll(): FeatureFlagDefinition[] {
    return Array.from(FEATURE_FLAGS.values());
  }

  static isRegistered(key: string): boolean {
    return FEATURE_FLAGS.has(key);
  }

  static setState(key: string, state: FeatureFlagState): void {
    const def = FEATURE_FLAGS.get(key);
    if (!def) throw new Error(`Feature flag "${key}" not found`);
    def.defaultState = state;
  }

  static clear(): void {
    FEATURE_FLAGS.clear();
  }
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlagDefinition[] = [
  {
    key: "customer-module",
    name: "Customer Module",
    description: "Customer registration, profiles, cart",
    defaultState: "off",
  },
  {
    key: "order-management",
    name: "Order Management",
    description: "Order lifecycle, fulfillment, returns",
    defaultState: "off",
  },
  {
    key: "courier-integration",
    name: "Courier Integration",
    description: "Multi-courier dispatch and tracking",
    defaultState: "off",
  },
  {
    key: "payment-gateway",
    name: "Payment Gateway",
    description: "bKash, Nagad, SSLCommerz",
    defaultState: "off",
  },
  {
    key: "wallet-system",
    name: "Wallet System",
    description: "Digital wallet, payouts, ledger",
    defaultState: "off",
  },
  {
    key: "invoice-system",
    name: "Invoice System",
    description: "Automated invoice generation",
    defaultState: "off",
  },
  {
    key: "multi-warehouse",
    name: "Multi-Warehouse",
    description: "WMS with warehouse transfers",
    defaultState: "off",
  },
  {
    key: "analytics-engine",
    name: "Analytics Engine",
    description: "Advanced analytics and dashboards",
    defaultState: "off",
  },
  {
    key: "reseller-portal",
    name: "Reseller Portal",
    description: "Self-service reseller portal",
    defaultState: "on",
  },
  {
    key: "supplier-portal",
    name: "Supplier Portal",
    description: "Self-service supplier portal",
    defaultState: "on",
  },
];

export type SettingScope = "global" | "business" | "role" | "user";

export interface SettingDefinition<T = unknown> {
  key: string;
  name: string;
  description: string;
  scope: SettingScope;
  defaultValue: T;
  options?: T[];
}

const SETTINGS = new Map<string, SettingDefinition>();

export class Settings {
  static register<T>(definition: SettingDefinition<T>): void {
    if (SETTINGS.has(definition.key)) {
      throw new Error(`Setting "${definition.key}" is already registered`);
    }
    SETTINGS.set(definition.key, definition as SettingDefinition);
  }

  static get<T>(key: string): T | undefined {
    const def = SETTINGS.get(key) as SettingDefinition<T> | undefined;
    return def?.defaultValue;
  }

  static getAll(): SettingDefinition[] {
    return Array.from(SETTINGS.values());
  }

  static isRegistered(key: string): boolean {
    return SETTINGS.has(key);
  }

  static clear(): void {
    SETTINGS.clear();
  }
}

export const DEFAULT_SETTINGS: SettingDefinition[] = [
  {
    key: "pricing.default-currency",
    name: "Default Currency",
    description: "Default currency for new pricing",
    scope: "global",
    defaultValue: "BDT" as CurrencyCode,
    options: ["BDT", "USD"],
  },
  {
    key: "pricing.default-tax-rate",
    name: "Default Tax Rate",
    description: "Default VAT/tax rate percentage",
    scope: "global",
    defaultValue: 5,
  },
  {
    key: "pricing.default-commission-rate",
    name: "Default Commission Rate",
    description: "Default platform commission percentage",
    scope: "global",
    defaultValue: 10,
  },
  {
    key: "inventory.low-stock-threshold",
    name: "Low Stock Threshold",
    description: "Default low stock warning level",
    scope: "global",
    defaultValue: 10,
  },
  {
    key: "inventory.safety-stock",
    name: "Safety Stock Level",
    description: "Default safety stock buffer",
    scope: "global",
    defaultValue: 5,
  },
  {
    key: "reseller.auto-approve",
    name: "Auto Approve Reseller",
    description: "Automatically approve reseller registrations",
    scope: "global",
    defaultValue: false,
  },
  {
    key: "wholesaler.auto-approve",
    name: "Auto Approve Wholesaler",
    description: "Automatically approve wholesaler registrations",
    scope: "global",
    defaultValue: false,
  },
  {
    key: "supplier.auto-approve",
    name: "Auto Approve Supplier",
    description: "Automatically approve supplier registrations",
    scope: "global",
    defaultValue: false,
  },
  {
    key: "notifications.email-enabled",
    name: "Email Notifications",
    description: "Enable email notification channel",
    scope: "global",
    defaultValue: true,
  },
  {
    key: "notifications.sms-enabled",
    name: "SMS Notifications",
    description: "Enable SMS notification channel",
    scope: "global",
    defaultValue: false,
  },
  {
    key: "business.minimum-payout",
    name: "Minimum Payout",
    description: "Minimum payout amount in cents",
    scope: "global",
    defaultValue: 50000,
  },
  {
    key: "order.cod-enabled",
    name: "COD Enabled",
    description: "Enable Cash on Delivery",
    scope: "global",
    defaultValue: true,
  },
  {
    key: "order.auto-cancel-hours",
    name: "Auto Cancel Hours",
    description: "Auto-cancel unpaid orders after N hours",
    scope: "global",
    defaultValue: 24,
  },
];
