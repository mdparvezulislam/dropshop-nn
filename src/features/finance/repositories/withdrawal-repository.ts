import { BaseRepository } from "@/lib/database/generic-repository";
import { WithdrawalModel } from "./withdrawal-model";
import type { Withdrawal, WithdrawalStatus, PayoutMethod } from "../domain/withdrawal-entity";
import type { BaseDocument } from "@/lib/database/types";

interface WithdrawalDocument extends BaseDocument {
  referenceNumber: string;
  walletId: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  payoutDetails: {
    accountNumber: string;
    accountName?: string;
    bankName?: string;
    branchName?: string;
    routingNumber?: string;
    notes?: string;
  };
  transactionId?: string;
  fee?: number;
  reviewedBy?: string;
  reviewedAt?: Date;
  paidAt?: Date;
  rejectReason?: string;
}

function mapToDomain(doc: any): Withdrawal {
  return {
    id: doc.id ?? doc._id?.toString(),
    referenceNumber: doc.referenceNumber ?? `WTH-${doc._id?.toString().slice(-6).toUpperCase()}`,
    walletId: doc.walletId?.toString ? doc.walletId.toString() : doc.walletId,
    amount: doc.amount,
    currency: doc.currency ?? "BDT",
    status: doc.status as WithdrawalStatus,
    method: doc.method as PayoutMethod,
    payoutDetails: doc.payoutDetails,
    transactionId: doc.transactionId,
    fee: doc.fee ?? 0,
    reviewedBy: doc.reviewedBy,
    reviewedAt: doc.reviewedAt,
    paidAt: doc.paidAt,
    rejectReason: doc.rejectReason,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted,
    metadata: doc.metadata,
  };
}

export interface WithdrawalQueryFilter {
  walletId?: string;
  status?: string;
  method?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class WithdrawalRepository extends BaseRepository<WithdrawalDocument, Withdrawal> {
  constructor() {
    super(WithdrawalModel as any, mapToDomain);
  }

  async findByWalletId(walletId: string): Promise<Withdrawal[]> {
    return this.find({ walletId });
  }

  async findByReferenceNumber(referenceNumber: string): Promise<Withdrawal | null> {
    return this.findOne({ referenceNumber });
  }

  async findActivePendingByWallet(walletId: string): Promise<Withdrawal[]> {
    return this.find({ walletId, status: { $in: ["pending", "under_review", "approved"] } });
  }

  async findStalePendingRequests(olderThan: Date): Promise<Withdrawal[]> {
    return this.find({
      status: "pending",
      createdAt: { $lte: olderThan },
    });
  }

  async searchAndFilter(filter: WithdrawalQueryFilter): Promise<{ items: Withdrawal[]; total: number }> {
    const query: Record<string, unknown> = {};

    if (filter.walletId) query.walletId = filter.walletId;
    if (filter.status) query.status = filter.status;
    if (filter.method) query.method = filter.method;

    if (filter.search?.trim()) {
      const s = filter.search.trim();
      query.$or = [
        { referenceNumber: { $regex: s, $options: "i" } },
        { transactionId: { $regex: s, $options: "i" } },
        { "payoutDetails.accountNumber": { $regex: s, $options: "i" } },
        { "payoutDetails.accountName": { $regex: s, $options: "i" } },
      ];
    }

    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.max(1, Math.min(200, filter.limit ?? 50));
    const skip = (page - 1) * limit;

    const total = await WithdrawalModel.countDocuments(query);
    const docs = await WithdrawalModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const items = docs.map((doc: any) => mapToDomain({ ...doc, id: doc._id.toString() }));
    return { items, total };
  }
}

export default WithdrawalRepository;
