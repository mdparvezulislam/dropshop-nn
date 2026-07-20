import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { LedgerEntryModel } from "./ledger-model";
import type { LedgerEntry, LedgerEntryType, LedgerEntryStatus } from "../domain/ledger-entity";
import type { BaseDocument } from "@/shared/lib/database/types";

interface LedgerEntryDocument extends BaseDocument {
  walletId: string;
  amount: number;
  type: string;
  status: string;
  referenceType?: string;
  referenceId?: string;
  clearsAt?: Date;
}

function mapToDomain(doc: any): LedgerEntry {
  return {
    id: doc.id ?? doc._id.toString(),
    walletId: doc.walletId.toString(),
    amount: doc.amount,
    type: doc.type as LedgerEntryType,
    status: doc.status as LedgerEntryStatus,
    referenceType: doc.referenceType,
    referenceId: doc.referenceId,
    clearsAt: doc.clearsAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted,
    metadata: doc.metadata,
  };
}

export class LedgerRepository extends BaseRepository<LedgerEntryDocument, LedgerEntry> {
  constructor() {
    super(LedgerEntryModel as any, mapToDomain);
  }

  async findByWalletId(walletId: string): Promise<LedgerEntry[]> {
    return this.find({ walletId });
  }

  async findPendingClearances(now: Date = new Date()): Promise<LedgerEntry[]> {
    return this.find({
      status: "pending",
      clearsAt: { $lte: now },
    });
  }
}

export default LedgerRepository;
