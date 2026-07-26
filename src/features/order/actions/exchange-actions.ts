"use server";

import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/check-permission";
import { ExchangeService } from "../services/exchange-service";
import { createExchangeSchema, updateExchangeStatusSchema } from "../types/validation";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/utils/logger";

export async function createExchangeAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ExchangeService["create"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = createExchangeSchema.parse(formData);
    const service = new ExchangeService();
    const result = await service.create(validated);
    revalidatePath("/dashboard/orders/exchange");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("createExchangeAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function updateExchangeStatusAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ExchangeService["transitionStatus"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = updateExchangeStatusSchema.parse(formData);
    const service = new ExchangeService();
    const result = await service.transitionStatus(
      validated.exchangeId,
      validated.toStatus,
      validated,
    );
    revalidatePath("/dashboard/orders/exchange");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("updateExchangeStatusAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function getExchangeAction(exchangeId: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ExchangeService["getExchange"]>>;
  error?: string;
}> {
  try {
    const service = new ExchangeService();
    const result = await service.getExchange(exchangeId);
    return { success: true, data: result ?? undefined };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function listExchangesAction(
  page: number = 1,
  limit: number = 20,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ExchangeService["listExchanges"]>>;
  error?: string;
}> {
  try {
    const service = new ExchangeService();
    const result = await service.listExchanges(page, limit);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getExchangeStatsAction(): Promise<{
  success: boolean;
  data?: Record<string, number>;
  error?: string;
}> {
  try {
    const service = new ExchangeService();
    const stats = await service.getStatusSummary();
    return { success: true, data: stats };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
