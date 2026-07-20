import { z } from "zod";

export const createShipmentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  provider: z.string().min(1, "Courier provider is required"),
  deliveryZone: z.enum(["inside_city", "outside_city", "sub_city", "remote_area"]),
  parcelType: z.enum(["document", "parcel", "liquid"]),
  parcelWeight: z.number().int().positive("Parcel weight must be positive in grams"),
  dimensions: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    depth: z.number().positive(),
  }),
});

export const requestPickupSchema = z.object({
  shipmentId: z.string().min(1, "Shipment ID is required"),
  pickupDetails: z.record(z.string(), z.any()).optional(),
});

export const transitionStatusSchema = z.object({
  shipmentId: z.string().min(1, "Shipment ID is required"),
  toStatus: z.enum([
    "created",
    "pickup_requested",
    "picked_up",
    "in_transit",
    "hub_received",
    "out_for_delivery",
    "delivered",
    "failed",
    "returned",
    "cancelled",
  ]),
  message: z.string().min(1, "Status update log audit message is required"),
});

export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;
export type RequestPickupInput = z.infer<typeof requestPickupSchema>;
export type TransitionStatusInput = z.infer<typeof transitionStatusSchema>;
