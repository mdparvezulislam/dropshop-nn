import { BaseDBEntity } from "@/shared/lib/database/types";

export type RiskLevel = "low" | "medium" | "high" | "critical";
export type RiskCategory =
  | "frequent_returns"
  | "cod_refusal"
  | "fake_order"
  | "multiple_cancellations"
  | "duplicate_order"
  | "suspicious_activity";

export interface OrderRiskFlag extends BaseDBEntity {
  orderId: string;
  orderNumber: string;
  riskLevel: RiskLevel;
  category: RiskCategory;
  reason: string;
  confidence: number;
  detectedBy: "system" | "manual";
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
}

export const RISK_WEIGHTS: Record<RiskCategory, number> = {
  frequent_returns: 30,
  cod_refusal: 40,
  fake_order: 50,
  multiple_cancellations: 25,
  duplicate_order: 35,
  suspicious_activity: 45,
};

export function calculateRiskLevel(score: number): RiskLevel {
  if (score >= 70) return "critical";
  if (score >= 40) return "high";
  if (score >= 20) return "medium";
  return "low";
}
