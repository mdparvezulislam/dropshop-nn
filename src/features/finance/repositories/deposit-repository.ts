import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { DepositModel } from "./deposit-model";
import type { Deposit, DepositStatus, DepositMethod } from "../domain/deposit-entity";
import type { BaseDocument } from "@/shared/lib/database/types";

interface DepositDocument extends BaseDocument {
  referenceNumber: string;
  walletId: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  paymentReference?: string;
  receiptUrl?: string;
  notes?: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectReason?: string;
}

function mapToDomain(doc: any): Deposit {
  return {
    id: doc.id ?? doc._id?.toString(),
    referenceNumber: doc.referenceNumber ?? `DEP-${doc._id?.toString().slice(-6).toUpperCase()}`,
    walletId: doc.walletId?.toString ? doc.walletId.toString() : doc.walletId,
    amount: doc.amount,
    currency: doc.currency ?? "BDT",
    status: doc.status as DepositStatus,
    method: doc.method as DepositMethod,
    paymentReference: doc.paymentReference,
    receiptUrl: doc.receiptUrl,
    notes: doc.notes,
    createdBy: doc.createdBy,
    approvedBy: doc.approvedBy,
    approvedAt: doc.approvedAt,
    rejectedBy: doc.rejectedBy,
    rejectedAt: doc.rejectedAt,
    rejectReason: doc.rejectReason,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted,
    metadata: doc.metadata,
  };
}

export interface DepositQueryFilter {
  walletId?: string;
  status?: string;
  method?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class DepositRepository extends BaseRepository<DepositDocument, Deposit> {
  constructor() {
    super(DepositModel as any, mapToDomain);
  }

  async findByWalletId(walletId: string): Promise<Deposit[]> {
    return this.find({ walletId });
  }

  async findByReferenceNumber(referenceNumber: string): Promise<Deposit | null> {
    return this.findOne({ referenceNumber });
  }

  async searchAndFilter(filter: DepositQueryFilter): Promise<{ items: Deposit[]; total: number }> {
    const query: Record<string, unknown> = {};

    if (filter.walletId) query.walletId = filter.walletId;
    if (filter.status) query.status = filter.status;
    if (filter.method) query.method = filter.method;

    if (filter.search?.trim()) {
      const s = filter.search.trim();
      query.$or = [
        { referenceNumber: { $regex: s, $options: "i" } },
        { paymentReference: { $regex: s, $options: "i" } },
        { notes: { $regex: s, $options: "i" } },
      ];
    }

    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.max(1, Math.min(200, filter.limit ?? 50));
    const skip = (page - 1) * limit;

    const total = await DepositModel.countDocuments(query);
    const docs = await DepositModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const items = docs.map((doc: any) => mapToDomain({ ...doc, id: doc._id.toString() }));
    return { items, total };
  }
}

export default DepositRepository;
