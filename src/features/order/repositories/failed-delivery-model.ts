import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";

const failedDeliverySchema = new Schema(
  {
    orderId: { type: String, required: true, index: true },
    orderNumber: { type: String, default: null },
    courierName: { type: String, required: true },
    trackingNumber: { type: String, required: true },
    reason: {
      type: String,
      enum: [
        "customer_not_home",
        "wrong_address",
        "wrong_phone",
        "refused_to_accept",
        "delayed_by_courier",
        "damaged",
        "lost_in_transit",
        "other",
      ],
      required: true,
    },
    attemptCount: { type: Number, default: 1 },
    customerResponse: { type: String, default: null },
    nextAction: {
      type: String,
      enum: [
        "redelivery",
        "cancel",
        "change_address",
        "change_phone",
        "assign_courier",
        "customer_confirmation",
        "return_to_warehouse",
      ],
      required: true,
    },
    notes: { type: String, default: null },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date, default: null },
    resolvedBy: { type: String, default: null },
    ...baseFieldsDefinition,
  },
  { ...baseSchemaOptions, collection: "failed_deliveries" },
);

failedDeliverySchema.index({ resolved: 1, createdAt: -1 });
failedDeliverySchema.index({ courierName: 1 });

export const FailedDeliveryModel = mongoose.model("FailedDelivery", failedDeliverySchema);
export default FailedDeliveryModel;
