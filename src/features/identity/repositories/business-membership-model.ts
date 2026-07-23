import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions, softDeletePlugin } from "@/lib/database/base-schema";
import { BaseDocument } from "@/lib/database/types";

export interface BusinessMembershipDBFields {
  userId: string;
  membershipType: string;
  status: "active" | "suspended" | "expired";
  grantedAt: Date;
  grantedBy: string;
  expiresAt?: Date | null;
  suspendedAt?: Date | null;
  suspensionReason?: string | null;
}

export type BusinessMembershipDocument = BaseDocument & BusinessMembershipDBFields;

const { status: _, ...membershipBaseFields } = baseFieldsDefinition;

const businessMembershipSchema = new Schema<BusinessMembershipDocument>(
  {
    userId: { type: String, required: true, index: true },
    membershipType: { type: String, required: true, index: true },
    status: { type: String, enum: ["active", "suspended", "expired"], default: "active", index: true },
    grantedAt: { type: Date, default: Date.now, required: true },
    grantedBy: { type: String, required: true },
    expiresAt: { type: Date, default: null, required: false },
    suspendedAt: { type: Date, default: null, required: false },
    suspensionReason: { type: String, default: null, required: false },
    ...membershipBaseFields,
  },
  baseSchemaOptions,
);

businessMembershipSchema.plugin(softDeletePlugin);
businessMembershipSchema.index({ userId: 1, membershipType: 1 }, { unique: true });

export const BusinessMembershipModel =
  mongoose.models.BusinessMembership ||
  mongoose.model<BusinessMembershipDocument>("BusinessMembership", businessMembershipSchema);

export default BusinessMembershipModel;
