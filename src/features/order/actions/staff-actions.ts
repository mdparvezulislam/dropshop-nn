"use server";

import { auth } from "@/shared/lib/auth";
import { checkPermission } from "@/shared/lib/check-permission";
import { StaffService } from "../services/staff-service";
import type { StaffRole } from "../repositories/staff-repository";
import {
  assignStaffSchema,
  completeStaffAssignmentSchema,
} from "../types/validation";
import { revalidatePath } from "next/cache";
import { logger } from "@/shared/utils/logger";

export async function assignStaffAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<StaffService["assign"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = assignStaffSchema.parse(formData);
    const service = new StaffService();
    const result = await service.assign(validated);
    revalidatePath("/dashboard/orders/staff");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("assignStaffAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function completeStaffAssignmentAction(
  formData: unknown,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<StaffService["complete"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = completeStaffAssignmentSchema.parse(formData);
    const service = new StaffService();
    const result = await service.complete(validated.assignmentId);
    revalidatePath("/dashboard/orders/staff");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("completeStaffAssignmentAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function getOrderAssignmentsAction(orderId: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<StaffService["getOrderAssignments"]>>;
  error?: string;
}> {
  try {
    const service = new StaffService();
    const result = await service.getOrderAssignments(orderId);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function listStaffAssignmentsAction(
  page?: number,
  limit?: number,
  role?: StaffRole,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<StaffService["listAll"]>>;
  error?: string;
}> {
  try {
    const service = new StaffService();
    const result = await service.listAll(page, limit, role);
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("listStaffAssignmentsAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function getStaffStatsAction(): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<StaffService["getStats"]>>;
  error?: string;
}> {
  try {
    const service = new StaffService();
    const stats = await service.getStats();
    return { success: true, data: stats };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
