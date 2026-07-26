import { LedgerRepository } from "../repositories/ledger-repository";
import { WalletRepository } from "../repositories/wallet-repository";
import { SnapshotRepository } from "../repositories/snapshot-repository";
import { FinanceAuditRepository } from "../repositories/finance-audit-repository";
import type { DailySnapshot, MonthlySnapshot } from "../domain/closing-snapshot-entity";
import { logger } from "@/lib/utils/logger";
import { EventBus } from "@/lib/event-bus/event-bus";
import { runInTransaction } from "@/lib/database/query-builder";

export class FinancialClosingService {
  private readonly ledgerRepository: LedgerRepository;
  private readonly walletRepository: WalletRepository;
  private readonly snapshotRepository: SnapshotRepository;
  private readonly financeAuditRepository: FinanceAuditRepository;

  constructor() {
    this.ledgerRepository = new LedgerRepository();
    this.walletRepository = new WalletRepository();
    this.snapshotRepository = new SnapshotRepository();
    this.financeAuditRepository = new FinanceAuditRepository();
  }

  async performDailyClosing(
    targetDate?: string,
    actorId: string = "system",
  ): Promise<DailySnapshot> {
    const snapshotDate = targetDate ?? new Date().toISOString().slice(0, 10);

    const existing = await this.snapshotRepository.findDailyByDate(snapshotDate);
    if (existing) {
      throw new Error(`Daily financial closing snapshot already exists for date: ${snapshotDate}`);
    }

    const start = new Date(`${snapshotDate}T00:00:00.000Z`);
    const end = new Date(`${snapshotDate}T23:59:59.999Z`);

    const allEntries = await this.ledgerRepository.find({});
    const dayEntries = allEntries.filter((e) => {
      const d = e.createdAt ? new Date(e.createdAt) : new Date();
      return d >= start && d <= end;
    });

    let openingBalanceCents = 0;
    for (const e of allEntries) {
      const d = e.createdAt ? new Date(e.createdAt) : new Date();
      if (d < start && e.status === "cleared") {
        openingBalanceCents += e.amount;
      }
    }

    let revenueCents = 0;
    let profitCents = 0;
    let withdrawalsCents = 0;
    let depositsCents = 0;
    let refundsCents = 0;

    for (const e of dayEntries) {
      if (e.status === "cleared") {
        if (e.amount > 0) {
          revenueCents += e.amount;
          if (["profit_credit", "commission"].includes(e.type)) profitCents += e.amount;
          if (e.type === "deposit") depositsCents += e.amount;
        } else {
          if (["withdrawal_paid", "withdrawal"].includes(e.type))
            withdrawalsCents += Math.abs(e.amount);
          if (e.type === "refund") refundsCents += Math.abs(e.amount);
        }
      }
    }

    const closingBalanceCents =
      openingBalanceCents + revenueCents - withdrawalsCents - refundsCents;

    const snapshot = await this.snapshotRepository.createDaily({
      snapshotDate,
      openingBalanceCents,
      closingBalanceCents,
      revenueCents,
      profitCents,
      withdrawalsCents,
      depositsCents,
      refundsCents,
      totalTransactionsCount: dayEntries.length,
      reconciled: true,
      lockedAt: new Date(),
      createdBy: actorId,
      notes: `Daily closing performed for ${snapshotDate} by ${actorId}`,
      status: "cleared",
    });

    const refNum = `REF-LED-CLOSE-${snapshotDate}`;
    await this.financeAuditRepository.create({
      referenceNumber: refNum,
      action: "manual_adjustment",
      walletId: "platform",
      actorId,
      amount: closingBalanceCents,
      oldBalance: openingBalanceCents,
      newBalance: closingBalanceCents,
      currency: "BDT",
      reason: `Daily financial closing completed for ${snapshotDate}. Closing Cash: ৳${(closingBalanceCents / 100).toFixed(2)}`,
    });

    await EventBus.publish(
      "finance.daily_closing_complete",
      { snapshotDate, snapshotId: snapshot.id, closingBalanceCents, revenueCents, profitCents },
      { source: "closing-service" },
    );

    logger.info("FinancialClosingService: daily closing completed", {
      snapshotDate,
      closingBalanceCents,
    });
    return snapshot;
  }

  async performMonthlyClosing(
    targetMonthKey?: string,
    actorId: string = "system",
  ): Promise<MonthlySnapshot> {
    const monthKey = targetMonthKey ?? new Date().toISOString().slice(0, 7); // YYYY-MM

    const existing = await this.snapshotRepository.findMonthlyByKey(monthKey);
    if (existing) {
      throw new Error(`Monthly financial closing snapshot already exists for month: ${monthKey}`);
    }

    const [year, month] = monthKey.split("-").map(Number);
    const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const allEntries = await this.ledgerRepository.find({});
    const monthEntries = allEntries.filter((e) => {
      const d = e.createdAt ? new Date(e.createdAt) : new Date();
      return d >= start && d <= end;
    });

    let openingBalanceCents = 0;
    for (const e of allEntries) {
      const d = e.createdAt ? new Date(e.createdAt) : new Date();
      if (d < start && e.status === "cleared") {
        openingBalanceCents += e.amount;
      }
    }

    let grossRevenueCents = 0;
    let grossProfitCents = 0;
    let withdrawalsCents = 0;
    let depositsCents = 0;
    let refundLossCents = 0;
    let commissionCents = 0;

    for (const e of monthEntries) {
      if (e.status === "cleared") {
        if (e.amount > 0) {
          grossRevenueCents += e.amount;
          if (e.type === "profit_credit") grossProfitCents += e.amount;
          if (e.type === "commission") commissionCents += e.amount;
          if (e.type === "deposit") depositsCents += e.amount;
        } else {
          if (["withdrawal_paid", "withdrawal"].includes(e.type))
            withdrawalsCents += Math.abs(e.amount);
          if (e.type === "refund") refundLossCents += Math.abs(e.amount);
        }
      }
    }

    const netRevenueCents = grossRevenueCents - refundLossCents;
    const netProfitCents = grossProfitCents + commissionCents - refundLossCents;
    const platformEarningsCents = netProfitCents;
    const closingBalanceCents = openingBalanceCents + netRevenueCents - withdrawalsCents;

    const snapshot = await this.snapshotRepository.createMonthly({
      monthKey,
      openingBalanceCents,
      closingBalanceCents,
      grossRevenueCents,
      netRevenueCents,
      grossProfitCents,
      netProfitCents,
      withdrawalsCents,
      depositsCents,
      refundLossCents,
      commissionCents,
      platformEarningsCents,
      reconciled: true,
      lockedAt: new Date(),
      createdBy: actorId,
      notes: `Month-end financial closing completed for ${monthKey}`,
      status: "cleared",
    });

    const refNum = `REF-LED-MCLOSE-${monthKey}`;
    await this.financeAuditRepository.create({
      referenceNumber: refNum,
      action: "manual_adjustment",
      walletId: "platform",
      actorId,
      amount: closingBalanceCents,
      oldBalance: openingBalanceCents,
      newBalance: closingBalanceCents,
      currency: "BDT",
      reason: `Month-end financial closing completed for ${monthKey}. Net Profit: ৳${(netProfitCents / 100).toFixed(2)}`,
    });

    await EventBus.publish(
      "finance.monthly_closing_complete",
      { monthKey, snapshotId: snapshot.id, netRevenueCents, netProfitCents },
      { source: "closing-service" },
    );

    logger.info("FinancialClosingService: monthly closing completed", { monthKey, netProfitCents });
    return snapshot;
  }
}

export default FinancialClosingService;
