import mongoose, { Schema } from "mongoose";
import {
  baseFieldsDefinition,
  baseSchemaOptions,
  softDeletePlugin,
} from "@/lib/database/base-schema";
import type { BaseDocument } from "@/lib/database/types";
import type { UserDBAddressFields } from "../domain/user-address-entity";

export type UserAddressDocument = BaseDocument & UserDBAddressFields;

const { status: _, ...addressBaseFields } = baseFieldsDefinition;

const userAddressSchema = new Schema<UserAddressDocument>(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["home", "office", "warehouse", "custom", "store"],
      required: true,
    },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    division: { type: String, required: true },
    district: { type: String, required: true },
    upazila: { type: String, required: true },
    area: { type: String, required: true },
    postalCode: { type: String, default: null },
    landmark: { type: String, default: null },
    isDefault: { type: Boolean, required: true, default: false },
    ...addressBaseFields,
  },
  { ...baseSchemaOptions, collection: "user_addresses" },
);

userAddressSchema.index({ userId: 1, isDefault: 1 });

userAddressSchema.plugin(softDeletePlugin);

export const UserAddressModel =
  mongoose.models.UserAddress ||
  mongoose.model<UserAddressDocument>("UserAddress", userAddressSchema);
export default UserAddressModel;
