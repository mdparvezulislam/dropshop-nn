import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";

const complaintTimelineEntrySchema = new Schema(
  {
    id: { type: String, required: true },
    eventType: { type: String, required: true },
    summary: { type: String, required: true },
    actorId: { type: String, default: null },
    actorName: { type: String, default: null },
    timestamp: { type: Date, required: true },
  },
  { _id: false },
);

const { status: _baseStatus, ...baseRest } = baseFieldsDefinition;

const complaintSchema = new Schema(
  {
    complaintNumber: { type: String, required: true, unique: true },
    orderId: { type: String, required: true, index: true },
    orderNumber: { type: String, default: null },
    customerId: { type: String, default: null },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "wrong_product",
        "damaged_product",
        "missing_item",
        "courier_delay",
        "late_delivery",
        "refund_issue",
        "warranty_issue",
        "exchange_issue",
        "payment_issue",
        "other",
      ],
      required: true,
    },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed", "escalated"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    assignedTo: { type: String, default: null },
    assignedToName: { type: String, default: null },
    resolution: { type: String, default: null },
    resolvedAt: { type: Date, default: null },
    resolvedBy: { type: String, default: null },
    internalNote: { type: String, default: null },
    timeline: { type: [complaintTimelineEntrySchema], default: [] },
    ...baseRest,
  },
  { ...baseSchemaOptions, collection: "customer_complaints" },
);

complaintSchema.index({ status: 1, priority: 1 });
complaintSchema.index({ assignedTo: 1, status: 1 });
complaintSchema.index({ createdAt: -1 });

export const ComplaintModel = mongoose.model("Complaint", complaintSchema);
export default ComplaintModel;
