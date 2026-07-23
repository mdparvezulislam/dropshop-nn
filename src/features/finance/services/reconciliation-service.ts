import { WalletRepository } from "../repositories/wallet-repository";
import { LedgerRepository } from "../repositories/ledger-repository";
import { ReconciliationRepository } from "../repositories/reconciliation-repository";
import { FinanceAuditRepository } from "../repositories/finance-audit-repository";
import { WalletService } from "./wallet-service";
import type {
  FinancialHealthScore,
  LedgerVerificationResult,
  SettlementVerificationResult,
  ReconciliationLog,
} from "../domain/reconciliation-entity";
import { logger } from "@/lib/utils/logger";
import { EventBus } from "@/lib/event-bus/event-bus";
import { runInTransaction } from "@/lib/database/query-builder";

export class ReconciliationService {
  private readonly walletRepository: WalletRepository;
  private readonly ledgerRepository: LedgerRepository;
  private readonly reconciliationRepository: ReconciliationRepository;
  private readonly financeAuditRepository: FinanceAuditRepository;
  private readonly walletService: WalletService;

  constructor() {
    this.walletRepository = new WalletRepository();
    this.ledgerRepository = new LedgerRepository();
    this.reconciliationRepository = new ReconciliationRepository();
    this.financeAuditRepository = new FinanceAuditRepository();
    this.walletService = new WalletService();
  }

  async verifyWalletBalances(): Promise<ReconciliationLog[]> {
    const wallets = await this.walletRepository.listAllWallets();
    const logs: ReconciliationLog[] = [];

    for (const w of wallets) {
      const balances = await this.walletService.getBalances(w.id);
      const entries = await this.ledgerRepository.findByWalletId(w.id);

      let computedCleared = 0;
      for (const entry of entries) {
        if (entry.status === "cleared") {
          computedCleared += entry.amount;
        }
      }

      const diff = balances.availableBalance - computedCleared;
      const status = diff === 0 ? "matched" : "mismatch";

      const refNum = `REC-WAL-${Math.floor(100000 + Math.random() * 900000)}`;

      const log = await this.reconciliationRepository.create({
        referenceNumber: refNum,
        type: "wallet_balance",
        status,
        walletId: w.id,
        walletBalanceCents: balances.availableBalance,
        computedLedgerBalanceCents: computedCleared,
        differenceCents: diff,
        notes: status === "matched" ? "Wallet available balance equals cleared ledger sum" : `Mismatch detected: diff ${diff} cents`,
        reconciledBy: "system",
        reconciledAt: new Date(),
      });

      if (status !== "matched") {
        await EventBus.publish(
          "finance.ledger_mismatch",
          { walletId: w.id, differenceCents: diff, referenceNumber: refNum },
          { source: "reconciliation" },
        );
      }

      logs.push(log);
    }

    return logs;
  }

  async verifyLedgerIntegrity(): Promise<LedgerVerificationResult> {
    const entries = await this.ledgerRepository.find({});
    const brokenReferences: LedgerVerificationResult["brokenReferences"] = [];
    const seenRefs = new Set<string>();
    let duplicateLedgerEntries = 0;
    let invalidTransactions = 0;

    for (const entry of entries) {
      if (entry.referenceNumber) {
        if (seenRefs.has(entry.referenceNumber)) {
          duplicateLedgerEntries++;
        } else {
          seenRefs.add(entry.referenceNumber);
        }
      }

      // Check required references
      if (entry.referenceType && !entry.referenceId) {
        brokenReferences.push({
          ledgerId: entry.id,
          referenceNumber: entry.referenceNumber,
          referenceType: entry.referenceType,
          referenceId: entry.referenceId,
          reason: "Missing reference ID",
        });
      }

      if (isNaN(entry.amount)) {
        invalidTransactions++;
      }
    }

    return {
      totalLedgerEntries: entries.length,
      missingLedgerEntries: 0,
      duplicateLedgerEntries,
      brokenReferences,
      invalidTransactions,
    };
  }

  async verifyOrderSettlements(): Promise<SettlementVerificationResult> {
    const { OrderRepository } = await import("@/features/order/repositories/order-repository");
    const orderRepo = new OrderRepository();

    const completedOrders = await orderRepo.find({ status: "completed" });
    const profitLedgerEntries = await this.ledgerRepository.find({ type: "profit_credit" });

    const settledOrderIds = new Set<string>();
    let duplicateSettlementsCount = 0;

    for (const entry of profitLedgerEntries) {
      if (entry.orderId) {
        if (settledOrderIds.has(entry.orderId)) {
          duplicateSettlementsCount++;
        } else {
          settledOrderIds.add(entry.orderId);
        }
      }
    }

    const missingSettlementOrders: string[] = [];
    for (const order of completedOrders) {
      const profit = order.profitPreview?.totalProfit ?? 0;
      if (profit > 0 && !settledOrderIds.has(order.id)) {
        missingSettlementOrders.push(order.id);
      }
    }

    return {
      totalCompletedOrders: completedOrders.length,
      settledOrdersCount: settledOrderIds.size,
      pendingSettlementCount: missingSettlementOrders.length,
      duplicateSettlementsCount,
      missingSettlementOrders,
    };
  }

  async calculateFinancialHealth(): Promise<FinancialHealthScore> {
    const walletLogs = await this.verifyWalletBalances();
    const ledgerResult = await this.verifyLedgerIntegrity();
    const settlementResult = await this.verifyOrderSettlements();

    const walletMismatchCount = walletLogs.filter((l) => l.status === "mismatch").length;
    const isWalletIntegrity = walletMismatchCount === 0;
    const isLedgerIntegrity = ledgerResult.brokenReferences.length === 0 && ledgerResult.duplicateLedgerEntries === 0;
    const isSettlementIntegrity = settlementResult.missingSettlementOrders.length === 0 && settlementResult.duplicateSettlementsCount === 0;

    let score = 100;
    score -= walletMismatchCount * 15;
    score -= ledgerResult.brokenReferences.length * 10;
    score -= ledgerResult.duplicateLedgerEntries * 10;
    score -= settlementResult.missingSettlementOrders.length * 5;
    score -= settlementResult.duplicateSettlementsCount * 10;
    score = Math.max(0, Math.min(100, score));

    let rating: FinancialHealthScore["rating"] = "Excellent";
    if (score < 50) rating = "Critical";
    else if (score < 75) rating = "Fair";
    else if (score < 90) rating = "Good";

    const checkSummary: string[] = [];
    if (isWalletIntegrity) checkSummary.push("✓ All wallet balances match computed ledger entries");
    else checkSummary.push(`⚠ ${walletMismatchCount} wallet balance mismatches detected`);

    if (isLedgerIntegrity) checkSummary.push("✓ Ledger entries structure and references intact");
    else checkSummary.push(`⚠ ${ledgerResult.brokenReferences.length} broken references found in ledger`);

    if (isSettlementIntegrity) checkSummary.push("✓ All completed order profit settlements reconciled");
    else checkSummary.push(`⚠ ${settlementResult.missingSettlementOrders.length} completed orders pending settlement`);

    if (score < 75) {
      await EventBus.publish(
        "finance.financial_health_warning",
        { score, rating, checkSummary },
        { source: "reconciliation" },
      );
    }

    return {
      score,
      rating,
      ledgerIntegrity: isLedgerIntegrity,
      walletIntegrity: isWalletIntegrity,
      settlementIntegrity: isSettlementIntegrity,
      duplicateTransactionsCount: ledgerResult.duplicateLedgerEntries + settlementResult.duplicateSettlementsCount,
      pendingErrorCount: walletMismatchCount + ledgerResult.brokenReferences.length,
      unreconciledCount: walletMismatchCount + settlementResult.missingSettlementOrders.length,
      lastCheckedAt: new Date(),
      checkSummary,
    };
  }

  async runFullReconciliation(actorId: string = "system"): Promise<FinancialHealthScore> {
    const health = await this.calculateFinancialHealth();

    const refNum = `REC-FULL-${Math.floor(100000 + Math.random() * 900000)}`;
    await this.reconciliationRepository.create({
      referenceNumber: refNum,
      type: "full_system",
      status: health.score === 100 ? "matched" : health.score >= 75 ? "warning" : "mismatch",
      notes: `Full system reconciliation executed. Score: ${health.score}/100 (${health.rating})`,
      details: { health },
      reconciledBy: actorId,
      reconciledAt: new Date(),
    });

    await this.financeAuditRepository.create({
      referenceNumber: refNum,
      action: "manual_adjustment",
      walletId: "platform",
      actorId,
      amount: 0,
      oldBalance: 0,
      newBalance: 0,
      currency: "BDT",
      reason: `Executed full system financial reconciliation. Health score: ${health.score}/100`,
    });

    logger.info("ReconciliationService: full system reconciliation complete", {
      score: health.score,
      rating: health.rating,
      actorId,
    });

    return health;
  }
}

export default ReconciliationService;
