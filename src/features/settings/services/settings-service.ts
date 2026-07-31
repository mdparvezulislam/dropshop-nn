import { SettingRepository } from "../repositories/setting-repository";
import type { SettingEntry, SettingCategory } from "../domain/setting-entity";
import { logger } from "@/lib/utils/logger";
import { EventBus } from "@/lib/event-bus/event-bus";

// In-Memory Cache for fast synchronous lookups
const SETTING_CACHE = new Map<string, any>();

export const DEFAULT_PLATFORM_SETTINGS: Array<
  Omit<SettingEntry, "id" | "createdAt" | "updatedAt" | "isDeleted" | "status">
> = [
  // General & Localization
  {
    category: "general",
    key: "general.platform_name",
    value: "NN Enterprise",
    dataType: "string",
    name: "Platform Name",
    description: "Primary commerce platform name",
    scope: "global",
    defaultValue: "NN Enterprise",
    isPublic: true,
  },
  {
    category: "general",
    key: "general.company_name",
    value: "Dropshop Technology Ltd.",
    dataType: "string",
    name: "Company Name",
    description: "Legal operating entity name",
    scope: "global",
    defaultValue: "Dropshop Technology Ltd.",
    isPublic: true,
  },
  {
    category: "general",
    key: "general.tagline",
    value: "Enterprise Commerce Operating System",
    dataType: "string",
    name: "Tagline",
    description: "Brand motto",
    scope: "global",
    defaultValue: "Enterprise Commerce OS",
    isPublic: true,
  },
  {
    category: "general",
    key: "general.support_email",
    value: "support@nnenterprise.com.bd",
    dataType: "string",
    name: "Support Email",
    description: "Official support email address",
    scope: "global",
    defaultValue: "support@nnenterprise.com.bd",
    isPublic: true,
  },
  {
    category: "general",
    key: "general.support_phone",
    value: "+880 9610-000000",
    dataType: "string",
    name: "Support Phone",
    description: "Official hotline phone number",
    scope: "global",
    defaultValue: "+880 9610-000000",
    isPublic: true,
  },
  {
    category: "localization",
    key: "localization.timezone",
    value: "Asia/Dhaka",
    dataType: "string",
    name: "Default Timezone",
    description: "Platform operating timezone",
    scope: "global",
    defaultValue: "Asia/Dhaka",
    isPublic: true,
  },
  {
    category: "localization",
    key: "localization.currency",
    value: "BDT",
    dataType: "string",
    name: "Default Currency",
    description: "Primary transaction currency",
    scope: "global",
    defaultValue: "BDT",
    isPublic: true,
  },
  {
    category: "localization",
    key: "localization.currency_symbol",
    value: "৳",
    dataType: "string",
    name: "Currency Symbol",
    description: "Display currency symbol",
    scope: "global",
    defaultValue: "৳",
    isPublic: true,
  },

  // Branding
  {
    category: "branding",
    key: "branding.logo_url",
    value: "/assets/logo-light.svg",
    dataType: "string",
    name: "Company Logo",
    description: "Primary brand logo URL",
    scope: "global",
    defaultValue: "/assets/logo-light.svg",
    isPublic: true,
  },
  {
    category: "branding",
    key: "branding.dark_logo_url",
    value: "/assets/logo-dark.svg",
    dataType: "string",
    name: "Dark Theme Logo",
    description: "Logo for dark mode views",
    scope: "global",
    defaultValue: "/assets/logo-dark.svg",
    isPublic: true,
  },
  {
    category: "branding",
    key: "branding.primary_color",
    value: "#10B981",
    dataType: "string",
    name: "Brand Primary Color",
    description: "Main theme emerald color hex",
    scope: "global",
    defaultValue: "#10B981",
    isPublic: true,
  },

  // Business Rules & Tax
  {
    category: "business_rules",
    key: "business_rules.default_tax_rate_percent",
    value: 5,
    dataType: "number",
    name: "Default VAT/Tax %",
    description: "Standard government VAT rate",
    scope: "global",
    defaultValue: 5,
    isPublic: true,
  },
  {
    category: "business_rules",
    key: "business_rules.min_order_amount_cents",
    value: 10000,
    dataType: "number",
    name: "Minimum Order Amount (BDT)",
    description: "Minimum checkout order threshold",
    scope: "global",
    defaultValue: 10000,
    isPublic: true,
  },
  {
    category: "business_rules",
    key: "business_rules.default_weight_unit",
    value: "g",
    dataType: "string",
    name: "Default Weight Unit",
    description: "Standard mass measurement unit",
    scope: "global",
    defaultValue: "g",
    isPublic: true,
  },

  // Pricing
  {
    category: "pricing",
    key: "pricing.retail_markup_percent",
    value: 40,
    dataType: "number",
    name: "Retail Markup %",
    description: "Default retail tier profit margin %",
    scope: "global",
    defaultValue: 40,
    isPublic: false,
  },
  {
    category: "pricing",
    key: "pricing.reseller_markup_percent",
    value: 22,
    dataType: "number",
    name: "Reseller Markup %",
    description: "Default reseller margin %",
    scope: "global",
    defaultValue: 22,
    isPublic: false,
  },
  {
    category: "pricing",
    key: "pricing.wholesale_markup_percent",
    value: 30,
    dataType: "number",
    name: "Wholesale Markup %",
    description: "Default bulk tier margin %",
    scope: "global",
    defaultValue: 30,
    isPublic: false,
  },

  // Order
  {
    category: "order",
    key: "order.auto_confirm_orders",
    value: false,
    dataType: "boolean",
    name: "Auto Confirm Orders",
    description: "Automatically confirm incoming orders",
    scope: "global",
    defaultValue: false,
    isPublic: false,
  },
  {
    category: "order",
    key: "order.auto_cancel_hours",
    value: 24,
    dataType: "number",
    name: "Auto Cancel Hours",
    description: "Cancel unpaid order after N hours",
    scope: "global",
    defaultValue: 24,
    isPublic: false,
  },
  {
    category: "order",
    key: "order.order_prefix",
    value: "ORD-",
    dataType: "string",
    name: "Order Number Prefix",
    description: "Format prefix for order IDs",
    scope: "global",
    defaultValue: "ORD-",
    isPublic: false,
  },

  // Product & Inventory
  {
    category: "product",
    key: "product.max_images",
    value: 10,
    dataType: "number",
    name: "Max Product Images",
    description: "Maximum ImageKit asset uploads per product",
    scope: "global",
    defaultValue: 10,
    isPublic: true,
  },
  {
    category: "inventory",
    key: "inventory.low_stock_threshold",
    value: 10,
    dataType: "number",
    name: "Low Stock Threshold",
    description: "Warning limit for low inventory alert",
    scope: "global",
    defaultValue: 10,
    isPublic: false,
  },

  // Finance & Logistics
  {
    category: "finance",
    key: "finance.min_withdrawal_cents",
    value: 50000,
    dataType: "number",
    name: "Minimum Withdrawal (BDT)",
    description: "Minimum payout request threshold",
    scope: "global",
    defaultValue: 50000,
    isPublic: false,
  },
  {
    category: "logistics",
    key: "logistics.default_courier",
    value: "steadfast",
    dataType: "string",
    name: "Default Courier Provider",
    description: "Preferred default shipping partner",
    scope: "global",
    defaultValue: "steadfast",
    isPublic: false,
  },

  // Security & System Preferences
  {
    category: "security",
    key: "security.session_timeout_mins",
    value: 480,
    dataType: "number",
    name: "Session Timeout (Mins)",
    description: "User session inactivity expiry",
    scope: "global",
    defaultValue: 480,
    isPublic: false,
  },
  {
    category: "security",
    key: "security.login_attempt_limit",
    value: 5,
    dataType: "number",
    name: "Login Attempt Limit",
    description: "Max failed login attempts before lock",
    scope: "global",
    defaultValue: 5,
    isPublic: false,
  },
];

export class SettingsService {
  private readonly repository: SettingRepository;

  constructor() {
    this.repository = new SettingRepository();
  }

  async getValue<T = any>(key: string, defaultValue?: T): Promise<T> {
    if (SETTING_CACHE.has(key)) {
      return SETTING_CACHE.get(key);
    }

    const setting = await this.repository.findByKey(key);
    if (setting) {
      SETTING_CACHE.set(key, setting.value);
      return setting.value as T;
    }

    const defaultDef = DEFAULT_PLATFORM_SETTINGS.find((s) => s.key === key);
    const val = defaultDef ? defaultDef.value : defaultValue;
    if (val !== undefined) {
      SETTING_CACHE.set(key, val);
    }
    return val as T;
  }

  async setSetting(
    key: string,
    value: any,
    changedBy: string = "system",
    reason?: string,
  ): Promise<SettingEntry> {
    const existing = await this.repository.findByKey(key);
    const oldValue = existing ? existing.value : undefined;

    const defaultDef = DEFAULT_PLATFORM_SETTINGS.find((s) => s.key === key);
    const category = existing?.category || defaultDef?.category || "general";
    const name = existing?.name || defaultDef?.name || key;
    const description = existing?.description || defaultDef?.description || "";
    const dataType = existing?.dataType || defaultDef?.dataType || typeof value;

    const updated = await this.repository.upsertSetting({
      key,
      value,
      category: category as SettingCategory,
      name,
      description,
      dataType: dataType as any,
      scope: "global",
    });

    SETTING_CACHE.set(key, value);

    await this.repository.createAuditLog({
      settingKey: key,
      category: category as SettingCategory,
      oldValue,
      newValue: value,
      changedBy,
      timestamp: new Date(),
      reason: reason || `Updated ${name}`,
    });

    await EventBus.publish(
      "settings.updated",
      { key, oldValue, newValue: value, changedBy },
      { source: "settings-service" },
    );

    logger.info("SettingsService: updated setting", { key, value, changedBy });
    return updated;
  }

  async listSettings(): Promise<SettingEntry[]> {
    const dbSettings = await this.repository.listAllSettings();
    if (dbSettings.length === 0) {
      // Bootstrap default settings into DB
      for (const def of DEFAULT_PLATFORM_SETTINGS) {
        await this.repository.upsertSetting(def as any);
        SETTING_CACHE.set(def.key, def.value);
      }
      return this.repository.listAllSettings();
    }
    return dbSettings;
  }

  async resetCategoryToDefault(
    category: SettingCategory,
    changedBy: string = "system",
  ): Promise<void> {
    const categoryDefaults = DEFAULT_PLATFORM_SETTINGS.filter((s) => s.category === category);
    for (const def of categoryDefaults) {
      await this.setSetting(def.key, def.value, changedBy, `Reset ${category} settings to default`);
    }
  }
}

export default SettingsService;
