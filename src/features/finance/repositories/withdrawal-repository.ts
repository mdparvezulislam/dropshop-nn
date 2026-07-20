import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { WithdrawalModel } from "./withdrawal-model";
import type { Withdrawal, WithdrawalStatus, PayoutMethod } from "../domain/withdrawal-entity";
import type { BaseDocument } from "@/shared/lib/database/types";

interface WithdrawalDocument extends BaseDocument {
  walletId: string;
  amount: number;
  status: string;
  method: string;
  payoutDetails: {
    accountNumber: string;
    accountName?: string;
    bankName?: string;
    branchName?: string;
    routingNumber?: string;
  };
  referenceNumber?: string;
  fee?: number;
  reviewedBy?: string;
  reviewedAt?: Date;
  paidAt?: Date;
}

function mapToDomain(doc: any): Withdrawal {
  return {
    id: doc.id ?? doc._id.toString(),
    walletId: doc.walletId.toString(),
    amount: doc.amount,
    status: doc.status as WithdrawalStatus,
    method: doc.method as PayoutMethod,
    payoutDetails: doc.payoutDetails,
    referenceNumber: doc.referenceNumber,
    fee: doc.fee,
    reviewedBy: doc.reviewedBy,
    reviewedAt: doc.reviewedAt,
    paidAt: doc.paidAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted,
    metadata: doc.metadata,
  };
}

export class WithdrawalRepository extends BaseRepository<WithdrawalDocument, Withdrawal> {
  constructor() {
    super(WithdrawalModel as any, mapToDomain);
  }

  async findByWalletId(walletId: string): Promise<Withdrawal[]> {
    return this.find({ walletId });
  }

  async findStalePendingRequests(olderThan: Date): Promise<Withdrawal[]> {
    return this.find({
      status: "pending",
      createdAt: { $lte: olderThan },
    });
  }
}

export default WithdrawalRepository;
