import { z } from "zod";

export const requestWithdrawalSchema = z.object({
  walletId: z.string().min(1, "Wallet ID is required"),
  amount: z.number().int().positive("Withdrawal amount must be a positive integer in cents"),
  method: z.enum(["bkash", "nagad", "rocket", "bank", "manual"]),
  payoutDetails: z.object({
    accountNumber: z.string().min(1, "Account number is required"),
    accountName: z.string().optional(),
    bankName: z.string().optional(),
    branchName: z.string().optional(),
    routingNumber: z.string().optional(),
  }),
});

export const transitionWithdrawalSchema = z.object({
  withdrawalId: z.string().min(1, "Withdrawal ID is required"),
  toStatus: z.enum(["under_review", "approved", "completed", "rejected", "cancelled"]),
  reason: z.string().optional(),
  referenceNumber: z.string().optional(),
  fee: z.number().int().nonnegative().optional(),
});

export const getWalletBalancesSchema = z.object({
  walletId: z.string().min(1, "Wallet ID is required"),
});

export type RequestWithdrawalInput = z.infer<typeof requestWithdrawalSchema>;
export type TransitionWithdrawalInput = z.infer<typeof transitionWithdrawalSchema>;
export type GetWalletBalancesInput = z.infer<typeof getWalletBalancesSchema>;
