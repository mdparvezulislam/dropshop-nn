import { z } from "zod";
import { objectIdSchema, phoneSchema, emailSchema } from "@/lib/utils/validation";
import { ORDER_STATUSES } from "../domain/state-machine";
import { RETURN_STATUSES } from "../domain/return-entity";
import { WARRANTY_STATUSES } from "../domain/warranty-entity";
import { EXCHANGE_STATUSES } from "../domain/exchange-entity";
import { COD_SETTLEMENT_STATUSES } from "../domain/cod-entity";
import { COMPLAINT_TYPES, COMPLAINT_STATUSES } from "../domain/complaint-entity";
import { CALL_OUTCOMES } from "../domain/call-log-entity";
import {
  FOLLOW_UP_TYPES,
  FOLLOW_UP_STATUSES,
  FOLLOW_UP_PRIORITIES,
} from "../domain/follow-up-entity";
import { FAILED_DELIVERY_REASONS, FAILED_DELIVERY_ACTIONS } from "../domain/failed-delivery-entity";

const orderTypeSchema = z.enum(["guest", "customer", "reseller", "wholesaler"]);
const orderStatusSchema = z.enum(ORDER_STATUSES);
const returnStatusSchema = z.enum(RETURN_STATUSES);
const warrantyStatusSchema = z.enum(WARRANTY_STATUSES);
const exchangeStatusSchema = z.enum(EXCHANGE_STATUSES);

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
    upazila: z.string().min(1).max(100).trim().optional().or(z.literal("")),
    area: z.string().min(1).max(100).trim().optional().or(z.literal("")),
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
  resellerName: z.string().optional(),
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
  reason: z.string().max(500).trim().optional().default("Cancelled by operator"),
  cancelledBy: z.string().optional().default("admin"),
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
  initiatedBy: z.string().optional().default("admin"),
});

export type ProcessReturnInput = z.infer<typeof processReturnSchema>;

export const refundOrderSchema = z.object({
  orderId: objectIdSchema,
  refundAmount: z.number().int().nonnegative(),
  refundedBy: z.string().optional().default("admin"),
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
  paymentStatus: z.string().optional(),
  courierName: z.string().optional(),
  district: z.string().optional(),
  dateFilter: z.enum(["today", "yesterday", "this_week", "this_month"]).optional(),
  priority: z.enum(["low", "normal", "high", "urgent", "vip"]).optional(),
});

export type OrderListQuery = z.infer<typeof orderListQuerySchema>;

export const getOrderSchema = z.object({
  orderId: objectIdSchema,
});

export type GetOrderInput = z.infer<typeof getOrderSchema>;

export const createManualOrderSchema = z.object({
  orderNumber: z.string().min(1).max(50).trim(),
  type: orderTypeSchema,
  source: z.enum(["manual", "facebook", "reseller", "wholesale"]).default("manual"),
  customer: z.object({
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
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantSku: z.string().optional(),
        productName: z.string().min(1),
        quantity: z.number().int().positive(),
        unitSellingPrice: z.number().int().nonnegative(),
        unitCostBasis: z.number().int().nonnegative(),
        currency: z.string().min(1).default("BDT"),
        pricingSource: z
          .enum(["retail", "reseller", "wholesale", "campaign", "flash_sale"])
          .default("retail"),
      }),
    )
    .min(1),
  discountTotal: z.number().int().nonnegative().default(0),
  taxTotal: z.number().int().nonnegative().default(0),
  shippingCost: z.number().int().nonnegative().default(0),
  note: z.string().max(2000).optional(),
});

export type CreateManualOrderInput = z.infer<typeof createManualOrderSchema>;

export const bulkOrderActionSchema = z.object({
  orderIds: z.array(objectIdSchema).min(1).max(50),
  action: z.enum([
    "confirm",
    "pack",
    "cancel",
    "print_invoice",
    "print_packing_slip",
    "book_courier",
    "export",
  ]),
});

export type BulkOrderActionInput = z.infer<typeof bulkOrderActionSchema>;

/* Return schemas */
export const createReturnSchema = z.object({
  orderId: objectIdSchema,
  reason: z.string().min(1).max(1000).trim(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantSku: z.string().optional(),
        productName: z.string().min(1),
        quantity: z.number().int().positive(),
        unitPrice: z.number().int().nonnegative(),
        totalPrice: z.number().int().nonnegative(),
      }),
    )
    .min(1),
  customerNote: z.string().max(1000).optional(),
});

export type CreateReturnInput = z.infer<typeof createReturnSchema>;

export const updateReturnStatusSchema = z.object({
  returnId: objectIdSchema,
  toStatus: returnStatusSchema,
  inspectionNotes: z.string().max(2000).optional(),
  rejectionReason: z.string().max(500).optional(),
  refundAmount: z.number().int().nonnegative().optional(),
  approvedBy: z.string().optional(),
});

export type UpdateReturnStatusInput = z.infer<typeof updateReturnStatusSchema>;

/* Warranty schemas */
export const createWarrantySchema = z.object({
  orderId: objectIdSchema,
  productId: z.string().min(1),
  productName: z.string().min(1),
  variantSku: z.string().optional(),
  issue: z.string().min(1).max(2000).trim(),
  customerNote: z.string().max(1000).optional(),
});

export type CreateWarrantyInput = z.infer<typeof createWarrantySchema>;

export const updateWarrantyStatusSchema = z.object({
  warrantyId: objectIdSchema,
  toStatus: warrantyStatusSchema,
  repairNotes: z.string().max(2000).optional(),
  resolution: z.string().max(2000).optional(),
  rejectionReason: z.string().max(500).optional(),
  replacementProductId: z.string().optional(),
  approvedBy: z.string().optional(),
});

export type UpdateWarrantyStatusInput = z.infer<typeof updateWarrantyStatusSchema>;

/* Exchange schemas */
export const createExchangeSchema = z.object({
  orderId: objectIdSchema,
  reason: z.string().min(1).max(1000).trim(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantSku: z.string().optional(),
        productName: z.string().min(1),
        quantity: z.number().int().positive(),
        unitPrice: z.number().int().nonnegative(),
        totalPrice: z.number().int().nonnegative(),
      }),
    )
    .min(1),
  customerNote: z.string().max(1000).optional(),
});

export type CreateExchangeInput = z.infer<typeof createExchangeSchema>;

export const updateExchangeStatusSchema = z.object({
  exchangeId: objectIdSchema,
  toStatus: exchangeStatusSchema,
  pickupAddress: z.string().max(500).optional(),
  pickupDate: z.string().optional(),
  replacementProductId: z.string().optional(),
  replacementVariantSku: z.string().optional(),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().optional(),
  rejectionReason: z.string().max(500).optional(),
  approvedBy: z.string().optional(),
});

export type UpdateExchangeStatusInput = z.infer<typeof updateExchangeStatusSchema>;

/* Note schema */
export const createOrderNoteSchema = z.object({
  orderId: objectIdSchema,
  type: z.enum(["internal", "customer", "courier"]),
  content: z.string().min(1).max(5000).trim(),
  isPinned: z.boolean().default(false),
});

export type CreateOrderNoteInput = z.infer<typeof createOrderNoteSchema>;

/* Risk Engine schemas */
export const createRiskFlagSchema = z.object({
  orderId: objectIdSchema,
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
  category: z.enum([
    "frequent_returns",
    "cod_refusal",
    "fake_order",
    "multiple_cancellations",
    "duplicate_order",
    "suspicious_activity",
  ]),
  reason: z.string().min(1).max(1000),
  confidence: z.number().min(0).max(100),
});

export type CreateRiskFlagInput = z.infer<typeof createRiskFlagSchema>;

export const resolveRiskFlagSchema = z.object({
  riskId: objectIdSchema,
  resolution: z.string().min(1).max(500),
});

export type ResolveRiskFlagInput = z.infer<typeof resolveRiskFlagSchema>;

/* Staff Assignment schemas */
export const assignStaffSchema = z.object({
  orderId: objectIdSchema,
  staffId: z.string().min(1),
  staffName: z.string().min(1).max(200),
  role: z.enum(["picker", "packer", "courier_manager", "customer_support", "manager"]),
  notes: z.string().max(500).optional(),
});

export type AssignStaffInput = z.infer<typeof assignStaffSchema>;

export const completeStaffAssignmentSchema = z.object({
  assignmentId: objectIdSchema,
});

export type CompleteStaffAssignmentInput = z.infer<typeof completeStaffAssignmentSchema>;

/* Internal Task schemas */
export const createTaskSchema = z.object({
  orderId: objectIdSchema,
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  assignedTo: z.string().optional(),
  assignedToName: z.string().optional(),
  dueDate: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskStatusSchema = z.object({
  taskId: objectIdSchema,
  status: z.enum(["open", "in_progress", "completed", "cancelled"]),
});

export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;

export const addTaskCommentSchema = z.object({
  taskId: objectIdSchema,
  content: z.string().min(1).max(2000),
  mentions: z.array(z.string()).optional(),
});

export type AddTaskCommentInput = z.infer<typeof addTaskCommentSchema>;

/* COD reconciliation schemas */
const codSettlementStatusSchema = z.enum(COD_SETTLEMENT_STATUSES);

export const createCodReconciliationSchema = z.object({
  orderId: objectIdSchema,
  orderNumber: z.string().min(1).max(50).trim(),
  courierName: z.string().min(1).max(200).trim(),
  trackingNumber: z.string().min(1).max(200).trim(),
  expectedAmount: z.number().nonnegative(),
  receivedAmount: z.number().nonnegative().optional(),
});

export type CreateCodReconciliationInput = z.infer<typeof createCodReconciliationSchema>;

export const reconcileCodSchema = z.object({
  codId: objectIdSchema,
  receivedAmount: z.number().nonnegative(),
  reconciledBy: z.string().min(1),
});

export type ReconcileCodInput = z.infer<typeof reconcileCodSchema>;

export const settleCodSchema = z.object({
  codId: objectIdSchema,
  settlementDate: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});

export type SettleCodInput = z.infer<typeof settleCodSchema>;

// Complaint schemas
export const createComplaintSchema = z.object({
  orderId: objectIdSchema,
  customerName: z.string().min(1).max(200).trim(),
  customerPhone: phoneSchema,
  type: z.enum(COMPLAINT_TYPES),
  description: z.string().min(1).max(3000).trim(),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
});

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;

export const updateComplaintStatusSchema = z.object({
  complaintId: objectIdSchema,
  status: z.enum(COMPLAINT_STATUSES),
  resolution: z.string().max(2000).optional(),
  internalNote: z.string().max(2000).optional(),
});

export type UpdateComplaintStatusInput = z.infer<typeof updateComplaintStatusSchema>;

export const assignComplaintSchema = z.object({
  complaintId: objectIdSchema,
  staffId: z.string().min(1),
  staffName: z.string().min(1).max(200),
});

export type AssignComplaintInput = z.infer<typeof assignComplaintSchema>;

// Call log schemas
export const createCallLogSchema = z.object({
  orderId: objectIdSchema,
  customerName: z.string().min(1).max(200).trim(),
  customerPhone: phoneSchema,
  staffId: z.string().min(1),
  staffName: z.string().min(1).max(200),
  duration: z.number().int().nonnegative(),
  outcome: z.enum(CALL_OUTCOMES),
  notes: z.string().max(2000).optional(),
  nextFollowUpAt: z.string().optional(),
});

export type CreateCallLogInput = z.infer<typeof createCallLogSchema>;

// Follow-up schemas
export const createFollowUpSchema = z.object({
  orderId: objectIdSchema,
  customerName: z.string().min(1).max(200).trim(),
  customerPhone: phoneSchema,
  type: z.enum(FOLLOW_UP_TYPES),
  title: z.string().min(1).max(500).trim(),
  description: z.string().max(2000).optional(),
  priority: z.enum(FOLLOW_UP_PRIORITIES).default("normal"),
  assignedTo: z.string().optional(),
  assignedToName: z.string().optional(),
  dueDate: z.string().min(1),
  isRecurring: z.boolean().default(false),
  recurringInterval: z.enum(["daily", "weekly", "monthly"]).optional(),
});

export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>;

export const updateFollowUpStatusSchema = z.object({
  followUpId: objectIdSchema,
  status: z.enum(FOLLOW_UP_STATUSES),
  notes: z.string().max(500).optional(),
});

export type UpdateFollowUpStatusInput = z.infer<typeof updateFollowUpStatusSchema>;

export const assignFollowUpSchema = z.object({
  followUpId: objectIdSchema,
  staffId: z.string().min(1),
  staffName: z.string().min(1).max(200),
});

export type AssignFollowUpInput = z.infer<typeof assignFollowUpSchema>;

// Failed delivery schemas
export const createFailedDeliverySchema = z.object({
  orderId: objectIdSchema,
  courierName: z.string().min(1).max(200),
  trackingNumber: z.string().min(1).max(200),
  reason: z.enum(FAILED_DELIVERY_REASONS),
  attemptCount: z.number().int().positive().default(1),
  customerResponse: z.string().max(500).optional(),
  nextAction: z.enum(FAILED_DELIVERY_ACTIONS),
  notes: z.string().max(1000).optional(),
});

export type CreateFailedDeliveryInput = z.infer<typeof createFailedDeliverySchema>;

export const resolveFailedDeliverySchema = z.object({
  failedDeliveryId: objectIdSchema,
  nextAction: z.enum(FAILED_DELIVERY_ACTIONS),
  notes: z.string().max(500).optional(),
});

export type ResolveFailedDeliveryInput = z.infer<typeof resolveFailedDeliverySchema>;
