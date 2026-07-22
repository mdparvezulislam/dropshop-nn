"use server";

import { auth } from "@/shared/lib/auth";
import { checkPermission } from "@/shared/lib/check-permission";
import { TaskService } from "../services/task-service";
import type { TaskStatus, TaskPriority } from "../repositories/task-repository";
import {
  createTaskSchema,
  updateTaskStatusSchema,
  addTaskCommentSchema,
} from "../types/validation";
import { revalidatePath } from "next/cache";
import { logger } from "@/shared/utils/logger";

export async function createTaskAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<TaskService["create"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = createTaskSchema.parse(formData);
    const service = new TaskService();
    const result = await service.create(validated);
    revalidatePath("/dashboard/orders/tasks");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("createTaskAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function updateTaskStatusAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<TaskService["updateStatus"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = updateTaskStatusSchema.parse(formData);
    const service = new TaskService();
    const result = await service.updateStatus(validated.taskId, validated.status);
    revalidatePath("/dashboard/orders/tasks");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("updateTaskStatusAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function addTaskChecklistItemAction(
  taskId: string,
  text: string,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<TaskService["addChecklistItem"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const service = new TaskService();
    const result = await service.addChecklistItem(taskId, text);
    revalidatePath("/dashboard/orders/tasks");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("addTaskChecklistItemAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function toggleTaskChecklistItemAction(
  taskId: string,
  itemId: string,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<TaskService["toggleChecklistItem"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const service = new TaskService();
    const result = await service.toggleChecklistItem(taskId, itemId);
    revalidatePath("/dashboard/orders/tasks");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("toggleTaskChecklistItemAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listTasksAction(
  page?: number,
  limit?: number,
  status?: TaskStatus,
  priority?: TaskPriority,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<TaskService["listAll"]>>;
  error?: string;
}> {
  try {
    const service = new TaskService();
    const result = await service.listAll(page, limit, status, priority);
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("listTasksAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function addTaskCommentAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<TaskService["addComment"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = addTaskCommentSchema.parse(formData);
    const service = new TaskService();
    const result = await service.addComment(validated.taskId, validated);
    revalidatePath("/dashboard/orders/tasks");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("addTaskCommentAction failed", error);
    return { success: false, error: error.message };
  }
}
