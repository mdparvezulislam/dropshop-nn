"use server";

import { auth } from "@/lib/auth";
import { BusinessProfileService } from "../services/business-profile-service";
import { createBusinessProfileSchema, updateBusinessProfileSchema } from "../types/validation";
import { checkPermission } from "@/lib/check-permission";
import { UnauthorizedError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";

function getSessionUser(session: any): { id: string; name?: string; role?: string } {
  if (!session?.user) {
    throw new UnauthorizedError("Session expired or invalid");
  }
  return session.user;
}

export async function createBusinessProfileAction(formData: any) {
  const session = await auth();
  checkPermission(session, "Identity.Create");
  const sessionUser = getSessionUser(session);

  logger.info("Identity Action: createBusinessProfileAction called", {
    userId: sessionUser.id,
  });

  const validated = createBusinessProfileSchema.parse(formData);
  const service = new BusinessProfileService();
  const result = await service.create({
    ...validated,
    userId: sessionUser.id,
  });

  revalidatePath("/dashboard/identity/business-profiles");
  return { success: true, data: result };
}

export async function updateBusinessProfileAction(id: string, formData: any) {
  const session = await auth();
  checkPermission(session, "Identity.Update");

  logger.info("Identity Action: updateBusinessProfileAction called", { id });

  const validated = updateBusinessProfileSchema.parse(formData);
  const service = new BusinessProfileService();
  const result = await service.update(id, validated);

  revalidatePath(`/dashboard/identity/business-profiles/${id}`);
  return { success: true, data: result };
}

export async function submitBusinessForApprovalAction(id: string) {
  const session = await auth();
  getSessionUser(session);

  logger.info("Identity Action: submitBusinessForApprovalAction called", { id });

  const service = new BusinessProfileService();
  const result = await service.submitForApproval(id);

  revalidatePath(`/dashboard/identity/business-profiles/${id}`);
  return { success: true, data: result };
}

export async function getBusinessProfileAction(id: string) {
  const session = await auth();
  getSessionUser(session);

  const service = new BusinessProfileService();
  const result = await service.findById(id);

  return { success: true, data: result };
}

export async function getMyBusinessProfileAction() {
  const session = await auth();
  const sessionUser = getSessionUser(session);

  const service = new BusinessProfileService();
  const result = await service.findByUserId(sessionUser.id);

  return { success: true, data: result };
}

export async function getPendingApprovalsAction(role?: string) {
  const session = await auth();
  checkPermission(session, "Identity.View");

  const service = new BusinessProfileService();
  const result = await service.findPendingApprovals(role);

  return { success: true, data: result };
}
