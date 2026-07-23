import mongoose, { Schema } from "mongoose";
import { baseFieldsDefinition, baseSchemaOptions } from "@/lib/database/base-schema";

const deliveryZoneSchema = new Schema(
  {
    name: { type: String, required: true },
    country: { type: String, required: true, default: "Bangladesh" },
    division: { type: String, required: true },
    district: { type: String, required: true },
    area: { type: String, required: true },
    zoneCode: { type: String, required: true, unique: true, index: true },
    shippingCategory: { type: String, required: true, default: "inside_city" },
    ...baseFieldsDefinition,
  },
  { ...baseSchemaOptions, collection: "delivery_zones" },
);

const shippingRuleSchema = new Schema(
  {
    ruleName: { type: String, required: true },
    preferredCourier: { type: String, required: true },
    zoneCode: { type: String },
    maxCodLimitCents: { type: Number },
    maxWeightGrams: { type: Number },
    packageType: { type: String },
    isPriority: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    ...baseFieldsDefinition,
  },
  { ...baseSchemaOptions, collection: "shipping_rules" },
);

const deliveryCostRuleSchema = new Schema(
  {
    ruleName: { type: String, required: true },
    ruleType: { type: String, required: true, default: "flat_rate" },
    baseCostCents: { type: Number, required: true, default: 6000 },
    extraWeightUnitGrams: { type: Number },
    extraWeightCostCents: { type: Number },
    courierProvider: { type: String },
    zoneCode: { type: String },
    active: { type: Boolean, default: true },
    ...baseFieldsDefinition,
  },
  { ...baseSchemaOptions, collection: "delivery_cost_rules" },
);

export const DeliveryZoneModel =
  mongoose.models.DeliveryZone || mongoose.model("DeliveryZone", deliveryZoneSchema);

export const ShippingRuleModel =
  mongoose.models.ShippingRule || mongoose.model("ShippingRule", shippingRuleSchema);

export const DeliveryCostRuleModel =
  mongoose.models.DeliveryCostRule || mongoose.model("DeliveryCostRule", deliveryCostRuleSchema);
