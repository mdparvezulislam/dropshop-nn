"use server";

import { auth } from "@/shared/lib/auth";
import { checkPermission } from "@/shared/lib/check-permission";
import { CodService } from "../services/cod-service";
import {
  createCodReconciliationSchema,
  reconcileCodSchema,
  settleCodSchema,
} from "../types/validation";
import { revalidatePath } from "next/cache";
import { logger } from "@/shared/utils/logger";

export async function createCodReconciliationAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CodService["createOrUpdate"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = createCodReconciliationSchema.parse(formData);
    const service = new CodService();
    const result = await service.createOrUpdate(validated);
    revalidatePath("/dashboard/orders/cod");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("createCodReconciliationAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function reconcileCodAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CodService["reconcile"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = reconcileCodSchema.parse(formData);
    const service = new CodService();
    const result = await service.reconcile(validated.codId, validated);
    revalidatePath("/dashboard/orders/cod");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("reconcileCodAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function settleCodAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CodService["settle"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = settleCodSchema.parse(formData);
    const service = new CodService();
    const result = await service.settle(validated.codId, validated);
    revalidatePath("/dashboard/orders/cod");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("settleCodAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listCodAction(page: number = 1, limit: number = 20): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CodService["listAll"]>>;
  error?: string;
}> {
  try {
    const service = new CodService();
    const result = await service.listAll(page, limit);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCodStatsAction(): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CodService["getStats"]>>;
  error?: string;
}> {
  try {
    const service = new CodService();
    const stats = await service.getStats();
    return { success: true, data: stats };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
