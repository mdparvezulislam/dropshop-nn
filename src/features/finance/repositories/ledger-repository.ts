import { BaseRepository } from "@/lib/database/generic-repository";
import { LedgerEntryModel } from "./ledger-model";
import type {
  LedgerEntry,
  LedgerEntryType,
  LedgerEntryStatus,
  SourceModule,
} from "../domain/ledger-entity";
import type { BaseDocument } from "@/lib/database/types";

interface LedgerEntryDocument extends BaseDocument {
  referenceNumber: string;
  walletId: string;
  workspaceId?: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  sourceModule: string;
  referenceType?: string;
  referenceId?: string;
  orderId?: string;
  description?: string;
  createdBy?: string;
  clearsAt?: Date;
}

function mapToDomain(doc: any): LedgerEntry {
  return {
    id: doc.id ?? doc._id?.toString(),
    referenceNumber:
      doc.referenceNumber ?? `REF-LED-${doc._id?.toString().slice(-6).toUpperCase()}`,
    walletId: doc.walletId?.toString ? doc.walletId.toString() : doc.walletId,
    workspaceId: doc.workspaceId,
    amount: doc.amount,
    currency: doc.currency ?? "BDT",
    type: doc.type as LedgerEntryType,
    status: doc.status as LedgerEntryStatus,
    sourceModule: (doc.sourceModule as SourceModule) ?? "system",
    referenceType: doc.referenceType,
    referenceId: doc.referenceId,
    orderId: doc.orderId,
    description: doc.description,
    createdBy: doc.createdBy ?? "system",
    clearsAt: doc.clearsAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted,
    metadata: doc.metadata,
  };
}

export interface LedgerQueryFilter {
  walletId?: string;
  workspaceId?: string;
  type?: string;
  status?: string;
  sourceModule?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  orderId?: string;
  page?: number;
  limit?: number;
}

export class LedgerRepository extends BaseRepository<LedgerEntryDocument, LedgerEntry> {
  constructor() {
    super(LedgerEntryModel as any, mapToDomain);
  }

  async findByWalletId(walletId: string): Promise<LedgerEntry[]> {
    return this.find({ walletId });
  }

  async findByReferenceNumber(referenceNumber: string): Promise<LedgerEntry | null> {
    return this.findOne({ referenceNumber });
  }

  async findPendingClearances(now: Date = new Date()): Promise<LedgerEntry[]> {
    return this.find({
      status: "pending",
      clearsAt: { $lte: now },
    });
  }

  async existsDuplicateEntry(
    walletId: string,
    type: string,
    referenceId: string,
  ): Promise<boolean> {
    const existing = await this.findOne({
      walletId,
      type,
      referenceId,
      status: { $ne: "cancelled" },
    });
    return !!existing;
  }

  async searchAndFilter(
    filter: LedgerQueryFilter,
  ): Promise<{ items: LedgerEntry[]; total: number }> {
    const query: Record<string, unknown> = {};

    if (filter.walletId) query.walletId = filter.walletId;
    if (filter.workspaceId) query.workspaceId = filter.workspaceId;
    if (filter.type) query.type = filter.type;
    if (filter.status) query.status = filter.status;
    if (filter.sourceModule) query.sourceModule = filter.sourceModule;
    if (filter.orderId) query.orderId = filter.orderId;

    if (filter.startDate || filter.endDate) {
      const dateQuery: Record<string, Date> = {};
      if (filter.startDate) dateQuery.$gte = filter.startDate;
      if (filter.endDate) dateQuery.$lte = filter.endDate;
      query.createdAt = dateQuery;
    }

    if (filter.search?.trim()) {
      const s = filter.search.trim();
      query.$or = [
        { referenceNumber: { $regex: s, $options: "i" } },
        { referenceId: { $regex: s, $options: "i" } },
        { orderId: { $regex: s, $options: "i" } },
        { description: { $regex: s, $options: "i" } },
      ];
    }

    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.max(1, Math.min(200, filter.limit ?? 50));
    const skip = (page - 1) * limit;

    const total = await LedgerEntryModel.countDocuments(query);
    const docs = await LedgerEntryModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const items = docs.map((doc: any) => mapToDomain({ ...doc, id: doc._id.toString() }));
    return { items, total };
  }
}

export default LedgerRepository;
