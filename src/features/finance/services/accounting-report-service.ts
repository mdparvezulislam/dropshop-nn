import { LedgerRepository } from "../repositories/ledger-repository";
import { WithdrawalRepository } from "../repositories/withdrawal-repository";
import { DepositRepository } from "../repositories/deposit-repository";
import { FinancialReportRepository } from "../repositories/financial-report-repository";
import type {
  ProfitAndLossReport,
  RevenueAnalysisReport,
  FinancialReport,
  ReportType,
} from "../domain/financial-report-entity";

export class AccountingReportService {
  private readonly ledgerRepository: LedgerRepository;
  private readonly withdrawalRepository: WithdrawalRepository;
  private readonly depositRepository: DepositRepository;
  private readonly financialReportRepository: FinancialReportRepository;

  constructor() {
    this.ledgerRepository = new LedgerRepository();
    this.withdrawalRepository = new WithdrawalRepository();
    this.depositRepository = new DepositRepository();
    this.financialReportRepository = new FinancialReportRepository();
  }

  private getPeriodDates(period: string, startDate?: Date, endDate?: Date): { start: Date; end: Date } {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (period === "Today") {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (period === "Yesterday") {
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setHours(23, 59, 59, 999);
    } else if (period === "This Week") {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (period === "This Month") {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  }

  async getProfitAndLoss(period: string = "This Month", startDate?: Date, endDate?: Date): Promise<ProfitAndLossReport> {
    const { start, end } = this.getPeriodDates(period, startDate, endDate);

    const allEntries = await this.ledgerRepository.find({});
    const periodEntries = allEntries.filter((e) => {
      const d = e.createdAt ? new Date(e.createdAt) : new Date();
      return d >= start && d <= end && e.status === "cleared";
    });

    let grossRevenueCents = 0;
    let costOfGoodsSoldCents = 0; // estimated 70% of gross
    let grossProfitCents = 0;
    const operatingExpensesCents = 0;
    let refundLossCents = 0;
    let payoutFeesCents = 0;

    for (const e of periodEntries) {
      if (e.amount > 0) {
        grossRevenueCents += e.amount;
        if (["profit_credit", "commission"].includes(e.type)) {
          grossProfitCents += e.amount;
        }
      } else {
        if (e.type === "refund") refundLossCents += Math.abs(e.amount);
        if (e.type === "withdrawal_paid" && e.metadata?.fee) {
          payoutFeesCents += Number(e.metadata.fee);
        }
      }
    }

    costOfGoodsSoldCents = Math.max(0, grossRevenueCents - grossProfitCents);
    const netProfitCents = grossProfitCents - refundLossCents - operatingExpensesCents - payoutFeesCents;

    return {
      period,
      startDate: start,
      endDate: end,
      grossRevenueCents,
      costOfGoodsSoldCents,
      grossProfitCents,
      operatingExpensesCents,
      refundLossCents,
      payoutFeesCents,
      netProfitCents,
    };
  }

  async getRevenueAnalysis(period: string = "This Month", startDate?: Date, endDate?: Date): Promise<RevenueAnalysisReport> {
    const { start, end } = this.getPeriodDates(period, startDate, endDate);

    const allEntries = await this.ledgerRepository.find({});
    const periodEntries = allEntries.filter((e) => {
      const d = e.createdAt ? new Date(e.createdAt) : new Date();
      return d >= start && d <= end && e.status === "cleared";
    });

    let grossRevenueCents = 0;
    let totalProfitCents = 0;
    let refundLossCents = 0;
    let commissionCents = 0;

    for (const e of periodEntries) {
      if (e.amount > 0) {
        grossRevenueCents += e.amount;
        if (e.type === "profit_credit") totalProfitCents += e.amount;
        if (e.type === "commission") commissionCents += e.amount;
      } else {
        if (e.type === "refund") refundLossCents += Math.abs(e.amount);
      }
    }

    const netRevenueCents = grossRevenueCents - refundLossCents;
    const platformEarningsCents = totalProfitCents + commissionCents - refundLossCents;

    return {
      period,
      startDate: start,
      endDate: end,
      grossRevenueCents,
      netRevenueCents,
      totalProfitCents,
      refundLossCents,
      commissionCents,
      platformEarningsCents,
    };
  }

  async generateReport(
    type: ReportType,
    period: string = "This Month",
    format: "csv" | "excel" | "pdf" | "json" = "csv",
    actorId: string = "system",
  ): Promise<FinancialReport> {
    const { start, end } = this.getPeriodDates(period);
    const pnl = await this.getProfitAndLoss(period);
    const rev = await this.getRevenueAnalysis(period);

    const refNum = `RPT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const title = `${type.replace("_", " ").toUpperCase()} (${period})`;

    const report = await this.financialReportRepository.create({
      referenceNumber: refNum,
      title,
      type,
      startDate: start,
      endDate: end,
      summaryData: { pnl, revenue: rev },
      generatedBy: actorId,
      format,
      status: "cleared",
    });

    return report;
  }
}

export default AccountingReportService;
