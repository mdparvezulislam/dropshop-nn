import { BaseDBEntity } from "@/shared/lib/database/types";

export type ReportType =
  | "pnl_summary"
  | "revenue_analysis"
  | "daily_report"
  | "weekly_report"
  | "monthly_report"
  | "settlement_report"
  | "ledger_report"
  | "wallet_report"
  | "adjustment_report";

export interface FinancialReport extends BaseDBEntity {
  referenceNumber: string; // e.g. RPT-2026-10001
  title: string;
  type: ReportType;
  startDate: Date;
  endDate: Date;
  summaryData: Record<string, unknown>;
  generatedBy: string;
  format: "csv" | "excel" | "pdf" | "json";
}

export interface ProfitAndLossReport {
  period: string; // Today, Yesterday, This Week, This Month, Custom
  startDate: Date;
  endDate: Date;
  grossRevenueCents: number;
  costOfGoodsSoldCents: number;
  grossProfitCents: number;
  operatingExpensesCents: number;
  refundLossCents: number;
  payoutFeesCents: number;
  netProfitCents: number;
}

export interface RevenueAnalysisReport {
  period: string;
  startDate: Date;
  endDate: Date;
  grossRevenueCents: number;
  netRevenueCents: number;
  totalProfitCents: number;
  refundLossCents: number;
  commissionCents: number;
  platformEarningsCents: number;
}
