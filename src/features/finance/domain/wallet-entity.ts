import { BaseDBEntity } from "@/shared/lib/database/types";

export type WorkspaceRole =
  | "customer"
  | "reseller"
  | "wholesaler"
  | "admin"
  | "supplier"
  | "staff"
  | "platform"
  | "commission";

export type WalletStatus = "active" | "suspended" | "frozen";

export interface Wallet extends BaseDBEntity {
  workspaceId: string;
  workspaceRole: WorkspaceRole;
  currency: string;
  status: WalletStatus;
}

export interface WalletBalances {
  walletId: string;
  workspaceId: string;
  workspaceRole: WorkspaceRole;
  currentBalance: number; // in integer cents (cleared credits - cleared debits)
  availableBalance: number; // in integer cents (cleared credits ready for withdrawal/use)
  pendingBalance: number; // in integer cents (uncleared profit/pending credits)
  lockedBalance: number; // in integer cents (locked debits for pending withdrawals)
  withdrawableBalance: number; // in integer cents Math.max(0, availableBalance - lockedBalance)
  lifetimeEarnings: number; // total cumulative profit/credits
  lifetimeWithdrawals: number; // total cumulative completed payouts
  lifetimeDeposits: number; // total cumulative approved deposits
  currency: string;
}
