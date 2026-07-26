import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";
import type { BaseDocument } from "@/lib/database/types";

export interface ScheduleJobDocument extends BaseDocument {
  workflowId: string;
  name: string;
  cron: string;
  enabled: boolean;
  lastRunAt?: Date;
  nextRunAt?: Date;
  timezone: string;
  maxRetries: number;
  retryDelay: number;
}

const { status: _baseStatus, ...baseRest } = baseFieldsDefinition;

const ScheduleJobSchema = new Schema(
  {
    workflowId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    cron: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    lastRunAt: Date,
    nextRunAt: Date,
    timezone: { type: String, default: "UTC" },
    maxRetries: { type: Number, default: 3 },
    retryDelay: { type: Number, default: 5000 },
    ...baseRest,
  },
  { ...baseSchemaOptions, collection: "scheduled_jobs" },
);

ScheduleJobSchema.index({ enabled: 1, nextRunAt: 1 });

export const ScheduleJobModel =
  mongoose.models.ScheduleJob ||
  mongoose.model<ScheduleJobDocument>("ScheduleJob", ScheduleJobSchema);
