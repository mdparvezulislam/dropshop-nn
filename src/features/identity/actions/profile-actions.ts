"use server";

import { auth } from "@/lib/auth";
import { AuthService } from "@/features/auth/services/auth-service";
import { profileUpdateSchema, changePasswordSchema } from "../types/validation";
import { UnauthorizedError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";

function getSessionUser(session: any): { id: string; name?: string; role?: string } {
  if (!session?.user) {
    throw new UnauthorizedError("Session expired or invalid");
  }
  return session.user;
}

export async function updateProfileAction(formData: any) {
  const session = await auth();
  const sessionUser = getSessionUser(session);

  logger.info("Identity Action: updateProfileAction called");

  const validated = profileUpdateSchema.parse(formData);
  const service = new AuthService();
  const result = await service.updateProfile(sessionUser.id, validated);

  revalidatePath("/dashboard/identity/profile");
  return { success: true, data: result };
}

export async function changePasswordAction(formData: any) {
  const session = await auth();
  const sessionUser = getSessionUser(session);

  logger.info("Identity Action: changePasswordAction called");

  const validated = changePasswordSchema.parse(formData);
  const service = new AuthService();
  await service.changePassword(sessionUser.id, validated.currentPassword, validated.newPassword);

  return { success: true, data: null };
}
