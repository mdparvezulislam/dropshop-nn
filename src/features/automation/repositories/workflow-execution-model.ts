import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";
import type { BaseDocument } from "@/lib/database/types";

export interface WorkflowExecutionDocument extends BaseDocument {
  workflowId: string;
  workflowKey: string;
  workflowName: string;
  workflowVersion: number;
  trigger: string;
  status: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  context: Record<string, unknown>;
  currentStep?: string;
  steps: Record<string, unknown>[];
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  error?: Record<string, unknown>;
  retryCount: number;
  maxRetries: number;
  initiatedBy?: string;
  correlationId?: string;
}

const ExecutionStepSchema = new Schema({
  id: { type: String, required: true },
  stepId: String, name: String, type: String,
  status: { type: String, enum: ["pending", "running", "completed", "failed", "cancelled", "retrying", "paused", "timeout"], default: "pending" },
  startedAt: Date, completedAt: Date, duration: Number,
  input: { type: Schema.Types.Mixed },
  output: { type: Schema.Types.Mixed },
  error: { code: String, message: String, details: { type: Schema.Types.Mixed }, stack: String, timestamp: Date },
  retryCount: { type: Number, default: 0 },
}, { _id: false });

const { status: _baseStatus, ...baseRest } = baseFieldsDefinition;

const WorkflowExecutionSchema = new Schema({
  workflowId: { type: String, required: true, index: true },
  workflowKey: { type: String, required: true },
  workflowName: { type: String, required: true },
  workflowVersion: { type: Number, required: true },
  trigger: { type: String, required: true, enum: ["event", "schedule", "manual", "webhook", "api"] },
  status: { type: String, required: true, enum: ["pending", "running", "completed", "failed", "cancelled", "retrying", "paused", "timeout"], default: "pending" },
  input: { type: Schema.Types.Mixed, default: {} },
  output: { type: Schema.Types.Mixed, default: {} },
  context: { type: Schema.Types.Mixed, default: {} },
  currentStep: String,
  steps: [ExecutionStepSchema],
  startedAt: Date, completedAt: Date, duration: Number,
  error: { code: String, message: String, details: { type: Schema.Types.Mixed }, stack: String, timestamp: Date },
  retryCount: { type: Number, default: 0 },
  maxRetries: { type: Number, default: 3 },
  initiatedBy: String,
  correlationId: String,
  ...baseRest,
}, { ...baseSchemaOptions, collection: "workflow_executions" });

WorkflowExecutionSchema.index({ status: 1 });
WorkflowExecutionSchema.index({ workflowId: 1, createdAt: -1 });
WorkflowExecutionSchema.index({ correlationId: 1 });

export const WorkflowExecutionModel = mongoose.models.WorkflowExecution
  || mongoose.model<WorkflowExecutionDocument>("WorkflowExecution", WorkflowExecutionSchema);
