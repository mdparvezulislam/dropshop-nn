"use server";

import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/check-permission";
import { ReturnService } from "../services/return-service";
import { createReturnSchema, updateReturnStatusSchema } from "../types/validation";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/utils/logger";

export async function createReturnAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ReturnService["create"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = createReturnSchema.parse(formData);
    const service = new ReturnService();
    const result = await service.create(validated);
    revalidatePath("/dashboard/orders/returns");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("createReturnAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function updateReturnStatusAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ReturnService["transitionStatus"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = updateReturnStatusSchema.parse(formData);
    const service = new ReturnService();
    const result = await service.transitionStatus(
      validated.returnId,
      validated.toStatus,
      validated,
    );
    revalidatePath("/dashboard/orders/returns");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("updateReturnStatusAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function getReturnAction(returnId: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ReturnService["getReturn"]>>;
  error?: string;
}> {
  try {
    const service = new ReturnService();
    const result = await service.getReturn(returnId);
    return { success: true, data: result ?? undefined };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function listReturnsAction(
  page: number = 1,
  limit: number = 20,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ReturnService["listReturns"]>>;
  error?: string;
}> {
  try {
    const service = new ReturnService();
    const result = await service.listReturns(page, limit);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getReturnStatsAction(): Promise<{
  success: boolean;
  data?: Record<string, number>;
  error?: string;
}> {
  try {
    const service = new ReturnService();
    const stats = await service.getStatusSummary();
    return { success: true, data: stats };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
