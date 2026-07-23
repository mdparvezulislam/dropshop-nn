"use server";

import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/check-permission";
import { CallLogService } from "../services/call-log-service";
import { createCallLogSchema } from "../types/validation";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/utils/logger";

export async function createCallLogAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CallLogService["create"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = createCallLogSchema.parse(formData);
    const service = new CallLogService();
    const result = await service.create(validated);
    revalidatePath("/dashboard/orders");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("createCallLogAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listCallLogsAction(
  page: number = 1,
  limit: number = 20,
  staffId?: string,
  outcome?: string,
  dateFrom?: string,
  dateTo?: string,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CallLogService["listAll"]>>;
  error?: string;
}> {
  try {
    const service = new CallLogService();
    const result = await service.listAll(page, limit, staffId, outcome, dateFrom, dateTo);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCallLogsByOrderAction(orderId: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CallLogService["getByOrder"]>>;
  error?: string;
}> {
  try {
    const service = new CallLogService();
    const result = await service.getByOrder(orderId);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCallLogStatsAction(): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CallLogService["getStats"]>>;
  error?: string;
}> {
  try {
    const service = new CallLogService();
    const stats = await service.getStats();
    return { success: true, data: stats };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
