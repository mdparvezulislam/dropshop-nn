import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { DailySnapshotModel } from "./daily-snapshot-model";
import { MonthlySnapshotModel } from "./monthly-snapshot-model";
import type { DailySnapshot, MonthlySnapshot } from "../domain/closing-snapshot-entity";
import type { BaseDocument } from "@/shared/lib/database/types";

function mapDailyToDomain(doc: any): DailySnapshot {
  return {
    id: doc.id ?? doc._id?.toString(),
    snapshotDate: doc.snapshotDate,
    openingBalanceCents: doc.openingBalanceCents,
    closingBalanceCents: doc.closingBalanceCents,
    revenueCents: doc.revenueCents,
    profitCents: doc.profitCents,
    withdrawalsCents: doc.withdrawalsCents,
    depositsCents: doc.depositsCents,
    refundsCents: doc.refundsCents,
    totalTransactionsCount: doc.totalTransactionsCount,
    reconciled: doc.reconciled ?? true,
    lockedAt: doc.lockedAt ? new Date(doc.lockedAt) : new Date(),
    createdBy: doc.createdBy ?? "system",
    notes: doc.notes,
    status: doc.status ?? "cleared",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted,
    metadata: doc.metadata,
  };
}

function mapMonthlyToDomain(doc: any): MonthlySnapshot {
  return {
    id: doc.id ?? doc._id?.toString(),
    monthKey: doc.monthKey,
    openingBalanceCents: doc.openingBalanceCents,
    closingBalanceCents: doc.closingBalanceCents,
    grossRevenueCents: doc.grossRevenueCents,
    netRevenueCents: doc.netRevenueCents,
    grossProfitCents: doc.grossProfitCents,
    netProfitCents: doc.netProfitCents,
    withdrawalsCents: doc.withdrawalsCents,
    depositsCents: doc.depositsCents,
    refundLossCents: doc.refundLossCents,
    commissionCents: doc.commissionCents,
    platformEarningsCents: doc.platformEarningsCents,
    reconciled: doc.reconciled ?? true,
    lockedAt: doc.lockedAt ? new Date(doc.lockedAt) : new Date(),
    createdBy: doc.createdBy ?? "system",
    notes: doc.notes,
    status: doc.status ?? "cleared",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted,
    metadata: doc.metadata,
  };
}

export class SnapshotRepository {
  async findDailyByDate(snapshotDate: string): Promise<DailySnapshot | null> {
    const doc = await DailySnapshotModel.findOne({ snapshotDate, isDeleted: { $ne: true } }).lean();
    return doc ? mapDailyToDomain({ ...doc, id: doc._id.toString() }) : null;
  }

  async createDaily(data: Omit<DailySnapshot, "id" | "createdAt" | "updatedAt" | "isDeleted">): Promise<DailySnapshot> {
    const doc = await DailySnapshotModel.create(data);
    return mapDailyToDomain(doc.toObject());
  }

  async listDailySnapshots(limit: number = 30): Promise<DailySnapshot[]> {
    const docs = await DailySnapshotModel.find({ isDeleted: { $ne: true } })
      .sort({ snapshotDate: -1 })
      .limit(limit)
      .lean();
    return docs.map((d: any) => mapDailyToDomain({ ...d, id: d._id.toString() }));
  }

  async findMonthlyByKey(monthKey: string): Promise<MonthlySnapshot | null> {
    const doc = await MonthlySnapshotModel.findOne({ monthKey, isDeleted: { $ne: true } }).lean();
    return doc ? mapMonthlyToDomain({ ...doc, id: doc._id.toString() }) : null;
  }

  async createMonthly(data: Omit<MonthlySnapshot, "id" | "createdAt" | "updatedAt" | "isDeleted">): Promise<MonthlySnapshot> {
    const doc = await MonthlySnapshotModel.create(data);
    return mapMonthlyToDomain(doc.toObject());
  }

  async listMonthlySnapshots(limit: number = 24): Promise<MonthlySnapshot[]> {
    const docs = await MonthlySnapshotModel.find({ isDeleted: { $ne: true } })
      .sort({ monthKey: -1 })
      .limit(limit)
      .lean();
    return docs.map((d: any) => mapMonthlyToDomain({ ...d, id: d._id.toString() }));
  }
}

export default SnapshotRepository;
