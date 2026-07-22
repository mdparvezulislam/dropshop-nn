import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/shared/lib/database/base-schema";

const staffAssignmentSchema = new Schema(
  {
    orderId: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true },
    staffId: { type: String, required: true },
    staffName: { type: String, required: true },
    role: {
      type: String,
      enum: ["picker", "packer", "courier_manager", "customer_support", "manager"],
      required: true,
    },
    assignedBy: { type: String, required: true },
    assignedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    notes: { type: String, default: null },
    ...baseFieldsDefinition,
  },
  { ...baseSchemaOptions, collection: "order_staff_assignments" },
);

staffAssignmentSchema.index({ staffId: 1, role: 1 });
staffAssignmentSchema.index({ role: 1, createdAt: -1 });

export const StaffAssignmentModel = mongoose.model(
  "StaffAssignment",
  staffAssignmentSchema,
);
export default StaffAssignmentModel;
