import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/shared/lib/database/base-schema";
import type { BaseDocument } from "@/shared/lib/database/types";

const { status: sn, metadata: sm, ...baseFields } = baseFieldsDefinition;

const reportChartSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ["area", "bar", "line", "pie", "heatmap"], required: true },
    data: [{ date: String, value: Number, count: Number }],
    config: { type: Schema.Types.Mixed },
  },
  { _id: false },
);

const analyticsReportSchema = new Schema(
  {
    title: { type: String, required: true, index: true },
    description: { type: String },
    type: {
      type: String,
      enum: ["daily", "weekly", "monthly", "quarterly", "yearly", "custom"],
      required: true,
      index: true,
    },
    filters: { type: Schema.Types.Mixed, default: {} },
    data: { type: Schema.Types.Mixed, default: {} },
    metrics: [
      {
        key: String,
        label: String,
        value: Number,
        previousValue: Number,
        changePercent: Number,
        format: { type: String, enum: ["number", "currency", "percent"] },
        currency: String,
      },
    ],
    charts: [reportChartSchema],
    generatedAt: { type: Date, required: true, index: true },
    generatedBy: { type: String },
    format: { type: String, enum: ["csv", "excel", "pdf"], default: "csv" },
    fileUrl: { type: String },
    size: { type: Number },
    schedule: { type: String },
    recipients: [{ type: String }],
    ...baseFields,
  },
  { ...baseSchemaOptions, collection: "analytics_reports" },
);

analyticsReportSchema.index({ type: 1, generatedAt: -1 });
analyticsReportSchema.index({ generatedBy: 1, generatedAt: -1 });
analyticsReportSchema.index({ title: "text", description: "text" });

analyticsReportSchema.plugin(softDeletePlugin);

export type AnalyticsReportDocument = BaseDocument & {
  title: string;
  description?: string;
  type: string;
  filters: Record<string, unknown>;
  data: Record<string, unknown>;
  metrics: {
    key: string;
    label: string;
    value: number;
    previousValue?: number;
    changePercent?: number;
    format?: string;
    currency?: string;
  }[];
  charts: {
    id: string;
    title: string;
    type: string;
    data: { date: string; value: number; count?: number }[];
    config?: Record<string, unknown>;
  }[];
  generatedAt: Date;
  generatedBy?: string;
  format: string;
  fileUrl?: string;
  size?: number;
  schedule?: string;
  recipients?: string[];
};

export const AnalyticsReportModel =
  mongoose.models.AnalyticsReport ||
  mongoose.model<AnalyticsReportDocument>("AnalyticsReport", analyticsReportSchema);

export default AnalyticsReportModel;
