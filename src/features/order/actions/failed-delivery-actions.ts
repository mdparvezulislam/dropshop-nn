"use server";

import { auth } from "@/shared/lib/auth";
import { checkPermission } from "@/shared/lib/check-permission";
import { FailedDeliveryService } from "../services/failed-delivery-service";
import {
  createFailedDeliverySchema,
  resolveFailedDeliverySchema,
} from "../types/validation";
import { revalidatePath } from "next/cache";
import { logger } from "@/shared/utils/logger";

export async function createFailedDeliveryAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<FailedDeliveryService["create"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = createFailedDeliverySchema.parse(formData);
    const service = new FailedDeliveryService();
    const result = await service.create(validated);
    revalidatePath("/dashboard/orders");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("createFailedDeliveryAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function resolveFailedDeliveryAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<FailedDeliveryService["resolve"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = resolveFailedDeliverySchema.parse(formData);
    const service = new FailedDeliveryService();
    const result = await service.resolve(validated.failedDeliveryId, validated.nextAction, validated.notes);
    revalidatePath("/dashboard/orders");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("resolveFailedDeliveryAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listUnresolvedDeliveriesAction(
  page: number = 1,
  limit: number = 20,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<FailedDeliveryService["listUnresolved"]>>;
  error?: string;
}> {
  try {
    const service = new FailedDeliveryService();
    const result = await service.listUnresolved(page, limit);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getFailedDeliveryStatsAction(): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<FailedDeliveryService["getStats"]>>;
  error?: string;
}> {
  try {
    const service = new FailedDeliveryService();
    const stats = await service.getStats();
    return { success: true, data: stats };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
