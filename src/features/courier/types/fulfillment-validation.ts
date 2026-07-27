import { z } from "zod";
import { COURIER_PROVIDER_IDS } from "../domain/courier-catalog";
import { SHIPMENT_STATUSES } from "../domain/shipment-state-machine";

const objectId = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

/** Courier tracking numbers: alphanumerics, dashes, underscores, slashes. */
const trackingCodeSchema = z
  .string()
  .trim()
  .min(3, "Tracking number is too short")
  .max(64, "Tracking number is too long")
  .regex(/^[A-Za-z0-9/_-]+$/, "Tracking number contains unsupported characters");

export const courierProviderSchema = z.enum(
  COURIER_PROVIDER_IDS as [string, ...string[]],
  "Unknown courier",
);

export const shipmentStatusSchema = z.enum(SHIPMENT_STATUSES);

export const deliveryZoneSchema = z.enum([
  "inside_city",
  "outside_city",
  "sub_city",
  "remote_area",
]);

export const packageSchema = z.object({
  /** Actual scale weight in grams. 30kg is the practical courier ceiling in BD. */
  weightGrams: z.coerce.number().int().min(1, "Weight is required").max(30_000, "Max 30kg"),
  lengthCm: z.coerce.number().min(0).max(300).optional(),
  widthCm: z.coerce.number().min(0).max(300).optional(),
  heightCm: z.coerce.number().min(0).max(300).optional(),
  packageCount: z.coerce.number().int().min(1).max(50).optional(),
  parcelType: z.enum(["document", "parcel", "liquid"]).optional(),
});

export const createShipmentInputSchema = z.object({
  orderId: objectId,
  provider: courierProviderSchema,
  deliveryZone: deliveryZoneSchema.optional(),
  trackingCode: trackingCodeSchema.optional(),
  pickupAddressId: objectId.optional(),
  estimatedDeliveryDate: z.coerce.date().optional(),
  deliveryNotes: z.string().trim().max(500).optional(),
  internalNotes: z.string().trim().max(1000).optional(),
  package: packageSchema.optional(),
});

export const assignCourierInputSchema = z.object({
  shipmentId: objectId,
  provider: courierProviderSchema,
  trackingCode: trackingCodeSchema.optional(),
  consignmentId: z.string().trim().max(64).optional(),
  estimatedDeliveryDate: z.coerce.date().optional(),
});

export const updateShipmentStatusSchema = z.object({
  shipmentId: objectId,
  toStatus: shipmentStatusSchema,
  message: z.string().trim().max(300).optional(),
  location: z.string().trim().max(120).optional(),
});

export const bulkShipmentStatusSchema = z.object({
  shipmentIds: z.array(objectId).min(1, "Select at least one shipment").max(100, "Max 100 at once"),
  toStatus: shipmentStatusSchema,
  message: z.string().trim().max(300).optional(),
});

export const updateShipmentPackageSchema = z.object({
  shipmentId: objectId,
  package: packageSchema,
  recalculateCharges: z.boolean().optional(),
});

export const updateShipmentNotesSchema = z
  .object({
    shipmentId: objectId,
    deliveryNotes: z.string().trim().max(500).optional(),
    internalNotes: z.string().trim().max(1000).optional(),
  })
  .refine((v) => v.deliveryNotes !== undefined || v.internalNotes !== undefined, {
    message: "Provide a delivery note or an internal note",
  });

export const cancelShipmentInputSchema = z.object({
  shipmentId: objectId,
  reason: z.string().trim().min(3, "A reason is required").max(300),
});

export const shipmentListQuerySchema = z.object({
  search: z.string().trim().max(80).optional(),
  provider: z.union([courierProviderSchema, z.literal("all")]).optional(),
  status: z.union([shipmentStatusSchema, z.literal("all")]).optional(),
  orderId: objectId.optional(),
  startDate: z.string().trim().max(30).optional(),
  endDate: z.string().trim().max(30).optional(),
  page: z.coerce.number().int().min(1).max(1000).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type CreateShipmentActionInput = z.infer<typeof createShipmentInputSchema>;
export type AssignCourierActionInput = z.infer<typeof assignCourierInputSchema>;
export type UpdateShipmentStatusActionInput = z.infer<typeof updateShipmentStatusSchema>;
export type BulkShipmentStatusActionInput = z.infer<typeof bulkShipmentStatusSchema>;
export type UpdateShipmentPackageActionInput = z.infer<typeof updateShipmentPackageSchema>;
export type UpdateShipmentNotesActionInput = z.infer<typeof updateShipmentNotesSchema>;
export type ShipmentListQuery = z.infer<typeof shipmentListQuerySchema>;

/** Folds the flat form fields into the service's package shape. */
export function toPackageInput(pkg: z.infer<typeof packageSchema>) {
  const hasDimensions =
    (pkg.lengthCm ?? 0) > 0 || (pkg.widthCm ?? 0) > 0 || (pkg.heightCm ?? 0) > 0;
  return {
    weightGrams: pkg.weightGrams,
    packageCount: pkg.packageCount,
    parcelType: pkg.parcelType,
    dimensions: hasDimensions
      ? { length: pkg.lengthCm ?? 0, width: pkg.widthCm ?? 0, height: pkg.heightCm ?? 0 }
      : undefined,
  };
}
