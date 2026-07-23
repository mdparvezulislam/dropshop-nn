import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/shared/lib/database/base-schema";
import type { BaseDocument } from "@/shared/lib/database/types";

export interface WorkflowVersionDocument extends BaseDocument {
  workflowId: string;
  version: number;
  definition: Record<string, unknown>;
  changelog?: string;
  publishedBy?: string;
}

const { status: _baseStatus, ...baseRest } = baseFieldsDefinition;

const WorkflowVersionSchema = new Schema({
  workflowId: { type: String, required: true, index: true },
  version: { type: Number, required: true },
  definition: { type: Schema.Types.Mixed, required: true },
  changelog: String,
  publishedBy: String,
  ...baseRest,
}, { ...baseSchemaOptions, collection: "workflow_versions" });

WorkflowVersionSchema.index({ workflowId: 1, version: 1 }, { unique: true });

export const WorkflowVersionModel = mongoose.models.WorkflowVersion
  || mongoose.model<WorkflowVersionDocument>("WorkflowVersion", WorkflowVersionSchema);
