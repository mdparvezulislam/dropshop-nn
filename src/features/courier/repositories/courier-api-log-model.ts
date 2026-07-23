import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";

const { status: baseStatus, ...otherBaseFields } = baseFieldsDefinition;

const courierApiLogSchema = new Schema(
  {
    provider: { type: String, required: true, index: true },
    logType: { type: String, required: true, index: true },
    endpoint: { type: String, required: true },
    requestPayload: { type: Schema.Types.Mixed },
    responsePayload: { type: Schema.Types.Mixed },
    statusCode: { type: Number },
    responseTimeMs: { type: Number },
    success: { type: Boolean, required: true, default: true },
    errorMessage: { type: String },
    timestamp: { type: Date, required: true, default: Date.now, index: true },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "courier_api_logs" },
);

export const CourierApiLogModel =
  mongoose.models.CourierApiLog || mongoose.model("CourierApiLog", courierApiLogSchema);
export default CourierApiLogModel;
