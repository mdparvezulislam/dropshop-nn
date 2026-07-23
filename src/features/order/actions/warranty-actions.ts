"use server";

import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/check-permission";
import { WarrantyService } from "../services/warranty-service";
import {
  createWarrantySchema,
  updateWarrantyStatusSchema,
} from "../types/validation";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/utils/logger";

export async function createWarrantyAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<WarrantyService["create"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = createWarrantySchema.parse(formData);
    const service = new WarrantyService();
    const result = await service.create(validated);
    revalidatePath("/dashboard/orders/warranty");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("createWarrantyAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function updateWarrantyStatusAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<WarrantyService["transitionStatus"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = updateWarrantyStatusSchema.parse(formData);
    const service = new WarrantyService();
    const result = await service.transitionStatus(validated.warrantyId, validated.toStatus, validated);
    revalidatePath("/dashboard/orders/warranty");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("updateWarrantyStatusAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function getWarrantyAction(warrantyId: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<WarrantyService["getWarranty"]>>;
  error?: string;
}> {
  try {
    const service = new WarrantyService();
    const result = await service.getWarranty(warrantyId);
    return { success: true, data: result ?? undefined };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function listWarrantiesAction(page: number = 1, limit: number = 20): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<WarrantyService["listWarranties"]>>;
  error?: string;
}> {
  try {
    const service = new WarrantyService();
    const result = await service.listWarranties(page, limit);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getWarrantyStatsAction(): Promise<{
  success: boolean;
  data?: Record<string, number>;
  error?: string;
}> {
  try {
    const service = new WarrantyService();
    const stats = await service.getStatusSummary();
    return { success: true, data: stats };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
