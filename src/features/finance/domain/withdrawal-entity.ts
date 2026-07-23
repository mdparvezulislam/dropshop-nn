import { BaseDBEntity } from "@/lib/database/types";

export type WithdrawalStatus =
  | "draft"
  | "pending"
  | "under_review"
  | "approved"
  | "paid"
  | "completed"
  | "rejected"
  | "cancelled"
  | "hold";

export type PayoutMethod = "bkash" | "nagad" | "rocket" | "upay" | "bank" | "binance_pay" | "manual";

export interface Withdrawal extends BaseDBEntity {
  referenceNumber: string; // e.g. WTH-2026-1001
  walletId: string;
  amount: number; // in integer cents
  currency: string;
  status: WithdrawalStatus;
  method: PayoutMethod;
  payoutDetails: {
    accountNumber: string;
    accountName?: string;
    bankName?: string;
    branchName?: string;
    routingNumber?: string;
    notes?: string;
  };
  transactionId?: string; // external bank / MFS transaction ID
  fee?: number; // fees in integer cents
  reviewedBy?: string; // actor ID
  reviewedAt?: Date;
  paidAt?: Date;
  rejectReason?: string;
}
