"use server";

import { auth } from "@/lib/auth";
import { ReconciliationService } from "../services/reconciliation-service";
import { FinancialClosingService } from "../services/financial-closing-service";
import { AccountingReportService } from "../services/accounting-report-service";
import { FailedTransactionService } from "../services/failed-transaction-service";
import { SnapshotRepository } from "../repositories/snapshot-repository";
import { FinancialReportRepository } from "../repositories/financial-report-repository";
import {
  pnlQuerySchema,
  reportGenerateSchema,
  dailyClosingSchema,
  monthlyClosingSchema,
  retryTransactionSchema,
} from "../types/validation";
import { checkPermission } from "@/lib/check-permission";
import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";

export async function runReconciliationAction(): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = (await auth()) as any;
  checkPermission(session, "Finance.Reconcile");

  try {
    const service = new ReconciliationService();
    const result = await service.runFullReconciliation(session.user.id);
    revalidatePath("/dashboard/finance");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("runReconciliationAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function getFinancialHealthAction(): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Finance.View");

  try {
    const service = new ReconciliationService();
    const result = await service.calculateFinancialHealth();
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("getFinancialHealthAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function performDailyClosingAction(formData: unknown = {}): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = (await auth()) as any;
  checkPermission(session, "Finance.Manage");

  try {
    const validated = dailyClosingSchema.parse(formData ?? {});
    const service = new FinancialClosingService();
    const result = await service.performDailyClosing(validated.snapshotDate, session.user.id);
    revalidatePath("/dashboard/finance");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("performDailyClosingAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function performMonthlyClosingAction(formData: unknown = {}): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = (await auth()) as any;
  checkPermission(session, "Finance.Manage");

  try {
    const validated = monthlyClosingSchema.parse(formData ?? {});
    const service = new FinancialClosingService();
    const result = await service.performMonthlyClosing(validated.monthKey, session.user.id);
    revalidatePath("/dashboard/finance");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("performMonthlyClosingAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function verifyOrderSettlementsAction(): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Finance.View");

  try {
    const service = new ReconciliationService();
    const result = await service.verifyOrderSettlements();
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("verifyOrderSettlementsAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function verifyLedgerIntegrityAction(): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Finance.View");

  try {
    const service = new ReconciliationService();
    const result = await service.verifyLedgerIntegrity();
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("verifyLedgerIntegrityAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function verifyWalletBalancesAction(): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Finance.View");

  try {
    const service = new ReconciliationService();
    const result = await service.verifyWalletBalances();
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("verifyWalletBalancesAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function getProfitAndLossAction(formData: unknown = {}): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Finance.View");

  try {
    const validated = pnlQuerySchema.parse(formData ?? {});
    const service = new AccountingReportService();
    const result = await service.getProfitAndLoss(
      validated.period,
      validated.startDate ? new Date(validated.startDate) : undefined,
      validated.endDate ? new Date(validated.endDate) : undefined,
    );
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("getProfitAndLossAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function getRevenueAnalysisAction(formData: unknown = {}): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Finance.View");

  try {
    const validated = pnlQuerySchema.parse(formData ?? {});
    const service = new AccountingReportService();
    const result = await service.getRevenueAnalysis(
      validated.period,
      validated.startDate ? new Date(validated.startDate) : undefined,
      validated.endDate ? new Date(validated.endDate) : undefined,
    );
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("getRevenueAnalysisAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function generateFinancialReportAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = (await auth()) as any;
  checkPermission(session, "Finance.Process");

  try {
    const validated = reportGenerateSchema.parse(formData);
    const service = new AccountingReportService();
    const result = await service.generateReport(
      validated.type,
      validated.period,
      validated.format,
      session.user.id,
    );
    revalidatePath("/dashboard/finance");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("generateFinancialReportAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listClosingSnapshotsAction(): Promise<{
  success: boolean;
  data?: { daily: any[]; monthly: any[] };
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Finance.View");

  try {
    const repo = new SnapshotRepository();
    const daily = await repo.listDailySnapshots();
    const monthly = await repo.listMonthlySnapshots();
    return { success: true, data: { daily, monthly } };
  } catch (error: any) {
    logger.error("listClosingSnapshotsAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listFailedTransactionsAction(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Finance.View");

  try {
    const service = new FailedTransactionService();
    const result = await service.listFailedTransactions();
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("listFailedTransactionsAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function retryFailedTransactionAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = (await auth()) as any;
  checkPermission(session, "Finance.Process");

  try {
    const validated = retryTransactionSchema.parse(formData);
    const service = new FailedTransactionService();
    const result = await service.retryFailedTransaction(
      validated.entityId,
      validated.type,
      session.user.id,
    );
    revalidatePath("/dashboard/finance");
    return { success: true, data: { retried: result } };
  } catch (error: any) {
    logger.error("retryFailedTransactionAction failed", error);
    return { success: false, error: error.message };
  }
}
