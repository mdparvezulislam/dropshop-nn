import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { FinanceAuditLogModel } from "./finance-audit-model";
import type { FinanceAuditLog, FinanceAuditAction } from "../domain/finance-audit-entity";
import type { BaseDocument } from "@/shared/lib/database/types";

interface FinanceAuditLogDocument extends BaseDocument {
  referenceNumber?: string;
  action: string;
  walletId: string;
  actorId: string;
  actorRole?: string;
  actorName?: string;
  amount: number;
  oldBalance: number;
  newBalance: number;
  currency: string;
  reason: string;
  internalNotes?: string;
  ip?: string;
}

function mapToDomain(doc: any): FinanceAuditLog {
  return {
    id: doc.id ?? doc._id?.toString(),
    referenceNumber: doc.referenceNumber,
    action: doc.action as FinanceAuditAction,
    walletId: doc.walletId?.toString ? doc.walletId.toString() : doc.walletId,
    actorId: doc.actorId,
    actorRole: doc.actorRole,
    actorName: doc.actorName,
    amount: doc.amount,
    oldBalance: doc.oldBalance,
    newBalance: doc.newBalance,
    currency: doc.currency ?? "BDT",
    reason: doc.reason,
    internalNotes: doc.internalNotes,
    status: doc.status ?? "cleared",
    ip: doc.ip,
    metadata: doc.metadata,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted,
  };
}

export interface FinanceAuditFilter {
  walletId?: string;
  actorId?: string;
  action?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class FinanceAuditRepository extends BaseRepository<FinanceAuditLogDocument, FinanceAuditLog> {
  constructor() {
    super(FinanceAuditLogModel as any, mapToDomain);
  }

  async findByWalletId(walletId: string): Promise<FinanceAuditLog[]> {
    return this.find({ walletId });
  }

  async searchAndFilter(filter: FinanceAuditFilter): Promise<{ items: FinanceAuditLog[]; total: number }> {
    const query: Record<string, unknown> = {};

    if (filter.walletId) query.walletId = filter.walletId;
    if (filter.actorId) query.actorId = filter.actorId;
    if (filter.action) query.action = filter.action;

    if (filter.search?.trim()) {
      const s = filter.search.trim();
      query.$or = [
        { referenceNumber: { $regex: s, $options: "i" } },
        { reason: { $regex: s, $options: "i" } },
        { actorName: { $regex: s, $options: "i" } },
        { action: { $regex: s, $options: "i" } },
      ];
    }

    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.max(1, Math.min(200, filter.limit ?? 50));
    const skip = (page - 1) * limit;

    const total = await FinanceAuditLogModel.countDocuments(query);
    const docs = await FinanceAuditLogModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const items = docs.map((doc: any) => mapToDomain({ ...doc, id: doc._id.toString() }));
    return { items, total };
  }
}

export default FinanceAuditRepository;
