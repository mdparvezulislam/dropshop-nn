import { BaseDBEntity } from "@/lib/database/types";

export type SettingCategory =
  | "general"
  | "localization"
  | "branding"
  | "business_rules"
  | "pricing"
  | "order"
  | "product"
  | "inventory"
  | "finance"
  | "logistics"
  | "notification"
  | "security"
  | "feature_flags"
  | "maintenance"
  | "preferences"
  | "storage"
  | "payment"
  | "courier"
  | "seo"
  | "email"
  | "api";

export type FeatureFlagState = "on" | "off" | "beta" | "internal" | "experimental";

export interface SettingEntry extends BaseDBEntity {
  category: SettingCategory;
  key: string;
  value: unknown;
  dataType: "string" | "number" | "boolean" | "json" | "array";
  name: string;
  description: string;
  scope: "global" | "workspace" | "role" | "user";
  defaultValue: unknown;
  isPublic: boolean;
}

export interface FeatureFlagEntry extends BaseDBEntity {
  key: string;
  name: string;
  description: string;
  state: FeatureFlagState;
  allowedRoles?: string[];
  isExperimental?: boolean;
}

export interface MaintenanceModeConfig {
  enabled: boolean;
  message: string;
  allowedRoles: string[];
  whitelistedIPs: string[];
  updatedAt?: Date;
  updatedBy?: string;
}

export interface SettingAuditLog extends BaseDBEntity {
  settingKey: string;
  category: SettingCategory;
  oldValue: unknown;
  newValue: unknown;
  changedBy: string;
  timestamp: Date;
  reason?: string;
}

export interface SystemHealthStatus {
  database: "healthy" | "degraded" | "down";
  redis: "healthy" | "degraded" | "down";
  storage: "healthy" | "degraded" | "down";
  queue: "healthy" | "degraded" | "down";
  scheduler: "healthy" | "degraded" | "down";
  uptimeSeconds: number;
  lastCheckedAt: Date;
}
