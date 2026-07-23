import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";

const activityLogSchema = new Schema(
  {
    entityType: {
      type: String,
      enum: ["order", "return", "warranty", "exchange", "invoice"],
      required: true,
      index: true,
    },
    entityId: { type: String, required: true, index: true },
    action: { type: String, required: true },
    summary: { type: String, required: true },
    actorId: { type: String, default: null },
    actorName: { type: String, default: null },
    actorRole: { type: String, default: null },
    oldValue: { type: Schema.Types.Mixed, default: null },
    newValue: { type: Schema.Types.Mixed, default: null },
    ...baseFieldsDefinition,
  },
  { ...baseSchemaOptions, collection: "order_activity_logs" },
);

activityLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

export const ActivityLogModel = mongoose.model("ActivityLog", activityLogSchema);
export default ActivityLogModel;
