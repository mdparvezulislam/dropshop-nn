import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/shared/lib/database/base-schema";
import { BaseDocument } from "@/shared/lib/database/types";

export interface RuleDBFields {
  name: string;
  description: string;
  ruleType: "reseller" | "wholesale" | "campaign" | "protection" | "visibility";
  conditions: {
    field: string;
    operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "between";
    value: unknown;
  }[];
  actions: {
    type: "reject" | "override" | "validate" | "transform";
    config: Record<string, unknown>;
  }[];
  priority: number;
  isActive: boolean;
  status: string;
  metadata?: Record<string, unknown>;
}

export type RuleDocumentType = BaseDocument & RuleDBFields;

const ruleConditionSchema = new Schema(
  {
    field: { type: String, required: true },
    operator: {
      type: String,
      enum: ["eq", "neq", "gt", "gte", "lt", "lte", "in", "between"],
      required: true,
    },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false },
);

const ruleActionSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["reject", "override", "validate", "transform"],
      required: true,
    },
    config: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false },
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { status: _, ...ruleBaseFields } = baseFieldsDefinition;

const ruleSchema = new Schema<RuleDocumentType>(
  {
    name: { type: String, required: true, maxlength: 200, index: true },
    description: { type: String, default: "", maxlength: 1000 },
    ruleType: {
      type: String,
      enum: ["reseller", "wholesale", "campaign", "protection", "visibility"],
      required: true,
      index: true,
    },
    conditions: {
      type: [ruleConditionSchema],
      required: true,
      validate: [(arr: unknown[]) => arr.length > 0, "At least one condition is required"],
    },
    actions: {
      type: [ruleActionSchema],
      required: true,
      validate: [(arr: unknown[]) => arr.length > 0, "At least one action is required"],
    },
    priority: { type: Number, default: 100, min: 0, max: 1000 },
    isActive: { type: Boolean, default: true, index: true },
    status: { type: String, default: "active", index: true },
    ...ruleBaseFields,
  },
  baseSchemaOptions,
);

ruleSchema.index({ ruleType: 1, isActive: 1, priority: -1 });
ruleSchema.plugin(softDeletePlugin);

export const RuleModel =
  mongoose.models.Rule || mongoose.model<RuleDocumentType>("Rule", ruleSchema);

export default RuleModel;
