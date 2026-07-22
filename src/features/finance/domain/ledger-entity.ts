import { BaseDBEntity } from "@/shared/lib/database/types";

export type LedgerEntryType =
  | "credit"
  | "debit"
  | "refund"
  | "commission"
  | "adjustment"
  | "withdrawal"
  | "deposit"
  | "order_settlement"
  | "charge"
  | "bonus"
  | "opening_balance"
  | "profit_credit"
  | "manual_credit"
  | "manual_debit"
  | "withdrawal_request"
  | "withdrawal_approved"
  | "withdrawal_rejected"
  | "withdrawal_paid";

export type LedgerEntryStatus = "pending" | "cleared" | "locked" | "cancelled";

export type SourceModule =
  | "order"
  | "withdrawal"
  | "deposit"
  | "manual_adjustment"
  | "commission"
  | "refund"
  | "settlement"
  | "system";

export interface LedgerEntry extends BaseDBEntity {
  referenceNumber: string; // Readable ref e.g. REF-LED-10001
  walletId: string;
  workspaceId?: string;
  amount: number; // in integer cents. Credit is positive (+), Debit is negative (-)
  currency: string;
  type: LedgerEntryType;
  status: LedgerEntryStatus;
  sourceModule: SourceModule;
  referenceType?: "order" | "withdrawal" | "deposit" | "settlement" | "manual";
  referenceId?: string;
  orderId?: string;
  description?: string;
  clearsAt?: Date; // holding clearance release timestamp
  metadata?: Record<string, string | number | boolean | null | undefined>;
}
