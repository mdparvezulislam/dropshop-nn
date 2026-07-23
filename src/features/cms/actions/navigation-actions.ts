"use server";

import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/check-permission";
import { NavigationService } from "../services/navigation-service";
import { upsertNavigationSchema } from "../types/validation";
import { revalidatePath } from "next/cache";
import type { NavigationLocation } from "../domain/navigation-entity";

export async function listNavigationAction(): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Content.View");
    const service = new NavigationService();
    const result = await service.list();
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to list navigation",
    };
  }
}

export async function upsertNavigationAction(formData: unknown): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Content.Update");
    const validated = upsertNavigationSchema.parse(formData);
    const service = new NavigationService();
    const user = session?.user as { id?: string } | undefined;
    const result = await service.upsert(validated, user?.id);
    revalidatePath("/dashboard/content/navigation");
    revalidatePath("/");
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save navigation",
    };
  }
}

export async function getPublicNavigationAction(
  location: NavigationLocation,
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const service = new NavigationService();
    const result = await service.getByLocation(location);
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load navigation",
    };
  }
}

export async function deleteNavigationAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Content.Delete");
    const service = new NavigationService();
    await service.delete(id);
    revalidatePath("/dashboard/content/navigation");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete navigation",
    };
  }
}
