"use server";

import { auth } from "@/shared/lib/auth";
import { checkPermission } from "@/shared/lib/check-permission";
import { RiskService } from "../services/risk-service";
import {
  createRiskFlagSchema,
  resolveRiskFlagSchema,
} from "../types/validation";
import { revalidatePath } from "next/cache";
import { logger } from "@/shared/utils/logger";

export async function createRiskFlagAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<RiskService["flagOrder"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = createRiskFlagSchema.parse(formData);
    const service = new RiskService();
    const result = await service.flagOrder(validated);
    revalidatePath("/dashboard/orders/risk");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("createRiskFlagAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function resolveRiskFlagAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<RiskService["resolve"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = resolveRiskFlagSchema.parse(formData);
    const service = new RiskService();
    const result = await service.resolve(
      validated.riskId,
      validated.resolution,
      session?.user?.id ?? "system",
    );
    revalidatePath("/dashboard/orders/risk");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("resolveRiskFlagAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function getOrderRisksAction(orderId: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<RiskService["getOrderRisks"]>>;
  error?: string;
}> {
  try {
    const service = new RiskService();
    const result = await service.getOrderRisks(orderId);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getActiveRisksAction(
  page: number = 1,
  limit: number = 20,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<RiskService["getActiveRisks"]>>;
  error?: string;
}> {
  try {
    const service = new RiskService();
    const result = await service.getActiveRisks(page, limit);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
