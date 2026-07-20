import { BaseDBEntity } from "@/shared/lib/database/types";

export type LedgerEntryType =
  | "opening_balance"
  | "profit_credit"
  | "manual_credit"
  | "manual_debit"
  | "withdrawal_request"
  | "withdrawal_approved"
  | "withdrawal_rejected"
  | "withdrawal_paid"
  | "refund"
  | "commission"
  | "settlement"
  | "adjustment";

export type LedgerEntryStatus = "pending" | "cleared" | "locked" | "cancelled";

export interface LedgerEntry extends BaseDBEntity {
  walletId: string;
  amount: number; // in integer cents. Credit is positive, Debit is negative.
  type: LedgerEntryType;
  status: LedgerEntryStatus;
  referenceType?: "order" | "withdrawal" | "settlement" | "manual";
  referenceId?: string;
  clearsAt?: Date; // holding clearance release time
}
