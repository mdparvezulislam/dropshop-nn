import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";

const { status: baseStatus, ...otherBaseFields } = baseFieldsDefinition;

const shipmentAutomationSchema = new Schema(
  {
    shipmentId: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true, index: true },
    shipmentNumber: { type: String, required: true, index: true },
    trackingCode: { type: String, required: true, index: true },
    provider: { type: String, required: true, index: true },
    currentStatus: { type: String, required: true, index: true },
    nativeStatus: { type: String },
    rider: {
      name: { type: String },
      phone: { type: String },
      riderId: { type: String },
      vehicle: { type: String },
      assignmentType: { type: String },
      assignedAt: { type: Date },
    },
    currentHub: { type: String },
    hubHistory: [
      {
        currentHub: { type: String, required: true },
        previousHub: { type: String },
        destinationHub: { type: String },
        arrivalTime: { type: Date, required: true },
        departureTime: { type: Date },
        district: { type: String },
        area: { type: String },
      },
    ],
    locationHistory: [
      {
        district: { type: String },
        area: { type: String },
        hub: { type: String },
        gps: { lat: Number, lng: Number },
        timestamp: { type: Date, required: true, default: Date.now },
      },
    ],
    timeline: [
      {
        timestamp: { type: Date, required: true, default: Date.now },
        status: { type: String, required: true },
        nativeStatus: { type: String },
        description: { type: String, required: true },
        courierEvent: { type: String },
        operator: { type: String },
        location: { type: String },
        district: { type: String },
        area: { type: String },
        hub: { type: String },
        rider: { type: Schema.Types.Mixed },
      },
    ],
    isLocked: { type: Boolean, default: false },
    codSettlementPrepared: { type: Boolean, default: false },
    deliveryFeeRecorded: { type: Boolean, default: false },
    lastPolledAt: { type: Date },
    pollCount: { type: Number, default: 0 },
    pollingStatus: { type: String, required: true, default: "active", index: true },
    lastErrorMessage: { type: String },
    ...otherBaseFields,
  },
  { ...baseSchemaOptions, collection: "shipment_automations" },
);

export const ShipmentAutomationModel =
  mongoose.models.ShipmentAutomation || mongoose.model("ShipmentAutomation", shipmentAutomationSchema);
export default ShipmentAutomationModel;
