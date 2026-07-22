import { BaseDBEntity } from "@/shared/lib/database/types";

export type FinanceAuditAction =
  | "wallet_created"
  | "wallet_credited"
  | "wallet_debited"
  | "withdrawal_requested"
  | "withdrawal_approved"
  | "withdrawal_rejected"
  | "withdrawal_paid"
  | "withdrawal_cancelled"
  | "withdrawal_held"
  | "deposit_requested"
  | "deposit_approved"
  | "deposit_rejected"
  | "order_settled"
  | "refund_processed"
  | "commission_paid"
  | "manual_adjustment";

export interface FinanceAuditLog extends BaseDBEntity {
  referenceNumber?: string;
  action: FinanceAuditAction;
  walletId: string;
  actorId: string;
  actorRole?: string;
  actorName?: string;
  amount: number; // in integer cents
  oldBalance: number; // in integer cents
  newBalance: number; // in integer cents
  currency: string;
  reason: string;
  internalNotes?: string;
  ip?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}
