"use server";

import { auth } from "@/shared/lib/auth";
import { CourierService } from "../services/courier-service";
import { ShipmentRepository } from "../repositories/shipment-repository";
import {
  createShipmentSchema,
  requestPickupSchema,
  transitionStatusSchema,
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

export async function createShipmentAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.Manage");

  try {
    const validated = createShipmentSchema.parse(formData);
    const service = new CourierService();
    const result = await service.createShipment(validated);
    revalidatePath("/dashboard/courier");
    revalidatePath("/dashboard/shipments");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("createShipmentAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function requestPickupAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.Manage");

  try {
    const validated = requestPickupSchema.parse(formData);
    const service = new CourierService();
    const result = await service.requestPickup(validated.shipmentId, validated.pickupDetails || {});
    revalidatePath("/dashboard/courier");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("requestPickupAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function transitionStatusAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth() as any;
  checkPermission(session, "Courier.Manage");

  try {
    const validated = transitionStatusSchema.parse(formData);
    const service = new CourierService();
    const result = await service.transitionStatus(
      validated.shipmentId,
      validated.toStatus,
      validated.message,
      session.user.id,
    );
    revalidatePath("/dashboard/courier");
    revalidatePath("/dashboard/shipments");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("transitionStatusAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listShipmentsAction(orderId?: string): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.View");

  try {
    const repo = new ShipmentRepository();
    const query = orderId ? { orderId } : {};
    const results = await repo.find(query);
    // Sort by newest first
    results.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return { success: true, data: results };
  } catch (error: any) {
    logger.error("listShipmentsAction failed", error);
    return { success: false, error: error.message };
  }
}
