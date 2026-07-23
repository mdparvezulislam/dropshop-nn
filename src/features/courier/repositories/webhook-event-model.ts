import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";

const { status: baseStatus, ...otherBaseFields } = baseFieldsDefinition;

const webhookEventSchema = new Schema(
  {
    provider: { type: String, required: true, index: true },
    event: { type: String, required: true, index: true },
    payload: { type: Schema.Types.Mixed, required: true },
    processed: { type: Boolean, default: false, index: true },
    retryCount: { type: Number, default: 0 },
    error: { type: String, default: null },
    processedAt: { type: Date, default: null },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "courier_webhook_events" },
);

webhookEventSchema.index({ createdAt: -1 });

export const WebhookEventModel =
  mongoose.models.WebhookEvent || mongoose.model("WebhookEvent", webhookEventSchema);
export default WebhookEventModel;
