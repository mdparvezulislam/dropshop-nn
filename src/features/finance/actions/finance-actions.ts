"use server";

import { auth } from "@/shared/lib/auth";
import { WalletService } from "../services/wallet-service";
import { WithdrawalService } from "../services/withdrawal-service";
import { DepositService } from "../services/deposit-service";
import { AdjustmentService } from "../services/adjustment-service";
import { FinanceAnalyticsService } from "../services/finance-analytics-service";
import { FinanceService } from "../services/finance-service";
import { CommissionService } from "../services/commission-service";
import { LedgerRepository } from "../repositories/ledger-repository";
import { WithdrawalRepository } from "../repositories/withdrawal-repository";
import { DepositRepository } from "../repositories/deposit-repository";
import { FinanceAuditRepository } from "../repositories/finance-audit-repository";
import { InvoiceRepository } from "../repositories/invoice-repository";
import { WalletRepository } from "../repositories/wallet-repository";
import {
  requestWithdrawalSchema,
  transitionWithdrawalSchema,
  getWalletBalancesSchema,
  manualAdjustmentSchema,
  createDepositSchema,
  transitionDepositSchema,
  ledgerFilterSchema,
  auditLogFilterSchema,
} from "../types/validation";
import { checkPermission } from "@/shared/lib/check-permission";
import { logger } from "@/shared/utils/logger";
import { revalidatePath } from "next/cache";

export async function getFinanceDashboardSummaryAction(): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Finance.View");

  try {
    const service = new FinanceAnalyticsService();
    const result = await service.getDashboardSummary();
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("getFinanceDashboardSummaryAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function getOrCreateUserWalletAction(): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = (await auth()) as any;
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const service = new WalletService();
    const repo = new WalletRepository();

    const roleMapping: Record<string, "reseller" | "wholesaler" | "admin" | "supplier"> = {
      Reseller: "reseller",
      Wholesaler: "wholesaler",
      Supplier: "supplier",
      Admin: "admin",
      SuperAdmin: "admin",
    };

    const targetRole = roleMapping[session.user.role] ?? "reseller";

    let wallet = await repo.findByWorkspaceId(session.user.id);
    if (!wallet) {
      wallet = await service.createWallet(session.user.id, targetRole);
    }

    return { success: true, data: wallet };
  } catch (error: any) {
    logger.error("getOrCreateUserWalletAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function getWalletBalanceAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Finance.View");

  try {
    const validated = getWalletBalancesSchema.parse(formData);
    const service = new WalletService();
    const result = await service.getBalances(validated.walletId);
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("getWalletBalanceAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listWalletsAction(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Finance.View");

  try {
    const repo = new WalletRepository();
    const walletService = new WalletService();
    const wallets = await repo.listAllWallets();

    const enrichedWallets = await Promise.all(
      wallets.map(async (w) => {
        const balances = await walletService.getBalances(w.id);
        return {
          ...w,
          balances,
        };
      }),
    );

    return { success: true, data: enrichedWallets };
  } catch (error: any) {
    logger.error("listWalletsAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function manualAdjustmentAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = (await auth()) as any;
  checkPermission(session, "Finance.Manage");

  try {
    const validated = manualAdjustmentSchema.parse(formData);
    const service = new AdjustmentService();

    let result;
    if (validated.type === "credit") {
      result = await service.creditWallet({
        walletId: validated.walletId,
        amount: validated.amount,
        reason: validated.reason,
        internalNote: validated.internalNote,
        actorId: session.user.id,
        actorRole: session.user.role,
      });
    } else {
      result = await service.debitWallet({
        walletId: validated.walletId,
        amount: validated.amount,
        reason: validated.reason,
        internalNote: validated.internalNote,
        actorId: session.user.id,
        actorRole: session.user.role,
        allowNegativeBalance: validated.allowNegativeBalance,
      });
    }

    revalidatePath("/dashboard/wallet");
    revalidatePath("/dashboard/finance");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("manualAdjustmentAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function createDepositAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = (await auth()) as any;
  checkPermission(session, "Finance.Process");

  try {
    const validated = createDepositSchema.parse(formData);
    const service = new DepositService();
    const result = await service.createDepositRequest(
      validated.walletId,
      validated.amount,
      validated.method,
      validated.paymentReference,
      validated.receiptUrl,
      validated.notes,
      session.user.id,
    );

    revalidatePath("/dashboard/wallet");
    revalidatePath("/dashboard/finance");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("createDepositAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function transitionDepositAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = (await auth()) as any;
  checkPermission(session, "Finance.Reconcile");

  try {
    const validated = transitionDepositSchema.parse(formData);
    const service = new DepositService();
    let result;

    if (validated.action === "approve") {
      result = await service.approveDeposit(validated.depositId, session.user.id, validated.notes);
    } else {
      result = await service.rejectDeposit(
        validated.depositId,
        session.user.id,
        validated.reason ?? "Rejected by admin operations",
      );
    }

    revalidatePath("/dashboard/wallet");
    revalidatePath("/dashboard/finance");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("transitionDepositAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function requestWithdrawalAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = (await auth()) as any;
  checkPermission(session, "Finance.Process");

  try {
    const validated = requestWithdrawalSchema.parse(formData);
    const service = new WithdrawalService();
    const result = await service.requestWithdrawal(
      validated.walletId,
      validated.amount,
      validated.method,
      validated.payoutDetails,
      session.user.id,
    );
    revalidatePath("/dashboard/wallet");
    revalidatePath("/dashboard/finance");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("requestWithdrawalAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function transitionWithdrawalAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = (await auth()) as any;
  checkPermission(session, "Finance.Reconcile");

  try {
    const validated = transitionWithdrawalSchema.parse(formData);
    const service = new WithdrawalService();
    let result;

    if (
      validated.toStatus === "under_review" ||
      validated.toStatus === "approved" ||
      validated.toStatus === "hold"
    ) {
      result = await service.reviewWithdrawal(
        validated.withdrawalId,
        validated.toStatus,
        session.user.id,
      );
    } else if (validated.toStatus === "completed") {
      if (!validated.referenceNumber) {
        throw new Error("Reference transaction ID number is required to confirm payment completion");
      }
      result = await service.payWithdrawal(
        validated.withdrawalId,
        validated.referenceNumber,
        validated.fee ?? 0,
        session.user.id,
      );
    } else if (validated.toStatus === "rejected") {
      result = await service.rejectWithdrawal(
        validated.withdrawalId,
        session.user.id,
        validated.reason ?? "Rejected by admin operations",
      );
    } else if (validated.toStatus === "cancelled") {
      result = await service.cancelWithdrawal(validated.withdrawalId, session.user.id);
    }

    revalidatePath("/dashboard/wallet");
    revalidatePath("/dashboard/finance");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("transitionWithdrawalAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listLedgerEntriesAction(queryParams: unknown = {}): Promise<{
  success: boolean;
  data?: { items: any[]; total: number };
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Finance.View");

  try {
    const validated = ledgerFilterSchema.parse(queryParams ?? {});
    const repo = new LedgerRepository();
    const results = await repo.searchAndFilter({
      ...validated,
      startDate: validated.startDate ? new Date(validated.startDate) : undefined,
      endDate: validated.endDate ? new Date(validated.endDate) : undefined,
    });

    return { success: true, data: results };
  } catch (error: any) {
    logger.error("listLedgerEntriesAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listWithdrawalsAction(queryParams: unknown = {}): Promise<{
  success: boolean;
  data?: { items: any[]; total: number };
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Finance.View");

  try {
    const repo = new WithdrawalRepository();
    if (typeof queryParams === "string") {
      const items = await repo.findByWalletId(queryParams);
      items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      return { success: true, data: { items, total: items.length } };
    }

    const results = await repo.searchAndFilter((queryParams as any) ?? {});
    return { success: true, data: results };
  } catch (error: any) {
    logger.error("listWithdrawalsAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listDepositsAction(queryParams: unknown = {}): Promise<{
  success: boolean;
  data?: { items: any[]; total: number };
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Finance.View");

  try {
    const repo = new DepositRepository();
    const results = await repo.searchAndFilter((queryParams as any) ?? {});
    return { success: true, data: results };
  } catch (error: any) {
    logger.error("listDepositsAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listAuditLogsAction(queryParams: unknown = {}): Promise<{
  success: boolean;
  data?: { items: any[]; total: number };
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Finance.View");

  try {
    const validated = auditLogFilterSchema.parse(queryParams ?? {});
    const repo = new FinanceAuditRepository();
    const results = await repo.searchAndFilter(validated);
    return { success: true, data: results };
  } catch (error: any) {
    logger.error("listAuditLogsAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listInvoicesAction(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const session = (await auth()) as any;
  checkPermission(session, "Finance.View");

  try {
    const repo = new InvoiceRepository();
    const isReseller = session.user?.role === "Reseller";

    const query = isReseller ? { createdBy: session.user.id } : {};
    const results = await repo.find(query);
    results.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return { success: true, data: results };
  } catch (error: any) {
    logger.error("listInvoicesAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function settleOrderAction(orderId: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Finance.Reconcile");

  try {
    const { OrderRepository } = await import("@/features/order/repositories/order-repository");
    const orderRepo = new OrderRepository();
    const order = await orderRepo.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const service = new FinanceService();
    await service.releaseProfit(order);

    revalidatePath("/dashboard/finance");
    return { success: true, data: { settled: true, orderId } };
  } catch (error: any) {
    logger.error("settleOrderAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function processRefundAction(orderId: string, reason?: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Finance.Reconcile");

  try {
    const { OrderRepository } = await import("@/features/order/repositories/order-repository");
    const orderRepo = new OrderRepository();
    const order = await orderRepo.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const service = new FinanceService();
    await service.reverseProfit(order, reason);

    revalidatePath("/dashboard/finance");
    return { success: true, data: { refunded: true, orderId } };
  } catch (error: any) {
    logger.error("processRefundAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function calculateCommissionAction(params: {
  walletId: string;
  commissionType: "reseller" | "referral" | "platform";
  amount: number;
  orderId?: string;
  description?: string;
}): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = (await auth()) as any;
  checkPermission(session, "Finance.Manage");

  try {
    const service = new CommissionService();
    const result = await service.creditCommission({
      ...params,
      actorId: session.user.id,
    });

    revalidatePath("/dashboard/finance");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("calculateCommissionAction failed", error);
    return { success: false, error: error.message };
  }
}
