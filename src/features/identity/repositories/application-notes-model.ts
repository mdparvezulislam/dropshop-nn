import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";
import { BaseDocument } from "@/lib/database/types";

export interface NoteDBFields {
  applicationId: string;
  authorId: string;
  authorName: string;
  note: string;
  isInternal: boolean;
}

export type NoteDocument = BaseDocument & NoteDBFields;

const noteSchema = new Schema<NoteDocument>(
  {
    applicationId: { type: String, required: true, index: true },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    note: { type: String, required: true },
    isInternal: { type: Boolean, default: true, required: true },
    ...baseFieldsDefinition,
  },
  baseSchemaOptions,
);

export const ApplicationNotesModel =
  mongoose.models.ApplicationNotes ||
  mongoose.model<NoteDocument>("ApplicationNotes", noteSchema);

export default ApplicationNotesModel;
