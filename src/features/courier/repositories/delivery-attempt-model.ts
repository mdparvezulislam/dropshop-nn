import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/shared/lib/database/base-schema";

const { status: baseStatus, ...otherBaseFields } = baseFieldsDefinition;

const deliveryAttemptSchema = new Schema(
  {
    shipmentId: { type: String, required: true, index: true },
    orderId: { type: String, required: true, index: true },
    attemptNumber: { type: Number, required: true },
    courier: { type: String, required: true },
    deliveryAgent: {
      name: { type: String },
      phone: { type: String },
      agentId: { type: String },
    },
    attemptTime: { type: Date, required: true, default: Date.now },
    status: { type: String, required: true, default: "attempted" },
    failureReason: { type: String },
    customerResponse: { type: String },
    notes: { type: String },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "delivery_attempts" },
);

export const DeliveryAttemptModel =
  mongoose.models.DeliveryAttempt || mongoose.model("DeliveryAttempt", deliveryAttemptSchema);
export default DeliveryAttemptModel;
