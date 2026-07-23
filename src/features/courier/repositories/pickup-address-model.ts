import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";

const { status: baseStatus, ...otherBaseFields } = baseFieldsDefinition;

const pickupAddressSchema = new Schema(
  {
    name: { type: String, required: true },
    isDefault: { type: Boolean, default: false, index: true },
    warehouseId: { type: String, default: null, index: true },
    contactPerson: { type: String, required: true },
    phone: { type: String, required: true },
    alternativePhone: { type: String, default: null },
    district: { type: String, required: true },
    area: { type: String, required: true },
    address: { type: String, required: true },
    instructions: { type: String, default: null },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "pickup_addresses" },
);

export const PickupAddressModel =
  mongoose.models.PickupAddress || mongoose.model("PickupAddress", pickupAddressSchema);
export default PickupAddressModel;
