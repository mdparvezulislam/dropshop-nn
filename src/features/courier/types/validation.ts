import { z } from "zod";

export const createShipmentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  orderNumber: z.string().min(1, "Order number is required"),
  provider: z.string().min(1, "Courier provider is required"),
  deliveryZone: z
    .enum(["inside_city", "outside_city", "sub_city", "remote_area"])
    .optional()
    .default("inside_city"),
  parcelType: z.enum(["document", "parcel", "liquid"]).optional().default("parcel"),
  parcelWeight: z
    .number()
    .int()
    .positive("Weight must be positive in grams")
    .optional()
    .default(500),
  codAmount: z.number().int().nonnegative("COD amount must be non-negative in cents"),
  deliveryCharge: z.number().int().nonnegative().optional().default(6000),
  recipient: z.object({
    name: z.string().min(1, "Recipient name is required"),
    phone: z.string().min(1, "Recipient phone is required"),
    alternativePhone: z.string().optional(),
    address: z.string().min(1, "Delivery address is required"),
    district: z.string().min(1, "District is required"),
    area: z.string().min(1, "Area is required"),
  }),
  pickupAddressId: z.string().optional(),
});

export const bookShipmentSchema = z.object({
  shipmentId: z.string().min(1, "Shipment ID is required"),
});

export const cancelShipmentSchema = z.object({
  shipmentId: z.string().min(1, "Shipment ID is required"),
  reason: z.string().optional().default("Cancelled by merchant"),
});

export const bulkBookSchema = z.object({
  shipmentIds: z.array(z.string()).min(1, "At least one shipment ID is required"),
});

export const saveCourierConfigSchema = z.object({
  provider: z.string().min(1, "Provider name is required"),
  displayName: z.string().min(1, "Display name is required"),
  enabled: z.boolean(),
  isSandbox: z.boolean(),
  apiBaseUrl: z.string().min(1, "API Base URL is required"),
  apiKey: z.string().min(1, "API Key is required"),
  apiSecret: z.string().optional(),
  merchantId: z.string().optional(),
  webhookSecret: z.string().optional(),
  defaultStatus: z.string().optional().default("pending_booking"),
  defaultPackageType: z.string().optional().default("parcel"),
  defaultWeight: z.number().int().positive().optional().default(500),
  defaultCodPolicy: z.string().optional().default("collect_full"),
  pickupAddressId: z.string().optional(),
});

export const createPickupAddressSchema = z.object({
  name: z.string().min(1, "Address name is required"),
  isDefault: z.boolean().default(false),
  warehouseId: z.string().optional(),
  contactPerson: z.string().min(1, "Contact person is required"),
  phone: z.string().min(1, "Contact phone is required"),
  alternativePhone: z.string().optional(),
  district: z.string().min(1, "District is required"),
  area: z.string().min(1, "Area is required"),
  address: z.string().min(1, "Street address is required"),
  instructions: z.string().optional(),
});

export const syncTrackingSchema = z.object({
  shipmentId: z.string().min(1, "Shipment ID is required"),
});

export const retryLogisticsTaskSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
});

export const recordAttemptSchema = z.object({
  shipmentId: z.string().min(1, "Shipment ID is required"),
  courier: z.string().optional(),
  deliveryAgent: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      agentId: z.string().optional(),
    })
    .optional(),
  status: z.enum(["attempted", "failed", "delivered", "rescheduled"]),
  failureReason: z
    .enum([
      "customer_unavailable",
      "phone_unreachable",
      "address_incorrect",
      "customer_refused",
      "area_restricted",
      "courier_issue",
      "weather",
      "damaged_parcel",
      "other",
    ])
    .optional(),
  customerResponse: z.string().optional(),
  notes: z.string().optional(),
});

export const reassignCourierSchema = z.object({
  shipmentId: z.string().min(1, "Shipment ID is required"),
  newCourier: z.string().min(1, "New courier provider is required"),
  reason: z.string().min(1, "Reassignment reason is required"),
});

export const manualInterventionSchema = z.object({
  shipmentId: z.string().min(1, "Shipment ID is required"),
  actionType: z.enum([
    "force_status",
    "manual_tracking",
    "manual_delivery_confirm",
    "manual_return_confirm",
  ]),
  targetStatus: z.string().optional(),
  manualTrackingCode: z.string().optional(),
  notes: z.string().min(1, "Manual intervention notes are required"),
});

export const createReturnSchema = z.object({
  shipmentId: z.string().min(1, "Shipment ID is required"),
  reason: z.enum([
    "customer_refused",
    "damaged_product",
    "wrong_product",
    "duplicate_order",
    "address_problem",
    "courier_failure",
    "delivery_failed",
  ]),
  returnChargeCents: z.number().int().nonnegative().optional().default(4000),
  notes: z.string().optional(),
});

export const updateReturnStatusSchema = z.object({
  returnId: z.string().min(1, "Return ID is required"),
  status: z.enum([
    "return_initiated",
    "return_in_transit",
    "return_received",
    "return_completed",
    "return_cancelled",
  ]),
  notes: z.string().optional(),
});

export const createRTSSchema = z.object({
  shipmentId: z.string().min(1, "Shipment ID is required"),
  reason: z.string().min(1, "RTS reason is required"),
});

export const inspectRTSSchema = z.object({
  rtsId: z.string().min(1, "RTS ID is required"),
  condition: z.enum(["intact", "damaged", "missing_items", "opened"]),
  notes: z.string().optional(),
});

export const recordPartialDeliverySchema = z.object({
  shipmentId: z.string().min(1, "Shipment ID is required"),
  partialCodCents: z.number().int().nonnegative("Partial COD amount must be non-negative"),
  notes: z.string().optional(),
});

export const createDisputeSchema = z.object({
  shipmentId: z.string().min(1, "Shipment ID is required"),
  disputeType: z.enum([
    "courier_lost_package",
    "damaged_parcel",
    "customer_complaint",
    "missing_item",
    "wrong_delivery",
    "cod_difference",
  ]),
  evidenceUrls: z.array(z.string()).optional(),
  initialNote: z.string().optional(),
  codDiscrepancyCents: z.number().int().optional(),
});

export const escalateDisputeSchema = z.object({
  disputeId: z.string().min(1, "Dispute ID is required"),
  level: z.enum(["level_1", "level_2", "level_3", "resolved", "closed"]),
  assignedRole: z.string().min(1, "Assigned role is required"),
  reason: z.string().min(1, "Escalation reason is required"),
});

export const createShippingRuleSchema = z.object({
  ruleName: z.string().min(1, "Rule name is required"),
  preferredCourier: z.string().min(1, "Preferred courier is required"),
  zoneCode: z.string().optional(),
  maxCodLimitCents: z.number().int().optional(),
  maxWeightGrams: z.number().int().optional(),
  packageType: z.string().optional(),
  isPriority: z.boolean().default(false),
});

export const createDeliveryZoneSchema = z.object({
  name: z.string().min(1, "Zone name is required"),
  country: z.string().default("Bangladesh"),
  division: z.string().min(1, "Division is required"),
  district: z.string().min(1, "District is required"),
  area: z.string().min(1, "Area is required"),
  zoneCode: z.string().min(1, "Zone code is required"),
  shippingCategory: z
    .enum(["inside_city", "outside_city", "sub_city", "remote_area"])
    .default("inside_city"),
});

export const createCostRuleSchema = z.object({
  ruleName: z.string().min(1, "Rule name is required"),
  ruleType: z.enum(["weight_based", "zone_based", "courier_based", "cod_based", "flat_rate"]),
  baseCostCents: z.number().int().nonnegative(),
  extraWeightUnitGrams: z.number().int().optional(),
  extraWeightCostCents: z.number().int().optional(),
  courierProvider: z.string().optional(),
  zoneCode: z.string().optional(),
});

export const saveSteadfastSettingsSchema = z.object({
  enabled: z.boolean(),
  isSandbox: z.boolean(),
  apiBaseUrl: z.string().min(1, "API Base URL is required"),
  apiKey: z.string().min(1, "API Key is required"),
  apiSecret: z.string().optional(),
  merchantId: z.string().optional(),
  pickupAddressId: z.string().optional(),
  defaultWeight: z.number().int().positive().optional().default(500),
  defaultPackageType: z.string().optional().default("parcel"),
  webhookSecret: z.string().optional(),
  statusMapping: z.record(z.string(), z.string()).optional(),
});

export const savePathaoSettingsSchema = z.object({
  enabled: z.boolean(),
  isSandbox: z.boolean(),
  apiBaseUrl: z.string().min(1, "API Base URL is required"),
  clientId: z.string().min(1, "Client ID is required"),
  clientSecret: z.string().min(1, "Client Secret is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  storeId: z.string().optional(),
  pickupAddressId: z.string().optional(),
  defaultWeight: z.number().int().positive().optional().default(500),
  defaultPackageType: z.string().optional().default("parcel"),
  webhookSecret: z.string().optional(),
  statusMapping: z.record(z.string(), z.string()).optional(),
});

export const issuePathaoTokenSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  clientSecret: z.string().min(1, "Client Secret is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  apiBaseUrl: z.string().optional(),
});

export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;
export type BookShipmentInput = z.infer<typeof bookShipmentSchema>;
export type CancelShipmentInput = z.infer<typeof cancelShipmentSchema>;
export type BulkBookInput = z.infer<typeof bulkBookSchema>;
export type SaveCourierConfigInput = z.infer<typeof saveCourierConfigSchema>;
export type CreatePickupAddressInput = z.infer<typeof createPickupAddressSchema>;
export type SyncTrackingInput = z.infer<typeof syncTrackingSchema>;
export type RetryLogisticsTaskInput = z.infer<typeof retryLogisticsTaskSchema>;

export type RecordAttemptInput = z.infer<typeof recordAttemptSchema>;
export type ReassignCourierInput = z.infer<typeof reassignCourierSchema>;
export type ManualInterventionInput = z.infer<typeof manualInterventionSchema>;
export type CreateReturnInput = z.infer<typeof createReturnSchema>;
export type UpdateReturnStatusInput = z.infer<typeof updateReturnStatusSchema>;
export type CreateRTSInput = z.infer<typeof createRTSSchema>;
export type InspectRTSInput = z.infer<typeof inspectRTSSchema>;
export type RecordPartialDeliveryInput = z.infer<typeof recordPartialDeliverySchema>;
export type CreateDisputeInput = z.infer<typeof createDisputeSchema>;
export type EscalateDisputeInput = z.infer<typeof escalateDisputeSchema>;
export type CreateShippingRuleInput = z.infer<typeof createShippingRuleSchema>;
export type CreateDeliveryZoneInput = z.infer<typeof createDeliveryZoneSchema>;
export type CreateCostRuleInput = z.infer<typeof createCostRuleSchema>;

export const triggerManualAutomationSyncSchema = z.object({
  shipmentId: z.string().min(1, "Shipment ID is required"),
});

export const restartAutomationSchema = z.object({
  shipmentId: z.string().min(1, "Shipment ID is required"),
});

export type SaveSteadfastSettingsInput = z.infer<typeof saveSteadfastSettingsSchema>;
export type SavePathaoSettingsInput = z.infer<typeof savePathaoSettingsSchema>;
export type IssuePathaoTokenInput = z.infer<typeof issuePathaoTokenSchema>;
export type TriggerManualAutomationSyncInput = z.infer<typeof triggerManualAutomationSyncSchema>;
export type RestartAutomationInput = z.infer<typeof restartAutomationSchema>;
