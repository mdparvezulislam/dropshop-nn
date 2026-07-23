import { BaseDBEntity } from "@/lib/database/types";

export const COD_SETTLEMENT_STATUSES = ["pending", "partial", "settled", "disputed"] as const;
export type CodSettlementStatus = (typeof COD_SETTLEMENT_STATUSES)[number];

export interface CodReconciliation extends BaseDBEntity {
  orderId: string;
  orderNumber: string;
  courierName: string;
  trackingNumber: string;
  expectedAmount: number;
  receivedAmount: number;
  difference: number;
  settlementStatus: CodSettlementStatus;
  settlementDate?: Date;
  notes?: string;
  reconciledAt?: Date;
  reconciledBy?: string;
}

export function getCodDifference(entity: CodReconciliation): number {
  return entity.receivedAmount - entity.expectedAmount;
}

export function isCodMismatch(entity: CodReconciliation): boolean {
  return entity.expectedAmount !== entity.receivedAmount;
}
