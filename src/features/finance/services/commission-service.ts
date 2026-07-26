import { WalletRepository } from "../repositories/wallet-repository";
import { LedgerRepository } from "../repositories/ledger-repository";
import { FinanceAuditRepository } from "../repositories/finance-audit-repository";
import { WalletService } from "./wallet-service";
import type { LedgerEntry } from "../domain/ledger-entity";
import { logger } from "@/lib/utils/logger";
import { EventBus } from "@/lib/event-bus/event-bus";
import { runInTransaction } from "@/lib/database/query-builder";

export interface CommissionCalculationParams {
  walletId: string;
  commissionType: "reseller" | "referral" | "platform";
  amount: number; // in integer cents
  orderId?: string;
  description?: string;
  actorId?: string;
}

export class CommissionService {
  private readonly walletRepository: WalletRepository;
  private readonly ledgerRepository: LedgerRepository;
  private readonly financeAuditRepository: FinanceAuditRepository;
  private readonly walletService: WalletService;

  constructor() {
    this.walletRepository = new WalletRepository();
    this.ledgerRepository = new LedgerRepository();
    this.financeAuditRepository = new FinanceAuditRepository();
    this.walletService = new WalletService();
  }

  async creditCommission(params: CommissionCalculationParams): Promise<LedgerEntry> {
    if (params.amount <= 0) {
      throw new Error("Commission amount must be greater than zero");
    }

    return runInTransaction(async (session) => {
      const wallet = await this.walletRepository.findById(params.walletId, { session });
      if (!wallet) {
        throw new Error(`Commission recipient wallet not found: ${params.walletId}`);
      }

      const balancesBefore = await this.walletService.getBalances(params.walletId);
      const refNum = `REF-LED-COMM-${Math.floor(100000 + Math.random() * 900000)}`;

      const entry = await this.ledgerRepository.create(
        {
          referenceNumber: refNum,
          walletId: params.walletId,
          workspaceId: wallet.workspaceId,
          amount: params.amount,
          currency: wallet.currency ?? "BDT",
          type: "commission",
          status: "cleared",
          sourceModule: "commission",
          referenceType: params.orderId ? "order" : "manual",
          referenceId: params.orderId,
          orderId: params.orderId,
          description:
            params.description ?? `${params.commissionType.toUpperCase()} Commission payout`,
          createdBy: params.actorId ?? "system",
          metadata: {
            commissionType: params.commissionType,
            orderId: params.orderId,
          },
        },
        { session },
      );

      // Audit Log
      await this.financeAuditRepository.create(
        {
          referenceNumber: refNum,
          action: "commission_paid",
          walletId: params.walletId,
          actorId: params.actorId ?? "system",
          amount: params.amount,
          oldBalance: balancesBefore.availableBalance,
          newBalance: balancesBefore.availableBalance + params.amount,
          currency: wallet.currency ?? "BDT",
          reason: `${params.commissionType.toUpperCase()} commission credit of ৳${(params.amount / 100).toFixed(2)}`,
        },
        { session },
      );

      await EventBus.publish(
        "finance.commission_paid",
        {
          ledgerEntryId: entry.id,
          referenceNumber: refNum,
          walletId: params.walletId,
          amount: params.amount,
          commissionType: params.commissionType,
          orderId: params.orderId,
        },
        { source: "finance" },
      );

      logger.info("CommissionService: commission credited successfully", {
        walletId: params.walletId,
        amount: params.amount,
        commissionType: params.commissionType,
      });

      return entry;
    });
  }
}

export default CommissionService;
