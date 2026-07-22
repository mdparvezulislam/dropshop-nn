import { z } from "zod";

export const requestWithdrawalSchema = z.object({
  walletId: z.string().min(1, "Wallet ID is required"),
  amount: z.number().int().positive("Withdrawal amount must be a positive integer in cents"),
  method: z.enum(["bkash", "nagad", "rocket", "upay", "bank", "binance_pay", "manual"]),
  payoutDetails: z.object({
    accountNumber: z.string().min(1, "Account number is required"),
    accountName: z.string().optional(),
    bankName: z.string().optional(),
    branchName: z.string().optional(),
    routingNumber: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const transitionWithdrawalSchema = z.object({
  withdrawalId: z.string().min(1, "Withdrawal ID is required"),
  toStatus: z.enum(["under_review", "approved", "completed", "rejected", "cancelled", "hold"]),
  reason: z.string().optional(),
  referenceNumber: z.string().optional(),
  fee: z.number().int().nonnegative().optional(),
});

export const getWalletBalancesSchema = z.object({
  walletId: z.string().min(1, "Wallet ID is required"),
});

export const manualAdjustmentSchema = z.object({
  walletId: z.string().min(1, "Wallet ID is required"),
  amount: z.number().int().positive("Amount must be a positive integer in cents"),
  type: z.enum(["credit", "debit"]),
  reason: z.string().min(3, "Reason is required"),
  internalNote: z.string().optional(),
  allowNegativeBalance: z.boolean().optional().default(false),
});

export const createDepositSchema = z.object({
  walletId: z.string().min(1, "Wallet ID is required"),
  amount: z.number().int().positive("Deposit amount must be a positive integer in cents"),
  method: z.enum(["bkash", "nagad", "rocket", "upay", "bank", "manual", "admin_credit"]),
  paymentReference: z.string().optional(),
  receiptUrl: z.string().optional(),
  notes: z.string().optional(),
});

export const transitionDepositSchema = z.object({
  depositId: z.string().min(1, "Deposit ID is required"),
  action: z.enum(["approve", "reject"]),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export const ledgerFilterSchema = z.object({
  walletId: z.string().optional(),
  workspaceId: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  sourceModule: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(200).optional().default(50),
});

export const auditLogFilterSchema = z.object({
  walletId: z.string().optional(),
  actorId: z.string().optional(),
  action: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(200).optional().default(50),
});

export const pnlQuerySchema = z.object({
  period: z.enum(["Today", "Yesterday", "This Week", "This Month", "Custom"]).default("This Month"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const reportGenerateSchema = z.object({
  type: z.enum([
    "pnl_summary",
    "revenue_analysis",
    "daily_report",
    "weekly_report",
    "monthly_report",
    "settlement_report",
    "ledger_report",
    "wallet_report",
    "adjustment_report",
  ]),
  period: z.string().default("This Month"),
  format: z.enum(["csv", "excel", "pdf", "json"]).default("csv"),
});

export const dailyClosingSchema = z.object({
  snapshotDate: z.string().optional(),
});

export const monthlyClosingSchema = z.object({
  monthKey: z.string().optional(),
});

export const retryTransactionSchema = z.object({
  entityId: z.string().min(1, "Entity ID is required"),
  type: z.enum(["failed_settlement", "failed_withdrawal", "failed_deposit", "failed_refund"]),
});

export type RequestWithdrawalInput = z.infer<typeof requestWithdrawalSchema>;
export type TransitionWithdrawalInput = z.infer<typeof transitionWithdrawalSchema>;
export type GetWalletBalancesInput = z.infer<typeof getWalletBalancesSchema>;
export type ManualAdjustmentInput = z.infer<typeof manualAdjustmentSchema>;
export type CreateDepositInput = z.infer<typeof createDepositSchema>;
export type TransitionDepositInput = z.infer<typeof transitionDepositSchema>;
export type LedgerFilterInput = z.infer<typeof ledgerFilterSchema>;
export type AuditLogFilterInput = z.infer<typeof auditLogFilterSchema>;
export type PnlQueryInput = z.infer<typeof pnlQuerySchema>;
export type ReportGenerateInput = z.infer<typeof reportGenerateSchema>;
export type DailyClosingInput = z.infer<typeof dailyClosingSchema>;
export type MonthlyClosingInput = z.infer<typeof monthlyClosingSchema>;
export type RetryTransactionInput = z.infer<typeof retryTransactionSchema>;
