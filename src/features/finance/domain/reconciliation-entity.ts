import { BaseDBEntity } from "@/lib/database/types";

export type ReconciliationStatus =
  | "matched"
  | "warning"
  | "mismatch"
  | "missing_ledger"
  | "missing_wallet_entry"
  | "missing_settlement";

export interface ReconciliationLog extends BaseDBEntity {
  referenceNumber: string; // e.g. REC-2026-10001
  type: "wallet_balance" | "order_settlement" | "ledger_integrity" | "full_system";
  status: ReconciliationStatus;
  walletId?: string;
  orderId?: string;
  walletBalanceCents?: number;
  computedLedgerBalanceCents?: number;
  differenceCents?: number;
  notes?: string;
  details?: Record<string, unknown>;
  reconciledBy: string; // actor ID or "system"
  reconciledAt: Date;
}

export interface FinancialHealthScore {
  score: number; // 0 to 100
  rating: "Excellent" | "Good" | "Fair" | "Critical";
  ledgerIntegrity: boolean;
  walletIntegrity: boolean;
  settlementIntegrity: boolean;
  duplicateTransactionsCount: number;
  pendingErrorCount: number;
  unreconciledCount: number;
  lastCheckedAt: Date;
  checkSummary: string[];
}

export interface LedgerVerificationResult {
  totalLedgerEntries: number;
  missingLedgerEntries: number;
  duplicateLedgerEntries: number;
  brokenReferences: Array<{
    ledgerId: string;
    referenceNumber: string;
    referenceType?: string;
    referenceId?: string;
    reason: string;
  }>;
  invalidTransactions: number;
}

export interface SettlementVerificationResult {
  totalCompletedOrders: number;
  settledOrdersCount: number;
  pendingSettlementCount: number;
  duplicateSettlementsCount: number;
  missingSettlementOrders: string[]; // order IDs
}
