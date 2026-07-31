export type GiftVoucherStatus = "active" | "used" | "expired" | "paused" | "archived";

export interface GiftVoucher {
  id: string;
  code: string;
  amountCents: number;
  usedAmountCents: number;
  remainingCents: number;
  expiryDate?: Date;
  status: GiftVoucherStatus;
  singleUse: boolean;
  notes?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
