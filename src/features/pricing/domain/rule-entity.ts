import { BaseDBEntity } from "@/shared/lib/database/types";

export type RuleEngineType =
  "reseller" | "wholesale" | "campaign" | "protection" | "visibility";

export type RuleOperator =
  "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "between";

export type RuleActionType =
  "reject" | "override" | "validate" | "transform";

export interface RuleCondition {
  field: string;
  operator: RuleOperator;
  value: unknown;
}

export interface RuleAction {
  type: RuleActionType;
  config: Record<string, unknown>;
}

export interface PricingRule extends Omit<BaseDBEntity, "metadata"> {
  name: string;
  description: string;
  ruleType: RuleEngineType;
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number;
  isActive: boolean;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

export interface RuleContext {
  productId: string;
  role: string;
  quantity?: number;
  customPrice?: number;
  currentPrice?: number;
  campaignCode?: string;
  currentDate?: Date;
}

export interface RuleResult {
  passed: boolean;
  ruleId: string;
  ruleName: string;
  actions: RuleAction[];
  errors?: string[];
}
