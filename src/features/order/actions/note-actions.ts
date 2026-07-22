"use server";

import { auth } from "@/shared/lib/auth";
import { checkPermission } from "@/shared/lib/check-permission";
import { NoteService } from "../services/note-service";
import { createOrderNoteSchema } from "../types/validation";
import { revalidatePath } from "next/cache";
import { logger } from "@/shared/utils/logger";

export async function createOrderNoteAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<NoteService["addNote"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Order.Update");
  try {
    const validated = createOrderNoteSchema.parse(formData);
    const service = new NoteService();
    const result = await service.addNote(validated);
    revalidatePath("/dashboard/orders");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("createOrderNoteAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function getOrderNotesAction(orderId: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<NoteService["getNotesByOrder"]>>;
  error?: string;
}> {
  try {
    const service = new NoteService();
    const result = await service.getNotesByOrder(orderId);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
