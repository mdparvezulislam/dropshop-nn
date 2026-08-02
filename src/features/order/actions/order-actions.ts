"use server";

import { auth } from "@/lib/auth";
import { OrderService } from "../services/order-service";
import {
  createOrderFromDraftSchema,
  updateOrderStatusSchema,
  assignCourierSchema,
  updateTrackingSchema,
  addOrderNoteSchema,
  cancelOrderSchema,
  requestReturnSchema,
  processReturnSchema,
  refundOrderSchema,
  orderListQuerySchema,
  getOrderSchema,
  createManualOrderSchema,
  bulkOrderActionSchema,
} from "../types/validation";
import { checkPermission } from "@/lib/check-permission";
import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";

export async function createOrderFromDraftAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<OrderService["createFromDraft"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Create");
  try {
    const validated = createOrderFromDraftSchema.parse(formData);
    const service = new OrderService();
    const result = await service.createFromDraft(validated);
    revalidatePath("/dashboard/orders");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("createOrderFromDraftAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function updateOrderStatusAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<OrderService["transitionStatus"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const rawData = typeof formData === "object" && formData !== null ? { ...formData } : {};
    if (!("actorId" in rawData) || !(rawData as any).actorId) {
      (rawData as any).actorId = session?.user?.id || session?.user?.email || "admin";
    }
    const validated = updateOrderStatusSchema.parse(rawData);
    const service = new OrderService();
    const result = await service.transitionStatus(
      validated.orderId,
      validated.toStatus,
      validated.actorId ? { id: validated.actorId, role: "admin" } : undefined,
      validated.reason,
    );
    revalidatePath("/dashboard/orders");
    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    logger.error("updateOrderStatusAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function cancelOrderAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<OrderService["cancelOrder"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Cancel");
  try {
    const rawData = typeof formData === "object" && formData !== null ? { ...formData } : {};
    if (!("cancelledBy" in rawData) || !(rawData as any).cancelledBy) {
      (rawData as any).cancelledBy = session?.user?.id || session?.user?.email || "admin";
    }
    if (!("reason" in rawData) || !(rawData as any).reason) {
      (rawData as any).reason = "Cancelled by operator";
    }
    const validated = cancelOrderSchema.parse(rawData);
    const service = new OrderService();
    const result = await service.cancelOrder(
      validated.orderId,
      validated.reason || "Cancelled by operator",
      validated.cancelledBy || "admin",
    );
    revalidatePath("/dashboard/orders");
    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    logger.error("cancelOrderAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function deleteOrderPermanentlyAction(orderId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Cancel");
  try {
    const service = new OrderService();
    await service.hardDeleteOrder(orderId);
    revalidatePath("/dashboard/orders");
    return { success: true };
  } catch (error: any) {
    logger.error("deleteOrderPermanentlyAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function assignCourierAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<OrderService["assignCourier"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = assignCourierSchema.parse(formData);
    const service = new OrderService();
    const result = await service.assignCourier(
      validated.orderId,
      validated.courierId,
      validated.courierName,
      validated.trackingNumber,
      validated.trackingUrl,
    );
    revalidatePath("/dashboard/orders");
    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    logger.error("assignCourierAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function updateTrackingAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<OrderService["updateTracking"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = updateTrackingSchema.parse(formData);
    const service = new OrderService();
    const result = await service.updateTracking(
      validated.orderId,
      validated.trackingNumber,
      validated.trackingUrl,
    );
    revalidatePath("/dashboard/orders");
    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    logger.error("updateTrackingAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function addOrderNoteAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<OrderService["addNote"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = addOrderNoteSchema.parse(formData);
    const service = new OrderService();
    const result = await service.addNote(validated.orderId, validated.note, validated.internal);
    revalidatePath("/dashboard/orders");
    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    logger.error("addOrderNoteAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function requestReturnAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<OrderService["requestReturn"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = requestReturnSchema.parse(formData);
    const service = new OrderService();
    const result = await service.requestReturn(
      validated.orderId,
      validated.reason,
      validated.requestedBy,
    );
    revalidatePath("/dashboard/orders");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("requestReturnAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function processReturnAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<OrderService["processReturn"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = processReturnSchema.parse(formData);
    const service = new OrderService();
    const result = await service.processReturn(validated.orderId, validated.initiatedBy);
    revalidatePath("/dashboard/orders");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("processReturnAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function refundOrderAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<OrderService["refundOrder"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = refundOrderSchema.parse(formData);
    const service = new OrderService();
    const result = await service.refundOrder(
      validated.orderId,
      validated.refundAmount,
      validated.refundedBy,
    );
    revalidatePath("/dashboard/orders");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("refundOrderAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function getOrderAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<OrderService["getOrder"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.View");
  try {
    const validated = getOrderSchema.parse(formData);
    const service = new OrderService();
    const rawResult = await service.getOrder(validated.orderId);
    const result: any = rawResult ? JSON.parse(JSON.stringify(rawResult)) : undefined;
    if (result && (result.type === "reseller" || result.resellerId || result.createdBy || result.userId)) {
      try {
        const { ResellerModel } = await import("@/features/reseller/repositories/reseller-model");
        const uid = result.resellerId || result.createdBy || result.userId;
        const rProfile = await ResellerModel.findOne({
          $or: [
            { code: uid },
            { userId: uid },
            { _id: uid && uid.length === 24 ? uid : undefined },
          ].filter(Boolean),
        }).lean();
        if (rProfile) {
          result.resellerId = result.resellerId || rProfile.code || rProfile._id.toString();
          result.resellerShopName = result.resellerShopName || rProfile.businessName;
          result.resellerName = result.resellerName || rProfile.ownerName || rProfile.contactPerson;
          result.resellerOwnerName = result.resellerOwnerName || rProfile.ownerName || rProfile.contactPerson;
          result.resellerPhone = result.resellerPhone || rProfile.phone || rProfile.contactPhone;
        }
      } catch {
        /* ignore */
      }
    }
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getOrderByNumberAction(orderNumber: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<OrderService["getOrderByNumber"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.View");
  try {
    const service = new OrderService();
    const rawResult = await service.getOrderByNumber(orderNumber);
    const result: any = rawResult ? JSON.parse(JSON.stringify(rawResult)) : undefined;
    if (result && (result.type === "reseller" || result.resellerId || result.createdBy || result.userId)) {
      try {
        const { ResellerModel } = await import("@/features/reseller/repositories/reseller-model");
        const uid = result.resellerId || result.createdBy || result.userId;
        const rProfile = await ResellerModel.findOne({
          $or: [
            { code: uid },
            { userId: uid },
            { _id: uid && uid.length === 24 ? uid : undefined },
          ].filter(Boolean),
        }).lean();
        if (rProfile) {
          result.resellerId = result.resellerId || rProfile.code || rProfile._id.toString();
          result.resellerShopName = result.resellerShopName || rProfile.businessName;
          result.resellerName = result.resellerName || rProfile.ownerName || rProfile.contactPerson;
          result.resellerOwnerName = result.resellerOwnerName || rProfile.ownerName || rProfile.contactPerson;
          result.resellerPhone = result.resellerPhone || rProfile.phone || rProfile.contactPhone;
        }
      } catch {
        /* ignore */
      }
    }
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function listOrdersAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<OrderService["listOrders"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.View");
  try {
    const validated = orderListQuerySchema.parse(formData);
    const service = new OrderService();
    const result = await service.listOrders(validated, {
      page: validated.page,
      limit: validated.limit,
    });

    if (result && result.items && result.items.length > 0) {
      try {
        const { ResellerModel } = await import("@/features/reseller/repositories/reseller-model");
        const resellerUserIds = new Set<string>();
        result.items.forEach((item: any) => {
          if (item.type === "reseller" || item.resellerId || item.createdBy || item.userId) {
            const uid = item.resellerId || item.createdBy || item.userId;
            if (uid) resellerUserIds.add(uid);
          }
        });

        const resellerMap = new Map<string, any>();
        if (resellerUserIds.size > 0) {
          const resellers = await ResellerModel.find({
            $or: [
              { code: { $in: Array.from(resellerUserIds) } },
              { userId: { $in: Array.from(resellerUserIds) } },
              { _id: { $in: Array.from(resellerUserIds).filter((id) => id.length === 24) } },
            ],
          }).lean();

          resellers.forEach((r: any) => {
            if (r.code) resellerMap.set(r.code, r);
            if (r.userId) resellerMap.set(r.userId, r);
            if (r._id) resellerMap.set(r._id.toString(), r);
          });
        }

        result.items = result.items.map((item: any) => {
          const uid = item.resellerId || item.createdBy || item.userId;
          const r = uid ? resellerMap.get(uid) : null;
          const enriched = r
            ? {
                ...item,
                resellerId: item.resellerId || r.code || r._id.toString(),
                resellerShopName: item.resellerShopName || r.businessName,
                resellerName: item.resellerName || r.ownerName || r.contactPerson,
                resellerOwnerName: item.resellerOwnerName || r.ownerName || r.contactPerson,
                resellerPhone: item.resellerPhone || r.phone || r.contactPhone,
              }
            : item;

          const district = enriched.shipping?.district || enriched.customer?.district || enriched.shipping?.division || "Dhaka";
          const isDhaka = String(district).toLowerCase().includes("dhaka");
          const defaultDeliveryCents = isDhaka ? 6000 : 12000;

          const deliveryCents =
            (enriched.deliveryChargeCents && enriched.deliveryChargeCents > 0 ? enriched.deliveryChargeCents : undefined) ??
            (enriched.shipping?.deliveryFee && enriched.shipping.deliveryFee > 0 ? (enriched.shipping.deliveryFee <= 5000 ? enriched.shipping.deliveryFee * 100 : enriched.shipping.deliveryFee) : undefined) ??
            (enriched.shipping?.deliveryCharge && enriched.shipping.deliveryCharge > 0 ? (enriched.shipping.deliveryCharge <= 5000 ? enriched.shipping.deliveryCharge * 100 : enriched.shipping.deliveryCharge) : undefined) ??
            defaultDeliveryCents;

          const itemsList = enriched.pricing?.items || enriched.items || [];
          const subtotalCents =
            itemsList.length > 0
              ? itemsList.reduce((sum: number, i: any) => {
                  const rawP = i.unitSellingPrice ?? i.unitPrice ?? i.price ?? 0;
                  const pCents = rawP > 0 && rawP <= 5000 ? rawP * 100 : rawP;
                  return sum + pCents * (i.quantity || 1);
                }, 0)
              : (enriched.pricing?.subtotal ? (enriched.pricing.subtotal <= 5000 ? enriched.pricing.subtotal * 100 : enriched.pricing.subtotal) : 0);

          const grandTotalCents = subtotalCents + deliveryCents;

          if (!enriched.pricing) enriched.pricing = {};
          enriched.pricing.subtotal = subtotalCents;
          enriched.pricing.grandTotal = grandTotalCents;
          enriched.pricing.dueAmount = grandTotalCents;
          if (!enriched.shipping) enriched.shipping = {};
          enriched.shipping.deliveryFee = deliveryCents;
          enriched.shipping.deliveryCharge = deliveryCents;
          enriched.deliveryChargeCents = deliveryCents;

          return enriched;
        });
      } catch (err) {
        logger.error("Failed to populate reseller info in listOrdersAction", err as Error);
      }
    }

    return { success: true, data: result };
  } catch (error: any) {
    logger.error("listOrdersAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function createManualOrderAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<OrderService["createManualOrder"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Create");
  try {
    const validated = createManualOrderSchema.parse(formData);
    const service = new OrderService();
    const result = await service.createManualOrder(validated);
    revalidatePath("/dashboard/orders");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("createManualOrderAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function bulkOrderActionAction(formData: unknown): Promise<{
  success: boolean;
  data?: { successCount: number; failedCount: number };
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = bulkOrderActionSchema.parse(formData);
    const service = new OrderService();
    const result = await service.bulkAction(validated.action, validated.orderIds);
    revalidatePath("/dashboard/orders");
    return { success: true, data: { successCount: result.success, failedCount: result.failed } };
  } catch (error: any) {
    logger.error("bulkOrderActionAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function getOrderDashboardStatsAction(): Promise<{
  success: boolean;
  data?: Record<string, number>;
  error?: string;
}> {
  // Order volumes, COD exposure and per-status counts are commercially
  // sensitive — this read was previously open to anyone who could call it.
  const session = await auth();
  checkPermission(session, "Order.View");
  try {
    const service = new OrderService();
    const stats = await service.getDashboardStats();
    return { success: true, data: stats };
  } catch (error: any) {
    logger.error("getOrderDashboardStatsAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function updateOrderPaymentAction(formData: {
  orderId: string;
  paymentStatus: "unpaid" | "partial" | "paid" | "refunded";
  advancePaid?: number;
  paymentMethod?: string;
  deliveryCharge?: number;
}): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const service = new OrderService();
    const result = await service.updateOrderPayment(formData);
    revalidatePath("/dashboard/orders");
    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    logger.error("updateOrderPaymentAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function updateOrderAddressAction(formData: {
  orderId: string;
  customerName?: string;
  phone?: string;
  division?: string;
  district?: string;
  upazila?: string;
  address?: string;
  deliveryNote?: string;
}): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const service = new OrderService();
    const result = await service.updateOrderAddress(formData);
    revalidatePath("/dashboard/orders");
    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    logger.error("updateOrderAddressAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function bulkUpdateOrderStatusAction(input: {
  orderIds: string[];
  status: string;
}): Promise<{
  success: boolean;
  count?: number;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const { OrderModel } = await import("../repositories/order-model");
    const { CheckoutSessionModel } = await import("@/features/checkout/repositories/checkout-model");

    const statusMap: Record<string, string> = {
      confirm: "confirmed",
      confirmed: "confirmed",
      processing: "processing",
      packaging: "processing",
      pickup: "pickup_requested",
      pickup_requested: "pickup_requested",
      book_courier: "pickup_requested",
      ship: "shipped",
      shipped: "shipped",
      deliver: "delivered",
      delivered: "delivered",
      complete: "completed",
      completed: "completed",
      cancel: "cancelled",
      cancelled: "cancelled",
    };

    const targetStatus = statusMap[input.status] || input.status;

    const res1 = await OrderModel.updateMany(
      { _id: { $in: input.orderIds } },
      {
        $set: { status: targetStatus },
        $push: {
          timeline: {
            id: new Date().getTime().toString(),
            eventType: "order_updated",
            action: "status_change",
            summary: `Status Updated to ${targetStatus.toUpperCase()}`,
            title: `Status Updated to ${targetStatus.toUpperCase()}`,
            date: new Date(),
            timestamp: new Date(),
            note: "Bulk status update executed by Admin",
          },
        },
      }
    );

    const res2 = await CheckoutSessionModel.updateMany(
      { _id: { $in: input.orderIds } },
      { $set: { status: targetStatus } }
    );

    revalidatePath("/dashboard/orders");
    const count = (res1.modifiedCount || 0) + (res2.modifiedCount || 0);
    return { success: true, count: count || input.orderIds.length };
  } catch (error: any) {
    logger.error("bulkUpdateOrderStatusAction failed", error);
    return { success: false, error: error.message };
  }
}
