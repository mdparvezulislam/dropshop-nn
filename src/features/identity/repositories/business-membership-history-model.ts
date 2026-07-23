import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";
import { BaseDocument } from "@/lib/database/types";

export interface HistoryDBFields {
  userId: string;
  applicationId?: string;
  membershipType: string;
  action:
    | "submitted"
    | "edited"
    | "review_started"
    | "need_info_requested"
    | "approved"
    | "rejected"
    | "suspended"
    | "restored"
    | "membership_assigned"
    | "membership_removed";
  actorId: string;
  actorRole: string;
  previousStatus?: string;
  newStatus?: string;
  note?: string;
}

export type HistoryDocument = BaseDocument & HistoryDBFields;

const historySchema = new Schema<HistoryDocument>(
  {
    userId: { type: String, required: true, index: true },
    applicationId: { type: String, index: true },
    membershipType: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    actorId: { type: String, required: true },
    actorRole: { type: String, required: true },
    previousStatus: { type: String },
    newStatus: { type: String },
    note: { type: String },
    ...baseFieldsDefinition,
  },
  baseSchemaOptions,
);

export const BusinessMembershipHistoryModel =
  mongoose.models.BusinessMembershipHistory ||
  mongoose.model<HistoryDocument>("BusinessMembershipHistory", historySchema);

export default BusinessMembershipHistoryModel;
