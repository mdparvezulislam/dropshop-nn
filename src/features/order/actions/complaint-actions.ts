"use server";

import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/check-permission";
import { ComplaintService } from "../services/complaint-service";
import {
  createComplaintSchema,
  updateComplaintStatusSchema,
  assignComplaintSchema,
} from "../types/validation";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/utils/logger";

export async function createComplaintAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ComplaintService["create"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = createComplaintSchema.parse(formData);
    const service = new ComplaintService();
    const result = await service.create(validated);
    revalidatePath("/dashboard/orders");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("createComplaintAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function updateComplaintStatusAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ComplaintService["updateStatus"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = updateComplaintStatusSchema.parse(formData);
    const service = new ComplaintService();
    const result = await service.updateStatus(
      validated.complaintId,
      validated.status,
      validated.resolution,
    );
    revalidatePath("/dashboard/orders");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("updateComplaintStatusAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function assignComplaintAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ComplaintService["assign"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = assignComplaintSchema.parse(formData);
    const service = new ComplaintService();
    const result = await service.assign(
      validated.complaintId,
      validated.staffId,
      validated.staffName,
    );
    revalidatePath("/dashboard/orders");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("assignComplaintAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listComplaintsAction(
  page: number = 1,
  limit: number = 20,
  status?: string,
  priority?: string,
  type?: string,
  assigneeId?: string,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ComplaintService["listAll"]>>;
  error?: string;
}> {
  try {
    const service = new ComplaintService();
    const result = await service.listAll(page, limit, status, priority, type, assigneeId);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getComplaintStatsAction(): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ComplaintService["getStats"]>>;
  error?: string;
}> {
  try {
    const service = new ComplaintService();
    const stats = await service.getStats();
    return { success: true, data: stats };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
