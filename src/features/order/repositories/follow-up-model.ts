import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";

const { status: _baseStatus, ...baseRest } = baseFieldsDefinition;

const followUpSchema = new Schema(
  {
    orderId: { type: String, required: true, index: true },
    orderNumber: { type: String, default: null },
    customerId: { type: String, default: null },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    type: {
      type: String,
      enum: ["call", "message", "delivery_reminder", "payment_reminder", "custom"],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: null },
    status: {
      type: String,
      enum: ["pending", "completed", "skipped", "cancelled"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    assignedTo: { type: String, default: null },
    assignedToName: { type: String, default: null },
    dueDate: { type: Date, required: true, index: true },
    completedAt: { type: Date, default: null },
    completedBy: { type: String, default: null },
    notes: { type: String, default: null },
    isRecurring: { type: Boolean, default: false },
    recurringInterval: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      default: null,
    },
    ...baseRest,
  },
  { ...baseSchemaOptions, collection: "order_follow_ups" },
);

followUpSchema.index({ assignedTo: 1, status: 1 });
followUpSchema.index({ status: 1, dueDate: 1 });

export const FollowUpModel = mongoose.model("FollowUp", followUpSchema);
export default FollowUpModel;
