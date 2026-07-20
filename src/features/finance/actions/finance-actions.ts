"use server";

import { auth } from "@/shared/lib/auth";
import { WalletService } from "../services/wallet-service";
import { WithdrawalService } from "../services/withdrawal-service";
import { LedgerRepository } from "../repositories/ledger-repository";
import { WithdrawalRepository } from "../repositories/withdrawal-repository";
import { InvoiceRepository } from "../repositories/invoice-repository";
import { WalletRepository } from "../repositories/wallet-repository";
import {
  requestWithdrawalSchema,
  transitionWithdrawalSchema,
  getWalletBalancesSchema,
} from "../types/validation";
import { ForbiddenError, UnauthorizedError } from "@/shared/errors/app-error";
import { logger } from "@/shared/utils/logger";
import { revalidatePath } from "next/cache";

function checkPermission(
  session: { user?: { permissions?: string[]; email?: string | null; id?: string } } | null,
  permission: string,
): void {
  if (!session) {
    throw new UnauthorizedError("Session expired or invalid");
  }
  const permissions = session.user?.permissions || [];
  if (!permissions.includes("*") && !permissions.includes(permission)) {
    throw new ForbiddenError(`Missing required permission: ${permission}`);
  }
}

export async function getOrCreateUserWalletAction(): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth() as any;
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const service = new WalletService();
    const repo = new WalletRepository();
    
    // Check if wallet exists
    let wallet = await repo.findByWorkspaceId(session.user.id);
    if (!wallet) {
      wallet = await service.createWallet(session.user.id, session.user.role === "Reseller" ? "reseller" : "admin");
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

export async function requestWithdrawalAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Finance.Process");

  try {
    const validated = requestWithdrawalSchema.parse(formData);
    const service = new WithdrawalService();
    const result = await service.requestWithdrawal(
      validated.walletId,
      validated.amount,
      validated.method,
      validated.payoutDetails,
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
  const session = await auth() as any;
  checkPermission(session, "Finance.Reconcile");

  try {
    const validated = transitionWithdrawalSchema.parse(formData);
    const service = new WithdrawalService();
    let result;

    if (validated.toStatus === "under_review" || validated.toStatus === "approved") {
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
      result = await service.cancelWithdrawal(validated.withdrawalId);
    }

    revalidatePath("/dashboard/wallet");
    revalidatePath("/dashboard/finance");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("transitionWithdrawalAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listLedgerEntriesAction(walletId?: string): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Finance.View");

  try {
    const repo = new LedgerRepository();
    const query = walletId ? { walletId } : {};
    const results = await repo.find(query);
    results.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return { success: true, data: results };
  } catch (error: any) {
    logger.error("listLedgerEntriesAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listWithdrawalsAction(walletId?: string): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Finance.View");

  try {
    const repo = new WithdrawalRepository();
    const query = walletId ? { walletId } : {};
    const results = await repo.find(query);
    results.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return { success: true, data: results };
  } catch (error: any) {
    logger.error("listWithdrawalsAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listInvoicesAction(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const session = await auth() as any;
  checkPermission(session, "Finance.View");

  try {
    const repo = new InvoiceRepository();
    const isReseller = session.user?.role === "Reseller";
    
    // Resellers only view their own invoices (where they are createdBy or related to their resellerId order)
    const query = isReseller ? { createdBy: session.user.id } : {};
    const results = await repo.find(query);
    results.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return { success: true, data: results };
  } catch (error: any) {
    logger.error("listInvoicesAction failed", error);
    return { success: false, error: error.message };
  }
}
