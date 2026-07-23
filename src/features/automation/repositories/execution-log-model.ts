import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";
import type { BaseDocument } from "@/lib/database/types";

export interface ExecutionLogDocument extends BaseDocument {
  executionId: string;
  workflowId: string;
  level: string;
  message: string;
  step?: string;
  data?: Record<string, unknown>;
  timestamp: Date;
}

const { status: _baseStatus, ...baseRest } = baseFieldsDefinition;

const ExecutionLogSchema = new Schema({
  executionId: { type: String, required: true, index: true },
  workflowId: { type: String, required: true, index: true },
  level: { type: String, required: true, enum: ["info", "warn", "error", "debug"] },
  message: { type: String, required: true },
  step: String,
  data: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
  ...baseRest,
}, { ...baseSchemaOptions, collection: "execution_logs" });

ExecutionLogSchema.index({ executionId: 1, timestamp: 1 });
ExecutionLogSchema.index({ workflowId: 1, level: 1 });

export const ExecutionLogModel = mongoose.models.ExecutionLog
  || mongoose.model<ExecutionLogDocument>("ExecutionLog", ExecutionLogSchema);
