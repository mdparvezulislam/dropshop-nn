import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";
import type { BaseDocument } from "@/lib/database/types";
import type { WorkflowStep } from "../domain/automation-entity";

export interface WorkflowDocument extends BaseDocument {
  name: string;
  key: string;
  description?: string;
  category: string;
  version: number;
  trigger: Record<string, unknown>;
  rules: Record<string, unknown>[];
  steps: Record<string, unknown>[];
  tags: string[];
  settings: Record<string, unknown>;
  lastRunAt?: Date;
  lastRunStatus?: string;
  totalRuns: number;
  totalFailures: number;
  averageDuration: number;
}

const WorkflowStepSchema = new Schema<WorkflowStep>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ["condition", "action", "delay", "branch"] },
    ruleId: String,
    actionId: String,
    config: { type: Schema.Types.Mixed, default: {} },
    order: { type: Number, required: true },
    children: [{ type: Schema.Types.Mixed }],
  },
  { _id: false },
);

const { status: _baseStatus, ...baseRest } = baseFieldsDefinition;

const WorkflowDefinitionSchema = new Schema(
  {
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true, lowercase: true },
    description: String,
    category: {
      type: String,
      required: true,
      enum: [
        "notification",
        "logistics",
        "finance",
        "inventory",
        "order",
        "cms",
        "analytics",
        "communication",
        "webhook",
        "system",
      ],
    },
    status: {
      type: String,
      required: true,
      enum: ["draft", "active", "paused", "archived"],
      default: "draft",
    },
    version: { type: Number, required: true, default: 1 },
    trigger: {
      type: {
        type: String,
        required: true,
        enum: ["event", "schedule", "manual", "webhook", "api"],
      },
      eventType: String,
      cron: String,
      webhookUrl: String,
      apiEndpoint: String,
      filters: { type: Schema.Types.Mixed },
    },
    rules: [
      {
        id: String,
        name: String,
        conditions: [
          {
            field: String,
            operator: {
              type: String,
              enum: [
                "eq",
                "neq",
                "gt",
                "gte",
                "lt",
                "lte",
                "in",
                "nin",
                "contains",
                "startsWith",
                "endsWith",
                "exists",
                "regex",
              ],
            },
            value: Schema.Types.Mixed,
            source: { type: String, enum: ["event", "context", "payload", "system"] },
          },
        ],
        logicalOperator: { type: String, enum: ["and", "or", "not"] },
        actions: [
          {
            id: String,
            type: {
              type: String,
              enum: [
                "send_notification",
                "send_email",
                "send_sms",
                "create_shipment",
                "update_order",
                "update_inventory",
                "create_wallet_transaction",
                "generate_invoice",
                "generate_report",
                "trigger_analytics_event",
                "execute_webhook",
                "delay",
                "wait",
                "branch",
                "stop_workflow",
              ],
            },
            config: { type: Schema.Types.Mixed },
            label: String,
            order: Number,
            retryOnFailure: Boolean,
            maxRetries: Number,
            timeout: Number,
          },
        ],
        priority: Number,
      },
    ],
    steps: [WorkflowStepSchema],
    tags: { type: [String], default: [] },
    settings: {
      maxRetries: { type: Number, default: 3 },
      retryDelay: { type: Number, default: 5000 },
      timeout: { type: Number, default: 300000 },
      concurrency: { type: Number, default: 5 },
      preserveOrder: { type: Boolean, default: true },
      notifyOnFailure: { type: Boolean, default: true },
      notifyOnSuccess: { type: Boolean, default: false },
      notificationRecipients: { type: [String], default: [] },
    },
    lastRunAt: Date,
    lastRunStatus: {
      type: String,
      enum: [
        "completed",
        "failed",
        "running",
        "pending",
        "cancelled",
        "retrying",
        "paused",
        "timeout",
      ],
    },
    totalRuns: { type: Number, default: 0 },
    totalFailures: { type: Number, default: 0 },
    averageDuration: { type: Number, default: 0 },
    ...baseRest,
  },
  { ...baseSchemaOptions, collection: "workflow_definitions" },
);

WorkflowDefinitionSchema.index({ key: 1 }, { unique: true });
WorkflowDefinitionSchema.index({ status: 1 });
WorkflowDefinitionSchema.index({ category: 1, status: 1 });
WorkflowDefinitionSchema.index({ "trigger.type": 1 });
WorkflowDefinitionSchema.index({ "trigger.eventType": 1 });

export const WorkflowDefinitionModel =
  mongoose.models.WorkflowDefinition ||
  mongoose.model<WorkflowDocument>("WorkflowDefinition", WorkflowDefinitionSchema);
