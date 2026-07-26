import { BaseRepository } from "@/lib/database/generic-repository";
import { AnalyticsSnapshotModel, type AnalyticsSnapshotDocument } from "./analytics-snapshot-model";
import type { AnalyticsSnapshot } from "../domain/analytics-entity";

function mapSnapshot(doc: any): AnalyticsSnapshot {
  return {
    id: doc._id?.toString?.() ?? doc._id?.toString() ?? "",
    snapshotDate: doc.snapshotDate,
    type: doc.type as "daily" | "monthly" | "yearly",
    data: doc.data ?? {},
    metrics: Object.fromEntries(
      (doc.metrics instanceof Map ? doc.metrics : new Map()) as Map<string, number>,
    ),
    dimensions: Object.fromEntries(
      (doc.dimensions instanceof Map ? doc.dimensions : new Map()) as Map<string, string>,
    ),
    immutable: doc.immutable ?? false,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted ?? false,
    status: doc.status ?? "active",
  };
}

export class AnalyticsSnapshotRepository extends BaseRepository<
  AnalyticsSnapshotDocument,
  AnalyticsSnapshot
> {
  constructor() {
    super(AnalyticsSnapshotModel as any, mapSnapshot);
  }

  async findLatestByType(type: "daily" | "monthly" | "yearly"): Promise<AnalyticsSnapshot | null> {
    const docs = await AnalyticsSnapshotModel.find({ type, isDeleted: { $ne: true } })
      .sort({ snapshotDate: -1 })
      .limit(1)
      .lean();
    return docs.length > 0 ? mapSnapshot(docs[0] as any) : null;
  }

  async findByDateRange(
    type: "daily" | "monthly" | "yearly",
    from: Date,
    to: Date,
  ): Promise<AnalyticsSnapshot[]> {
    const docs = await AnalyticsSnapshotModel.find({
      type,
      snapshotDate: { $gte: from, $lte: to },
      isDeleted: { $ne: true },
    })
      .sort({ snapshotDate: 1 })
      .lean();
    return docs.map((d) => mapSnapshot(d as any));
  }

  async markImmutable(id: string): Promise<void> {
    await AnalyticsSnapshotModel.findByIdAndUpdate(id, { immutable: true });
  }
}

export default AnalyticsSnapshotRepository;
