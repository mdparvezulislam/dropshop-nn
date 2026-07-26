"use server";

import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/check-permission";
import { FollowUpService } from "../services/follow-up-service";
import {
  createFollowUpSchema,
  updateFollowUpStatusSchema,
  assignFollowUpSchema,
} from "../types/validation";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/utils/logger";

export async function createFollowUpAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<FollowUpService["create"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = createFollowUpSchema.parse(formData);
    const service = new FollowUpService();
    const result = await service.create(validated);
    revalidatePath("/dashboard/orders");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("createFollowUpAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function updateFollowUpStatusAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<FollowUpService["updateStatus"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = updateFollowUpStatusSchema.parse(formData);
    const service = new FollowUpService();
    const result = await service.updateStatus(validated.followUpId, validated.status);
    revalidatePath("/dashboard/orders");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("updateFollowUpStatusAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function assignFollowUpAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<FollowUpService["assign"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = assignFollowUpSchema.parse(formData);
    const service = new FollowUpService();
    const result = await service.assign(
      validated.followUpId,
      validated.staffId,
      validated.staffName,
    );
    revalidatePath("/dashboard/orders");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("assignFollowUpAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listFollowUpsAction(
  page: number = 1,
  limit: number = 20,
  status?: string,
  priority?: string,
  assigneeId?: string,
  type?: string,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<FollowUpService["listAll"]>>;
  error?: string;
}> {
  try {
    const service = new FollowUpService();
    const result = await service.listAll(page, limit, status, priority, assigneeId, type);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getFollowUpStatsAction(): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<FollowUpService["getStats"]>>;
  error?: string;
}> {
  try {
    const service = new FollowUpService();
    const stats = await service.getStats();
    return { success: true, data: stats };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
