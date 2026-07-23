import { BaseRepository } from "@/lib/database/generic-repository";
import { MetricBucketModel, type MetricBucketMongoDocument } from "./metric-bucket-model";
import type { MetricBucket, MetricGranularity } from "../domain/analytics-entity";

function mapDimensions(dims: any): Record<string, string> {
  if (!dims) return {};
  if (dims instanceof Map) return Object.fromEntries(dims.entries());
  if (typeof dims === "object") return { ...dims };
  return {};
}

function mapBucket(doc: any): MetricBucket {
  return {
    id: doc._id?.toString?.() ?? doc.id,
    metricKey: doc.metricKey,
    granularity: doc.granularity,
    bucketStart: doc.bucketStart,
    dimensions: mapDimensions(doc.dimensions),
    count: doc.count ?? 0,
    sum: doc.sum ?? 0,
    min: doc.min,
    max: doc.max,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted ?? false,
    status: doc.status ?? "active",
  };
}

export class MetricBucketRepository extends BaseRepository<
  MetricBucketMongoDocument,
  MetricBucket
> {
  constructor() {
    super(MetricBucketModel as any, mapBucket);
  }

  async increment(
    metricKey: string,
    granularity: MetricGranularity,
    bucketStart: Date,
    amount: number,
    dimensions: Record<string, string> = {},
  ): Promise<void> {
    const dimEntries = Object.entries(dimensions).sort(([a], [b]) => a.localeCompare(b));
    const dimFilter: Record<string, string> = {};
    for (const [k, v] of dimEntries) dimFilter[`dimensions.${k}`] = v;

    await MetricBucketModel.findOneAndUpdate(
      {
        metricKey,
        granularity,
        bucketStart,
        ...dimFilter,
        isDeleted: { $ne: true },
      },
      {
        $inc: { count: 1, sum: amount || 0 },
        $min: amount ? { min: amount } : {},
        $max: amount ? { max: amount } : {},
        $setOnInsert: {
          metricKey,
          granularity,
          bucketStart,
          dimensions,
          isDeleted: false,
          status: "active",
        },
      },
      { upsert: true, new: true },
    );
  }

  async queryRange(
    metricKey: string,
    granularity: MetricGranularity,
    from: Date,
    to: Date,
  ): Promise<MetricBucket[]> {
    const docs = await MetricBucketModel.find({
      metricKey,
      granularity,
      bucketStart: { $gte: from, $lte: to },
      isDeleted: { $ne: true },
    })
      .sort({ bucketStart: 1 })
      .lean();
    return docs.map(mapBucket);
  }
}

export default MetricBucketRepository;
