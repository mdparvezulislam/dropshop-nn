import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";

const { status: baseStatus, ...otherBaseFields } = baseFieldsDefinition;

const courierConfigSchema = new Schema(
  {
    provider: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, required: true },
    enabled: { type: Boolean, default: false, index: true },
    isSandbox: { type: Boolean, default: true },
    apiBaseUrl: { type: String, required: true },
    apiKey: { type: String, default: "" },
    apiSecret: { type: String, default: null },
    merchantId: { type: String, default: null },
    webhookSecret: { type: String, default: null },
    defaultStatus: { type: String, default: "pending_booking" },
    defaultPackageType: { type: String, default: "parcel" },
    defaultWeight: { type: Number, default: 500 },
    defaultCodPolicy: { type: String, default: "collect_full" },
    pickupAddressId: { type: String, default: null },
    lastTestedAt: { type: Date, default: null },
    connectionStatus: {
      type: String,
      enum: ["connected", "disconnected", "error", "untested"],
      default: "untested",
    },
    lastErrorMessage: { type: String, default: null },

    // Extended Settings
    pathaoConfig: {
      clientId: { type: String },
      clientSecret: { type: String },
      username: { type: String },
      password: { type: String },
      storeId: { type: String },
      accessToken: { type: String },
      refreshToken: { type: String },
      tokenExpiresAt: { type: Date },
      autoRefresh: { type: Boolean, default: true },
    },
    steadfastConfig: {
      apiKey: { type: String },
      apiSecret: { type: String },
      merchantId: { type: String },
    },
    autoBookingRules: {
      autoBookOnConfirm: { type: Boolean, default: false },
      autoBookOnPayment: { type: Boolean, default: false },
      applyReseller: { type: Boolean, default: true },
      applyWholesale: { type: Boolean, default: true },
      applyRetail: { type: Boolean, default: true },
    },
    statusMapping: { type: Schema.Types.Mixed, default: {} },
    bookingRetryCount: { type: Number, default: 3 },
    bookingTimeoutMs: { type: Number, default: 10000 },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "courier_configs" },
);

export const CourierConfigModel =
  mongoose.models.CourierConfig || mongoose.model("CourierConfig", courierConfigSchema);
export default CourierConfigModel;
