"use server";

import { auth } from "@/shared/lib/auth";
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
} from "../types/validation";
import { ForbiddenError, UnauthorizedError } from "@/shared/errors/app-error";
import { logger } from "@/shared/utils/logger";
import { revalidatePath } from "next/cache";

function checkPermission(
  session: { user?: { permissions?: string[]; email?: string | null; id?: string } } | null,
  permission: string,
): void {
  if (!session) {
    throw new UnauthorizedError("Session expired or invalid");
  }
  const permissions = session.user?.permissions || [];
  if (!permissions.includes("*") && !permissions.includes(permission)) {
    throw new ForbiddenError(`Missing required permission: ${permission}`);
  }
}

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
    const result = await service.cancelOrder(validated.orderId, validated.reason, validated.cancelledBy);
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
  checkPermission(session, "Order.AssignCourier");

  try {
    const validated = assignCourierSchema.parse(formData);
    const service = new OrderService();
    const result = await service.assignCourier(
      validated.orderId,
      validated.courierId,
      validated.courierName,
      validated.trackingNumber,
      validated.trackingUrl,
      { id: session?.user?.id ?? "system", name: session?.user?.email ?? undefined, role: "admin" },
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
  checkPermission(session, "Order.UpdateTracking");

  try {
    const validated = updateTrackingSchema.parse(formData);
    const service = new OrderService();
    const result = await service.updateTracking(validated.orderId, validated.trackingNumber, validated.trackingUrl);
    revalidatePath("/dashboard/orders");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("updateTrackingAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function requestReturnAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<OrderService["requestReturn"]>>;
  error?: string;
}> {
  const session = await auth();

  try {
    const validated = requestReturnSchema.parse(formData);
    const service = new OrderService();
    const result = await service.requestReturn(
      validated.orderId,
      validated.reason,
      validated.requestedBy ?? session?.user?.id,
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
  checkPermission(session, "Order.ProcessReturn");

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
  checkPermission(session, "Order.Refund");

  try {
    const validated = refundOrderSchema.parse(formData);
    const service = new OrderService();
    const result = await service.refundOrder(validated.orderId, validated.refundAmount, validated.refundedBy);
    revalidatePath("/dashboard/orders");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("refundOrderAction failed", error);
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
    const result = await service.addNote(
      validated.orderId,
      validated.note,
      validated.internal,
      { id: session?.user?.id ?? "system", name: session?.user?.email ?? undefined, role: "admin" },
    );
    revalidatePath("/dashboard/orders");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("addOrderNoteAction failed", error);
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
    const result = await service.getOrder(validated.orderId);
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("getOrderAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function getOrderByNumberAction(orderNumber: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<OrderService["getOrderByNumber"]>>;
  error?: string;
}> {
  try {
    const service = new OrderService();
    const result = await service.getOrderByNumber(orderNumber);
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("getOrderByNumberAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listOrdersAction(query: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<OrderService["listOrders"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.View");

  try {
    const validated = orderListQuerySchema.parse(query);
    const filter: Record<string, unknown> = {};
    if (validated.status && validated.status !== "all") filter.status = validated.status;
    if (validated.type) filter.type = validated.type;

    const service = new OrderService();
    const result = await service.listOrders(filter, {
      page: validated.page,
      limit: validated.limit,
    }, validated.sortBy ? { sortBy: validated.sortBy, sortOrder: validated.sortOrder } : { sortBy: "createdAt", sortOrder: "desc" });
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("listOrdersAction failed", error);
    return { success: false, error: error.message };
  }
}
