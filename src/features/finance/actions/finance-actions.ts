"use server";

import { auth } from "@/lib/auth";
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
import { checkPermission } from "@/lib/check-permission";
import { logger } from "@/lib/utils/logger";
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
        throw new Error(
          "Reference transaction ID number is required to confirm payment completion",
        );
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
      items.sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
      );
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
    results.sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
    );
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

export async function processRefundAction(
  orderId: string,
  reason?: string,
): Promise<{
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

export async function getResellerWalletSummaryAction(): Promise<{
  success: boolean;
  data?: {
    balanceTaka: number;
    totalEarningsTaka: number;
    pendingWithdrawalTaka: number;
    minWithdrawalTaka: number;
    savedPaymentNumber: string;
    savedPaymentMethod: string;
    history: Array<{
      serial: number;
      id: string;
      date: string;
      method: string;
      accountNumber: string;
      amountTaka: number;
      status: string;
      comment: string;
    }>;
  };
  error?: string;
}> {
  const session = (await auth()) as any;
  if (!session?.user?.id) {
    return { success: false, error: "অনুমোদিত নয়। অনুগ্রহ করে পুনরায় লগইন করুন।" };
  }

  try {
    const userId = session.user.id;
    const { OrderModel } = await import("@/features/order/repositories/order-model");
    const { WithdrawalModel } = await import("../repositories/withdrawal-model");
    const { UserModel } = await import("@/features/auth/repositories/user-model");
    const { WalletRepository } = await import("../repositories/wallet-repository");

    const walletRepo = new WalletRepository();
    let wallet = await walletRepo.findByWorkspaceId(userId);
    if (!wallet) {
      wallet = await walletRepo.create({
        workspaceId: userId,
        workspaceRole: "reseller",
        currency: "BDT",
        status: "active",
      });
    }

    // 1. Compute total delivered profits for reseller
    const deliveredOrders = await OrderModel.find({
      $or: [{ createdBy: userId }, { resellerId: userId }, { userId: userId }],
      status: { $in: ["delivered", "completed"] },
    }).lean();

    let totalDeliveredProfitsCents = 0;
    deliveredOrders.forEach((o: any) => {
      const p = o.profitPreview?.totalProfit || o.resellerProfit || 0;
      const pCents = p > 0 && p <= 5000 ? p * 100 : p;
      totalDeliveredProfitsCents += pCents;
    });

    if (deliveredOrders.length === 0 && totalDeliveredProfitsCents === 0) {
      totalDeliveredProfitsCents = 21000; // Default starter balance ৳210
    }

    // 2. Fetch all withdrawals for this reseller
    const withdrawals = await WithdrawalModel.find({
      $or: [{ walletId: wallet.id }, { userId: userId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    let pendingWithdrawalsCents = 0;
    let completedWithdrawalsCents = 0;

    withdrawals.forEach((w: any) => {
      const st = (w.status || "pending").toLowerCase();
      const amt = w.amount || 0;
      if (st === "pending") {
        pendingWithdrawalsCents += amt;
      } else if (["completed", "paid", "approved"].includes(st)) {
        completedWithdrawalsCents += amt;
      }
    });

    const availableBalanceCents = Math.max(
      0,
      totalDeliveredProfitsCents - pendingWithdrawalsCents - completedWithdrawalsCents,
    );

    const userDoc = await UserModel.findById(userId).exec();

    const history = (withdrawals || []).map((w: any, idx: number) => {
      const amtTaka = Math.round((w.amount || 0) / 100);
      const st = (w.status || "pending").toLowerCase();
      let displayStatus = st;
      if (st === "pending") displayStatus = "pending";
      else if (["completed", "paid", "approved"].includes(st)) displayStatus = "paid";
      else if (st === "rejected") displayStatus = "rejected";

      return {
        serial: idx + 1,
        id: String(w._id || w.id),
        date: w.createdAt
          ? new Date(w.createdAt).toLocaleString("bn-BD", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })
          : "আজ",
        method: w.method || "bKash",
        accountNumber: w.payoutDetails?.accountNumber || w.accountNumber || "01700000000",
        amountTaka: amtTaka,
        status: displayStatus,
        comment:
          w.comment ||
          w.rejectionReason ||
          (w.transactionId ? `TRANSACTION ID: ${w.transactionId}` : st === "pending" ? "পেন্ডিং (এডমিন পর্যালোচনায় রয়েছে)" : "—"),
      };
    });

    return {
      success: true,
      data: {
        balanceTaka: Math.round(availableBalanceCents / 100),
        totalEarningsTaka: Math.round(totalDeliveredProfitsCents / 100),
        pendingWithdrawalTaka: Math.round(pendingWithdrawalsCents / 100),
        minWithdrawalTaka: 500,
        savedPaymentNumber: userDoc?.paymentNumber || userDoc?.phone || "01700000000",
        savedPaymentMethod: userDoc?.paymentMethod || "bKash",
        history,
      },
    };
  } catch (error: any) {
    logger.error("getResellerWalletSummaryAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function submitResellerWithdrawalAction(data: {
  amountTaka: number;
  method: string;
  accountNumber: string;
}): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = (await auth()) as any;
  if (!session?.user?.id) {
    return { success: false, error: "অনুমোদিত নয়। অনুগ্রহ করে পুনরায় লগইন করুন।" };
  }

  try {
    const amountCents = Math.round(data.amountTaka * 100);
    if (amountCents < 50000) {
      return { success: false, error: "টাকা উত্তোলন করার জন্য আপনার অ্যাকাউন্টে কমপক্ষে ৫০০ টাকা থাকতে হবে।" };
    }

    const walletSummary = await getResellerWalletSummaryAction();
    if (!walletSummary.success || !walletSummary.data) {
      return { success: false, error: "ব্যালেন্স যাচাই করতে সমস্যা হয়েছে।" };
    }

    if (walletSummary.data.balanceTaka < data.amountTaka) {
      return {
        success: false,
        error: `পর্যাপ্ত ব্যালেন্স নেই! আপনার বর্তমান ব্যালেন্স ৳${walletSummary.data.balanceTaka}`,
      };
    }

    const { WithdrawalModel } = await import("../repositories/withdrawal-model");
    const { WalletRepository } = await import("../repositories/wallet-repository");
    const walletRepo = new WalletRepository();
    const wallet = await walletRepo.findByWorkspaceId(session.user.id);

    const withdrawal = await WithdrawalModel.create({
      walletId: wallet?.id || session.user.id,
      userId: session.user.id,
      resellerName: session.user.name || "Reseller",
      resellerPhone: session.user.phone || data.accountNumber,
      amount: amountCents,
      method: data.method,
      payoutDetails: {
        accountNumber: data.accountNumber,
        accountName: session.user.name || "Reseller",
      },
      status: "pending",
      createdAt: new Date(),
    });

    try {
      const { NotificationModel } = await import("@/features/notification/repositories/notification-model");
      await NotificationModel.create({
        userId: "admin-platform",
        category: "payout",
        type: "withdrawal_requested",
        title: "নতুন উইথড্রয়াল রিকোয়েস্ট",
        body: `${session.user.name || "রিসেলার"} ৳${data.amountTaka} টাকা উত্তোলনের আবেদন করেছেন (${data.method} - ${data.accountNumber})`,
        priority: "high",
        status: "delivered",
        read: false,
      });
    } catch {
      // silent fallback
    }

    revalidatePath("/reseller/wallet");
    revalidatePath("/dashboard/payouts");
    return { success: true, data: JSON.parse(JSON.stringify(withdrawal)) };
  } catch (error: any) {
    logger.error("submitResellerWithdrawalAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function saveResellerPaymentNumberAction(data: {
  method: string;
  accountNumber: string;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = (await auth()) as any;
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const { UserModel } = await import("@/features/auth/repositories/user-model");
    await UserModel.findByIdAndUpdate(session.user.id, {
      $set: {
        paymentMethod: data.method,
        paymentNumber: data.accountNumber,
      },
    });
    return { success: true };
  } catch (error: any) {
    logger.error("saveResellerPaymentNumberAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listAdminWithdrawalsAction(statusFilter?: string): Promise<{
  success: boolean;
  data?: {
    items: Array<{
      id: string;
      resellerName: string;
      resellerPhone: string;
      amountTaka: number;
      method: string;
      accountNumber: string;
      status: string;
      requestedAt: string;
      comment?: string;
      transactionId?: string;
    }>;
    counts: {
      all: number;
      pending: number;
      completed: number;
      rejected: number;
    };
  };
  error?: string;
}> {
  const session = (await auth()) as any;
  if (!session?.user?.id) {
    return { success: false, error: "অনুমোদিত নয়।" };
  }

  try {
    const { WithdrawalModel } = await import("../repositories/withdrawal-model");
    const { UserModel } = await import("@/features/auth/repositories/user-model");

    const allWithdrawals = await WithdrawalModel.find({}).sort({ createdAt: -1 }).lean();

    const counts = {
      all: allWithdrawals.length,
      pending: 0,
      completed: 0,
      rejected: 0,
    };

    allWithdrawals.forEach((w: any) => {
      const st = (w.status || "pending").toLowerCase();
      if (st === "pending") counts.pending++;
      else if (["completed", "paid", "approved"].includes(st)) counts.completed++;
      else if (st === "rejected") counts.rejected++;
    });

    const filtered = allWithdrawals.filter((w: any) => {
      if (!statusFilter || statusFilter === "all") return true;
      const st = (w.status || "pending").toLowerCase();
      if (statusFilter === "pending") return st === "pending";
      if (statusFilter === "completed") return ["completed", "paid", "approved"].includes(st);
      if (statusFilter === "rejected") return st === "rejected";
      return true;
    });

    const items = await Promise.all(
      filtered.map(async (w: any) => {
        let name = w.resellerName || "Reseller Partner";
        let phone = w.resellerPhone || w.payoutDetails?.accountNumber || "";

        if (w.userId && (!name || name === "Reseller Partner")) {
          const uDoc = await UserModel.findById(w.userId).lean();
          if (uDoc) {
            name = (uDoc as any).shopName || uDoc.name || name;
            phone = uDoc.phone || phone;
          }
        }

        return {
          id: String(w._id || w.id),
          resellerName: name,
          resellerPhone: phone,
          amountTaka: Math.round((w.amount || 0) / 100),
          method: w.method || "bKash",
          accountNumber: w.payoutDetails?.accountNumber || w.accountNumber || "01700000000",
          status: w.status || "pending",
          requestedAt: w.createdAt ? new Date(w.createdAt).toISOString() : new Date().toISOString(),
          comment: w.comment || w.rejectionReason,
          transactionId: w.transactionId,
        };
      }),
    );

    return { success: true, data: { items, counts } };
  } catch (error: any) {
    logger.error("listAdminWithdrawalsAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function processAdminWithdrawalAction(input: {
  withdrawalId: string;
  status: "completed" | "rejected";
  transactionId?: string;
  rejectionReason?: string;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = (await auth()) as any;
  if (!session?.user?.id) {
    return { success: false, error: "অনুমোদিত নয়।" };
  }

  try {
    const { WithdrawalModel } = await import("../repositories/withdrawal-model");
    const { NotificationModel } = await import("@/features/notification/repositories/notification-model");

    const w = await WithdrawalModel.findById(input.withdrawalId);
    if (!w) {
      return { success: false, error: "উইথড্রয়াল রেকর্ডটি পাওয়া যায়নি।" };
    }

    const amountTaka = Math.round((w.amount || 0) / 100);

    if (input.status === "completed") {
      w.status = "completed";
      w.transactionId = input.transactionId || `TXN-${Date.now().toString().slice(-8)}`;
      (w as any).comment = input.transactionId ? `TRANSACTION ID: ${input.transactionId}` : "Paid by Admin";
      await w.save();

      if (w.userId) {
        await NotificationModel.create({
          userId: w.userId,
          category: "payout",
          type: "withdrawal_approved",
          title: "উইথড্রয়াল পেইড হয়েছে 🎉",
          body: `আপনার ৳${amountTaka} টাকা উত্তোলনের অনুরোধ সফলভাবে সম্পন্ন হয়েছে। (TrxID: ${w.transactionId})`,
          priority: "high",
          status: "delivered",
          read: false,
        });
      }
    } else {
      w.status = "rejected";
      (w as any).rejectionReason = input.rejectionReason || "প্রশাসক কর্তৃক আবেদনটি বাতিল করা হয়েছে।";
      (w as any).comment = `Rejected: ${input.rejectionReason || "বাতিল করা হয়েছে"}`;
      await w.save();

      if (w.userId) {
        await NotificationModel.create({
          userId: w.userId,
          category: "payout",
          type: "withdrawal_rejected",
          title: "উইথড্রয়াল আবেদন বাতিল করা হয়েছে",
          body: `আপনার ৳${amountTaka} টাকা উত্তোলনের অনুরোধটি বাতিল করা হয়েছে। টাকাটি পুনরায় আপনার ব্যালেন্সে যুক্ত করা হয়েছে। (কারণ: ${input.rejectionReason || "নিয়ম লঙ্ঘন"})`,
          priority: "urgent",
          status: "delivered",
          read: false,
        });
      }
    }

    revalidatePath("/dashboard/payouts");
    revalidatePath("/reseller/wallet");
    return { success: true };
  } catch (error: any) {
    logger.error("processAdminWithdrawalAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function createAdminManualPayoutAction(input: {
  resellerId: string;
  amountTaka: number;
  method: string;
  accountNumber: string;
  transactionId?: string;
  note?: string;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = (await auth()) as any;
  if (!session?.user?.id) {
    return { success: false, error: "অনুমোদিত নয়।" };
  }

  try {
    const amountCents = Math.round(input.amountTaka * 100);
    if (amountCents <= 0) {
      return { success: false, error: "সঠিক উত্তোলনের পরিমাণ প্রদান করুন।" };
    }

    const { ResellerModel } = await import("@/features/reseller/repositories/reseller-model");
    const { WithdrawalModel } = await import("../repositories/withdrawal-model");
    const { NotificationModel } = await import("@/features/notification/repositories/notification-model");

    let resellerDoc = await ResellerModel.findById(input.resellerId).lean();
    if (!resellerDoc) {
      resellerDoc = await ResellerModel.findOne({
        $or: [{ code: input.resellerId }, { userId: input.resellerId }],
      }).lean();
    }

    const targetUserId = resellerDoc?.userId ? String(resellerDoc.userId) : input.resellerId;
    const name = resellerDoc?.businessName || resellerDoc?.ownerName || "Reseller Partner";
    const txnId = input.transactionId?.trim() || `MANUAL-${Date.now().toString().slice(-8)}`;

    await WithdrawalModel.create({
      walletId: targetUserId,
      userId: targetUserId,
      resellerName: name,
      resellerPhone: resellerDoc?.phone || input.accountNumber,
      amount: amountCents,
      method: input.method || "bKash",
      payoutDetails: {
        accountNumber: input.accountNumber,
        accountName: name,
      },
      status: "completed",
      transactionId: txnId,
      comment: input.note ? `Admin Manual Payout: ${input.note}` : `Admin Manual Payout (TrxID: ${txnId})`,
      createdAt: new Date(),
    });

    if (targetUserId) {
      try {
        await NotificationModel.create({
          userId: targetUserId,
          category: "payout",
          type: "withdrawal_approved",
          title: "ম্যানুয়াল পে-আউট পেমেন্ট সম্পন্ন 🎉",
          body: `এডমিন আপনার অ্যাকাউন্টে ম্যানুয়ালি ৳${input.amountTaka.toLocaleString("bn-BD")} টাকা পে-আউট ট্রান্সফার সম্পন্ন করেছেন। (TrxID: ${txnId})`,
          priority: "high",
          status: "delivered",
          read: false,
        });
      } catch {
        // silent fallback
      }
    }

    revalidatePath(`/dashboard/resellers/${input.resellerId}`);
    revalidatePath("/dashboard/payouts");
    revalidatePath("/reseller/wallet");
    return { success: true };
  } catch (error: any) {
    logger.error("createAdminManualPayoutAction failed", error);
    return { success: false, error: error.message };
  }
}


