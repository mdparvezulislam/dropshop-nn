import { BaseDBEntity } from "@/lib/database/types";

export type DepositStatus = "pending" | "approved" | "rejected" | "cancelled" | "completed";

export type DepositMethod =
  "bkash" | "nagad" | "rocket" | "upay" | "bank" | "manual" | "admin_credit";

export interface Deposit extends BaseDBEntity {
  referenceNumber: string; // e.g. DEP-2026-1001
  walletId: string;
  amount: number; // in integer cents
  currency: string;
  status: DepositStatus;
  method: DepositMethod;
  paymentReference?: string; // MFS / Bank transaction reference number
  receiptUrl?: string; // Receipt attachment upload URL
  notes?: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectReason?: string;
}
