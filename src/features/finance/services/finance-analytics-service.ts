import { LedgerRepository } from "../repositories/ledger-repository";
import { WithdrawalRepository } from "../repositories/withdrawal-repository";
import { DepositRepository } from "../repositories/deposit-repository";
import { WalletRepository } from "../repositories/wallet-repository";

export interface FinanceDashboardSummary {
  availableBalance: number; // in integer cents
  pendingBalance: number; // in integer cents
  lockedBalance: number; // in integer cents
  todaysCredits: number; // in integer cents
  todaysDebits: number; // in integer cents
  pendingWithdrawalsCount: number;
  pendingWithdrawalsSum: number; // in integer cents
  pendingDepositsCount: number;
  pendingDepositsSum: number; // in integer cents
  monthlyProfit: number; // in integer cents
  platformRevenue: number; // in integer cents
  netProfit: number; // in integer cents
  activeWalletsCount: number;
  totalLedgerEntriesCount: number;
  monthlyChartData: Array<{
    month: string;
    credits: number;
    debits: number;
    profit: number;
  }>;
}

export class FinanceAnalyticsService {
  private readonly ledgerRepository: LedgerRepository;
  private readonly withdrawalRepository: WithdrawalRepository;
  private readonly depositRepository: DepositRepository;
  private readonly walletRepository: WalletRepository;

  constructor() {
    this.ledgerRepository = new LedgerRepository();
    this.withdrawalRepository = new WithdrawalRepository();
    this.depositRepository = new DepositRepository();
    this.walletRepository = new WalletRepository();
  }

  async getDashboardSummary(): Promise<FinanceDashboardSummary> {
    const allWallets = await this.walletRepository.listAllWallets();
    const allLedgerEntries = await this.ledgerRepository.find({});
    const allWithdrawals = await this.withdrawalRepository.find({});
    const allDeposits = await this.depositRepository.find({});

    let availableBalance = 0;
    let pendingBalance = 0;
    let lockedBalance = 0;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    let todaysCredits = 0;
    let todaysDebits = 0;
    let monthlyProfit = 0;
    let platformRevenue = 0;

    for (const entry of allLedgerEntries) {
      if (entry.status === "cleared") {
        availableBalance += entry.amount;
      } else if (entry.status === "pending") {
        if (entry.amount > 0) pendingBalance += entry.amount;
      } else if (entry.status === "locked") {
        lockedBalance += Math.abs(entry.amount);
      }

      const entryDate = entry.createdAt ? new Date(entry.createdAt) : new Date();

      if (entryDate >= startOfToday) {
        if (entry.amount > 0) todaysCredits += entry.amount;
        else todaysDebits += Math.abs(entry.amount);
      }

      if (entryDate >= startOfMonth) {
        if (["profit_credit", "commission"].includes(entry.type) && entry.amount > 0) {
          monthlyProfit += entry.amount;
        }
        if (entry.amount > 0) {
          platformRevenue += entry.amount;
        }
      }
    }

    const pendingWithdrawals = allWithdrawals.filter(
      (w) => w.status === "pending" || w.status === "under_review" || w.status === "approved",
    );
    const pendingWithdrawalsSum = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

    const pendingDeposits = allDeposits.filter((d) => d.status === "pending");
    const pendingDepositsSum = pendingDeposits.reduce((sum, d) => sum + d.amount, 0);

    const netProfit = monthlyProfit - pendingWithdrawalsSum;

    // Monthly Chart Breakdown (Last 6 Months)
    const monthlyChartData: Array<{
      month: string;
      credits: number;
      debits: number;
      profit: number;
    }> = [];
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const monthIdx = d.getMonth();
      const monthLabel = `${monthNames[monthIdx]} ${year}`;

      let mCredits = 0;
      let mDebits = 0;
      let mProfit = 0;

      for (const entry of allLedgerEntries) {
        const eDate = entry.createdAt ? new Date(entry.createdAt) : new Date();
        if (eDate.getFullYear() === year && eDate.getMonth() === monthIdx) {
          if (entry.amount > 0) {
            mCredits += entry.amount;
            if (["profit_credit", "commission"].includes(entry.type)) mProfit += entry.amount;
          } else {
            mDebits += Math.abs(entry.amount);
          }
        }
      }

      monthlyChartData.push({
        month: monthLabel,
        credits: mCredits,
        debits: mDebits,
        profit: mProfit,
      });
    }

    return {
      availableBalance,
      pendingBalance,
      lockedBalance,
      todaysCredits,
      todaysDebits,
      pendingWithdrawalsCount: pendingWithdrawals.length,
      pendingWithdrawalsSum,
      pendingDepositsCount: pendingDeposits.length,
      pendingDepositsSum,
      monthlyProfit,
      platformRevenue,
      netProfit,
      activeWalletsCount: allWallets.length,
      totalLedgerEntriesCount: allLedgerEntries.length,
      monthlyChartData,
    };
  }
}

export default FinanceAnalyticsService;
