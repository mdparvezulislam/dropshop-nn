import { BaseDBEntity } from "@/shared/lib/database/types";

export type WithdrawalStatus =
  | "draft"
  | "pending"
  | "under_review"
  | "approved"
  | "paid"
  | "completed"
  | "rejected"
  | "cancelled";

export type PayoutMethod = "bkash" | "nagad" | "rocket" | "bank" | "manual";

export interface Withdrawal extends BaseDBEntity {
  walletId: string;
  amount: number; // in integer cents
  status: WithdrawalStatus;
  method: PayoutMethod;
  payoutDetails: {
    accountNumber: string;
    accountName?: string;
    bankName?: string;
    branchName?: string;
    routingNumber?: string;
  };
  referenceNumber?: string; // external txn hash ID
  fee?: number; // fees in cents
  reviewedBy?: string; // actor ID
  reviewedAt?: Date;
  paidAt?: Date;
}
