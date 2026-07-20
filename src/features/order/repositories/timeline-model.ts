import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/shared/lib/database/base-schema";

const timelineEntrySchema = new Schema(
  {
    entityType: {
      type: String,
      enum: ["order", "order_item"],
      required: true,
      index: true,
    },
    entityId: { type: String, required: true, index: true },
    eventType: { type: String, required: true },
    action: { type: String, required: true, index: true },
    summary: { type: String, required: true },
    fromStatus: { type: String, default: null },
    toStatus: { type: String, default: null },
    actor: {
      id: { type: String },
      name: { type: String },
      role: { type: String },
    },
    changes: [{
      field: { type: String, required: true },
      oldValue: { type: Schema.Types.Mixed },
      newValue: { type: Schema.Types.Mixed },
    }],
    correlationId: { type: String, default: null },
    ...baseFieldsDefinition,
  },
  { ...baseSchemaOptions, collection: "order_timeline" },
);

timelineEntrySchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
timelineEntrySchema.index({ action: 1, createdAt: -1 });
timelineEntrySchema.index({ correlationId: 1 });

export const TimelineEntryModel = mongoose.model("TimelineEntry", timelineEntrySchema);
