import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/lib/database/base-schema";
import type { BaseDocument } from "@/lib/database/types";

const { status: _, metadata: __, ...baseFields } = baseFieldsDefinition;

const analyticsSnapshotSchema = new Schema(
  {
    snapshotDate: { type: Date, required: true, index: true },
    type: { type: String, enum: ["daily", "monthly", "yearly"], required: true, index: true },
    data: { type: Schema.Types.Mixed, default: {} },
    metrics: { type: Map, of: Number, default: {} },
    dimensions: { type: Map, of: String, default: {} },
    immutable: { type: Boolean, default: false },
    ...baseFields,
  },
  { ...baseSchemaOptions, collection: "analytics_snapshots" },
);

analyticsSnapshotSchema.index({ snapshotDate: -1, type: 1 }, { unique: true });
analyticsSnapshotSchema.index({ type: 1, snapshotDate: -1 });

analyticsSnapshotSchema.plugin(softDeletePlugin);

export type AnalyticsSnapshotDocument = BaseDocument & {
  snapshotDate: Date;
  type: string;
  data: Record<string, unknown>;
  metrics: Map<string, number>;
  dimensions: Map<string, string>;
  immutable: boolean;
};

export const AnalyticsSnapshotModel =
  mongoose.models.AnalyticsSnapshot ||
  mongoose.model<AnalyticsSnapshotDocument>("AnalyticsSnapshot", analyticsSnapshotSchema);

export default AnalyticsSnapshotModel;
