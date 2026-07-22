import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/shared/lib/database/base-schema";

const checklistItemSchema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const commentSchema = new Schema({
  id: { type: String, required: true },
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  mentions: [{ type: String }],
});

const taskSchema = new Schema(
  {
    ...baseFieldsDefinition,
    orderId: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: null },
    status: {
      type: String,
      enum: ["open", "in_progress", "completed", "cancelled"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    assignedTo: { type: String, default: null },
    assignedToName: { type: String, default: null },
    dueDate: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    checklist: [checklistItemSchema],
    comments: [commentSchema],
  },
  { ...baseSchemaOptions, collection: "order_internal_tasks" },
);

taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ status: 1, priority: 1 });
taskSchema.index({ dueDate: 1 });

export const TaskModel = mongoose.model("InternalTask", taskSchema);
export default TaskModel;
