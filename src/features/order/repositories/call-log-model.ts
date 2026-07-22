import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/shared/lib/database/base-schema";

const callLogSchema = new Schema(
  {
    orderId: { type: String, required: true, index: true },
    orderNumber: { type: String, default: null },
    customerId: { type: String, default: null },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    staffId: { type: String, required: true },
    staffName: { type: String, required: true },
    duration: { type: Number, default: 0 },
    outcome: {
      type: String,
      enum: [
        "reached", "not_reached", "busy", "switched_off",
        "wrong_number", "call_back_later", "completed",
      ],
      required: true,
    },
    notes: { type: String, default: null },
    nextFollowUpAt: { type: Date, default: null },
    callTime: { type: Date, required: true },
    ...baseFieldsDefinition,
  },
  { ...baseSchemaOptions, collection: "order_call_logs" },
);

callLogSchema.index({ orderId: 1, callTime: -1 });
callLogSchema.index({ staffId: 1, callTime: -1 });
callLogSchema.index({ callTime: -1 });

export const CallLogModel = mongoose.model("CallLog", callLogSchema);
export default CallLogModel;
