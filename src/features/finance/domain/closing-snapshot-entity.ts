import { BaseDBEntity } from "@/lib/database/types";

export interface DailySnapshot extends BaseDBEntity {
  snapshotDate: string; // YYYY-MM-DD
  openingBalanceCents: number;
  closingBalanceCents: number;
  revenueCents: number;
  profitCents: number;
  withdrawalsCents: number;
  depositsCents: number;
  refundsCents: number;
  totalTransactionsCount: number;
  reconciled: boolean;
  lockedAt: Date;
  createdBy: string;
  notes?: string;
}

export interface MonthlySnapshot extends BaseDBEntity {
  monthKey: string; // YYYY-MM
  openingBalanceCents: number;
  closingBalanceCents: number;
  grossRevenueCents: number;
  netRevenueCents: number;
  grossProfitCents: number;
  netProfitCents: number;
  withdrawalsCents: number;
  depositsCents: number;
  refundLossCents: number;
  commissionCents: number;
  platformEarningsCents: number;
  reconciled: boolean;
  lockedAt: Date;
  createdBy: string;
  notes?: string;
}
