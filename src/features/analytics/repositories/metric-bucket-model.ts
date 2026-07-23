import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/lib/database/base-schema";
import type { BaseDocument } from "@/lib/database/types";

const { status: _, ...baseFields } = baseFieldsDefinition;

const metricBucketSchema = new Schema(
  {
    metricKey: { type: String, required: true, index: true },
    granularity: {
      type: String,
      enum: ["hour", "day", "week", "month"],
      required: true,
      index: true,
    },
    bucketStart: { type: Date, required: true, index: true },
    dimensions: { type: Map, of: String, default: () => new Map() },
    count: { type: Number, default: 0 },
    sum: { type: Number, default: 0 },
    min: { type: Number },
    max: { type: Number },
    ...baseFields,
  },
  { ...baseSchemaOptions, collection: "analytics_metric_buckets" },
);

metricBucketSchema.index(
  { metricKey: 1, granularity: 1, bucketStart: 1, dimensions: 1 },
  { unique: true },
);
metricBucketSchema.index({ metricKey: 1, bucketStart: -1 });

metricBucketSchema.plugin(softDeletePlugin);

export type MetricBucketMongoDocument = BaseDocument & {
  metricKey: string;
  granularity: string;
  bucketStart: Date;
  dimensions: Map<string, string> | Record<string, string>;
  count: number;
  sum: number;
  min?: number;
  max?: number;
};

export const MetricBucketModel =
  mongoose.models.AnalyticsMetricBucket ||
  mongoose.model<MetricBucketMongoDocument>("AnalyticsMetricBucket", metricBucketSchema);

export default MetricBucketModel;
