import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/lib/database/base-schema";
import { BaseDocument } from "@/lib/database/types";

export interface StoreSocialLinksDB {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  whatsapp?: string;
  telegram?: string;
}

export interface StoreProfileDBFields {
  businessProfileId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  storeName: string;
  storeSlug: string;
  storeLogo?: string;
  storeBanner?: string;
  theme?: string;
  color?: string;
  description?: string;
  contactPhone?: string;
  contactEmail?: string;
  socialLinks?: StoreSocialLinksDB;
}

export type StoreProfileDocument = BaseDocument & StoreProfileDBFields;

const storeSocialLinksSchema = new Schema<StoreSocialLinksDB>(
  {
    facebook: { type: String, required: false },
    instagram: { type: String, required: false },
    youtube: { type: String, required: false },
    whatsapp: { type: String, required: false },
    telegram: { type: String, required: false },
  },
  { _id: false },
);

const { status: _, ...storeBaseFields } = baseFieldsDefinition;

const storeProfileSchema = new Schema<StoreProfileDocument>(
  {
    businessProfileId: {
      type: Schema.Types.ObjectId,
      ref: "BusinessProfile",
      required: true,
      unique: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    storeName: { type: String, required: true },
    storeSlug: { type: String, required: true, unique: true, index: true },
    storeLogo: { type: String, required: false },
    storeBanner: { type: String, required: false },
    theme: { type: String, required: false },
    color: { type: String, required: false },
    description: { type: String, required: false },
    contactPhone: { type: String, required: false },
    contactEmail: { type: String, required: false },
    socialLinks: { type: storeSocialLinksSchema, required: false },
    ...storeBaseFields,
  },
  baseSchemaOptions,
);

storeProfileSchema.plugin(softDeletePlugin);

export const StoreProfileModel =
  mongoose.models.StoreProfile ||
  mongoose.model<StoreProfileDocument>("StoreProfile", storeProfileSchema);
export default StoreProfileModel;
