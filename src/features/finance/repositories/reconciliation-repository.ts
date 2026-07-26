import { BaseRepository } from "@/lib/database/generic-repository";
import { ReconciliationLogModel } from "./reconciliation-model";
import type { ReconciliationLog, ReconciliationStatus } from "../domain/reconciliation-entity";
import type { BaseDocument } from "@/lib/database/types";

interface ReconciliationLogDocument extends BaseDocument {
  referenceNumber: string;
  type: string;
  status: string;
  walletId?: string;
  orderId?: string;
  walletBalanceCents?: number;
  computedLedgerBalanceCents?: number;
  differenceCents?: number;
  notes?: string;
  details?: Record<string, unknown>;
  reconciledBy: string;
  reconciledAt: Date;
}

function mapToDomain(doc: any): ReconciliationLog {
  return {
    id: doc.id ?? doc._id?.toString(),
    referenceNumber: doc.referenceNumber ?? `REC-${doc._id?.toString().slice(-6).toUpperCase()}`,
    type: doc.type,
    status: doc.status as ReconciliationStatus,
    walletId: doc.walletId,
    orderId: doc.orderId,
    walletBalanceCents: doc.walletBalanceCents ?? 0,
    computedLedgerBalanceCents: doc.computedLedgerBalanceCents ?? 0,
    differenceCents: doc.differenceCents ?? 0,
    notes: doc.notes,
    details: doc.details,
    reconciledBy: doc.reconciledBy ?? "system",
    reconciledAt: doc.reconciledAt ? new Date(doc.reconciledAt) : new Date(),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted,
    metadata: doc.metadata,
  };
}

export class ReconciliationRepository extends BaseRepository<
  ReconciliationLogDocument,
  ReconciliationLog
> {
  constructor() {
    super(ReconciliationLogModel as any, mapToDomain);
  }

  async findRecentLogs(limit: number = 50): Promise<ReconciliationLog[]> {
    const docs = await ReconciliationLogModel.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return docs.map((d: any) => mapToDomain({ ...d, id: d._id.toString() }));
  }

  async countUnreconciled(): Promise<number> {
    return ReconciliationLogModel.countDocuments({
      status: { $in: ["mismatch", "warning", "missing_ledger"] },
    });
  }
}

export default ReconciliationRepository;
