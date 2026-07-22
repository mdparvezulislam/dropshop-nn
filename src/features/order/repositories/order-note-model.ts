import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/shared/lib/database/base-schema";
import { NOTE_TYPES } from "../domain/note-entity";

const noteSchema = new Schema(
  {
    orderId: { type: String, required: true, index: true },
    type: { type: String, enum: NOTE_TYPES, required: true, index: true },
    content: { type: String, required: true },
    actorId: { type: String, default: null },
    actorName: { type: String, default: null },
    actorRole: { type: String, default: null },
    isPinned: { type: Boolean, default: false },
    ...baseFieldsDefinition,
  },
  { ...baseSchemaOptions, collection: "order_notes" },
);

noteSchema.index({ orderId: 1, createdAt: -1 });
noteSchema.index({ orderId: 1, type: 1 });

export const OrderNoteModel = mongoose.model("OrderNote", noteSchema);
export default OrderNoteModel;
