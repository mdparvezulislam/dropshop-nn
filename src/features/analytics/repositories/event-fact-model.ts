import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/lib/database/base-schema";
import type { BaseDocument } from "@/lib/database/types";

const { status: _, metadata: __, ...baseFields } = baseFieldsDefinition;

const eventFactSchema = new Schema(
  {
    eventId: { type: String, required: true, index: true },
    eventName: { type: String, required: true, index: true },
    timestamp: { type: Date, required: true, index: true },
    actorId: { type: String, index: true },
    actorRole: { type: String, index: true },
    sessionId: { type: String, index: true },
    requestId: { type: String },
    source: { type: String, required: true },
    module: { type: String, required: true, index: true },
    entityType: { type: String, index: true },
    entityId: { type: String, index: true },
    value: { type: Number },
    currency: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
    idempotencyKey: { type: String, index: true },
    ...baseFields,
  },
  { ...baseSchemaOptions, collection: "analytics_event_facts" },
);

eventFactSchema.index({ eventName: 1, timestamp: -1 });
eventFactSchema.index({ module: 1, timestamp: -1 });
eventFactSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });
eventFactSchema.index({ sessionId: 1, timestamp: -1 });

eventFactSchema.plugin(softDeletePlugin);

export type EventFactMongoDocument = BaseDocument & {
  eventId: string;
  eventName: string;
  timestamp: Date;
  actorId?: string;
  actorRole?: string;
  sessionId?: string;
  requestId?: string;
  source: string;
  module: string;
  entityType?: string;
  entityId?: string;
  value?: number;
  currency?: string;
  metadata: Record<string, unknown>;
  idempotencyKey?: string;
};

export const EventFactModel =
  mongoose.models.AnalyticsEventFact ||
  mongoose.model<EventFactMongoDocument>("AnalyticsEventFact", eventFactSchema);

export default EventFactModel;
