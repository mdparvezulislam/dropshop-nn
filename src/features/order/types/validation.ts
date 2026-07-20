import { z } from "zod";
import { objectIdSchema, phoneSchema, emailSchema } from "@/shared/utils/validation";
import { ORDER_STATUSES } from "../domain/state-machine";

const orderTypeSchema = z.enum(["guest", "customer", "reseller", "wholesaler"]);

const orderStatusSchema = z.enum(ORDER_STATUSES);

export const createOrderFromDraftSchema = z.object({
  draftId: objectIdSchema,
  checkoutId: objectIdSchema,
  cartId: objectIdSchema,
  orderNumber: z.string().min(1).max(50).trim(),
  type: orderTypeSchema,
  customer: z.object({
    customerId: z.string().optional(),
    name: z.string().min(1).max(200).trim(),
    phone: phoneSchema,
    email: emailSchema.optional().or(z.literal("")),
    alternativePhone: phoneSchema.optional().or(z.literal("")),
  }),
  shipping: z.object({
    receiverName: z.string().min(1).max(200).trim(),
    phone: phoneSchema,
    alternativePhone: phoneSchema.optional().or(z.literal("")),
    division: z.string().min(1).max(100).trim(),
    district: z.string().min(1).max(100).trim(),
    upazila: z.string().min(1).max(100).trim(),
    area: z.string().min(1).max(100).trim(),
    address: z.string().min(1).max(500).trim(),
    deliveryNote: z.string().max(500).optional().or(z.literal("")),
  }),
  pricing: z.object({
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          variantSku: z.string().optional(),
          productName: z.string().min(1),
          quantity: z.number().int().positive(),
          unitSellingPrice: z.number().int().nonnegative(),
          unitWholesalePrice: z.number().int().nonnegative().optional(),
          unitCostBasis: z.number().int().nonnegative(),
          totalSellingPrice: z.number().int().nonnegative(),
          totalCostBasis: z.number().int().nonnegative(),
          totalProfit: z.number().int(),
          marginPercent: z.number(),
          currency: z.string().min(1),
          pricingSource: z.enum(["retail", "reseller", "wholesale", "campaign", "flash_sale"]),
          campaignId: z.string().optional(),
          appliedRules: z.array(z.string()).optional(),
        }),
      )
      .min(1),
    subtotal: z.number().int().nonnegative(),
    discountTotal: z.number().int().nonnegative(),
    taxTotal: z.number().int().nonnegative(),
    grandTotal: z.number().int().nonnegative(),
    currency: z.string().min(1),
  }),
  profitPreview: z
    .object({
      totalCostBasis: z.number().int().nonnegative(),
      totalRevenue: z.number().int().nonnegative(),
      totalProfit: z.number().int(),
      averageMargin: z.number(),
    })
    .optional(),
  source: z.string().max(50).optional(),
  resellerId: z.string().optional(),
  wholesaleId: z.string().optional(),
  autoConfirmed: z.boolean().optional(),
});

export type CreateOrderFromDraftInput = z.infer<typeof createOrderFromDraftSchema>;

export const updateOrderStatusSchema = z.object({
  orderId: objectIdSchema,
  toStatus: orderStatusSchema,
  reason: z.string().max(500).optional(),
  actorId: z.string().optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export const assignCourierSchema = z.object({
  orderId: objectIdSchema,
  courierId: z.string().min(1).max(100),
  courierName: z.string().min(1).max(200),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().url().optional().or(z.literal("")),
});

export type AssignCourierInput = z.infer<typeof assignCourierSchema>;

export const updateTrackingSchema = z.object({
  orderId: objectIdSchema,
  trackingNumber: z.string().min(1).max(200),
  trackingUrl: z.string().url().optional().or(z.literal("")),
});

export type UpdateTrackingInput = z.infer<typeof updateTrackingSchema>;

export const addOrderNoteSchema = z.object({
  orderId: objectIdSchema,
  note: z.string().min(1).max(2000).trim(),
  internal: z.boolean().default(false),
});

export type AddOrderNoteInput = z.infer<typeof addOrderNoteSchema>;

export const cancelOrderSchema = z.object({
  orderId: objectIdSchema,
  reason: z.string().min(1).max(500).trim(),
  cancelledBy: z.string().min(1),
});

export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;

export const requestReturnSchema = z.object({
  orderId: objectIdSchema,
  reason: z.string().min(1).max(1000).trim(),
  requestedBy: z.string().optional(),
});

export type RequestReturnInput = z.infer<typeof requestReturnSchema>;

export const processReturnSchema = z.object({
  orderId: objectIdSchema,
  initiatedBy: z.string().min(1),
});

export type ProcessReturnInput = z.infer<typeof processReturnSchema>;

export const refundOrderSchema = z.object({
  orderId: objectIdSchema,
  refundAmount: z.number().int().nonnegative(),
  refundedBy: z.string().min(1),
});

export type RefundOrderInput = z.infer<typeof refundOrderSchema>;

export const orderListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: orderStatusSchema.optional().or(z.literal("all")),
  type: orderTypeSchema.optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type OrderListQuery = z.infer<typeof orderListQuerySchema>;

export const getOrderSchema = z.object({
  orderId: objectIdSchema,
});

export type GetOrderInput = z.infer<typeof getOrderSchema>;
