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
    const validated = updateOrderStatusSchema.parse(formData);
    const service = new OrderService();
    const result = await service.transitionStatus(
      validated.orderId,
      validated.toStatus,
      validated.actorId ? { id: validated.actorId, role: "admin" } : undefined,
      validated.reason,
    );
    revalidatePath("/dashboard/orders");
    return { success: true, data: result };
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
    const validated = cancelOrderSchema.parse(formData);
    const service = new OrderService();
    const result = await service.cancelOrder(
      validated.orderId,
      validated.reason,
      validated.cancelledBy,
    );
    revalidatePath("/dashboard/orders");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("cancelOrderAction failed", error);
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
    return { success: true, data: result };
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
    return { success: true, data: result };
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
    return { success: true, data: result };
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
  checkPermission(session, "Order.Read");
  try {
    const validated = getOrderSchema.parse(formData);
    const service = new OrderService();
    const result = await service.getOrder(validated.orderId);
    return { success: true, data: result ?? undefined };
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
  checkPermission(session, "Order.Read");
  try {
    const service = new OrderService();
    const result = await service.getOrderByNumber(orderNumber);
    return { success: true, data: result ?? undefined };
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
  checkPermission(session, "Order.Read");
  try {
    const validated = orderListQuerySchema.parse(formData);
    const service = new OrderService();
    const result = await service.listOrders(validated, {
      page: validated.page,
      limit: validated.limit,
    });
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
  try {
    const service = new OrderService();
    const stats = await service.getDashboardStats();
    return { success: true, data: stats };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
