import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";

const { status: baseStatus, ...otherBaseFields } = baseFieldsDefinition;

const customerAddressSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ["home", "office", "warehouse", "custom", "store"], required: true },
  division: { type: String, required: true },
  district: { type: String, required: true },
  upazila: { type: String, required: true },
  area: { type: String, required: true },
  postalCode: { type: String, default: null },
  landmark: { type: String, default: null },
  isDefault: { type: Boolean, required: true, default: false },
}, { _id: false });

const customerNoteSchema = new Schema({
  id: { type: String, required: true },
  note: { type: String, required: true },
  authorId: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  isPrivate: { type: Boolean, required: true, default: false },
}, { _id: false });

const customerTimelineSchema = new Schema({
  eventType: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  message: { type: String, required: true },
  actorId: { type: String, default: null },
}, { _id: false });

const customerStatisticsSchema = new Schema({
  totalOrders: { type: Number, required: true, default: 0 },
  completedOrders: { type: Number, required: true, default: 0 },
  cancelledOrders: { type: Number, required: true, default: 0 },
  totalSpend: { type: Number, required: true, default: 0 },
  averageOrderValue: { type: Number, required: true, default: 0 },
  lastOrderDate: { type: Date, default: null },
}, { _id: false });

const customerSchema = new Schema(
  {
    workspaceId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true, index: true },
    alternativePhone: { type: String, default: null },
    email: { type: String, default: null, index: true },
    gender: { type: String, enum: ["male", "female", "other"], default: null },
    birthDate: { type: Date, default: null },
    profileImage: { type: String, default: null },
    status: {
      type: String,
      enum: ["active", "inactive", "blacklisted"],
      required: true,
      default: "active",
      index: true,
    },
    source: { type: String, required: true, default: "manual", index: true },
    addresses: [customerAddressSchema],
    notes: [customerNoteSchema],
    tags: [{ type: String, index: true }],
    timeline: [customerTimelineSchema],
    statistics: { type: customerStatisticsSchema, required: true, default: () => ({}) },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "customers" },
);

// Enforce unique phone number inside the same workspace
customerSchema.index({ phone: 1, workspaceId: 1 }, { unique: true });

export const CustomerModel =
  mongoose.models.Customer || mongoose.model("Customer", customerSchema);
export default CustomerModel;
