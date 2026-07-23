"use server";

import { auth } from "@/lib/auth";
import { ApprovalService } from "../services/approval-service";
import { VerificationService } from "../services/verification-service";
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

export async function approveBusinessAction(businessProfileId: string) {
  const session = await auth();
  checkPermission(session, "Identity.Approve");
  const sessionUser = getSessionUser(session);

  logger.info("Identity Action: approveBusinessAction called", { businessProfileId });

  const service = new ApprovalService();
  const result = await service.approve(businessProfileId, {
    id: sessionUser.id,
    name: sessionUser.name,
    role: sessionUser.role,
  });

  revalidatePath("/dashboard/identity/business-profiles");
  revalidatePath(`/dashboard/identity/business-profiles/${businessProfileId}`);
  return { success: true, data: result };
}

export async function rejectBusinessAction(businessProfileId: string, reason?: string) {
  const session = await auth();
  checkPermission(session, "Identity.Reject");
  const sessionUser = getSessionUser(session);

  logger.info("Identity Action: rejectBusinessAction called", { businessProfileId, reason });

  const service = new ApprovalService();
  const result = await service.reject(
    businessProfileId,
    {
      id: sessionUser.id,
      name: sessionUser.name,
      role: sessionUser.role,
    },
    reason,
  );

  revalidatePath("/dashboard/identity/business-profiles");
  revalidatePath(`/dashboard/identity/business-profiles/${businessProfileId}`);
  return { success: true, data: result };
}

export async function suspendBusinessAction(businessProfileId: string, reason?: string) {
  const session = await auth();
  checkPermission(session, "Identity.Suspend");
  const sessionUser = getSessionUser(session);

  logger.info("Identity Action: suspendBusinessAction called", { businessProfileId, reason });

  const service = new ApprovalService();
  const result = await service.suspend(
    businessProfileId,
    {
      id: sessionUser.id,
      name: sessionUser.name,
      role: sessionUser.role,
    },
    reason,
  );

  revalidatePath(`/dashboard/identity/business-profiles/${businessProfileId}`);
  return { success: true, data: result };
}

export async function unsuspendBusinessAction(businessProfileId: string) {
  const session = await auth();
  checkPermission(session, "Identity.Suspend");
  const sessionUser = getSessionUser(session);

  logger.info("Identity Action: unsuspendBusinessAction called", { businessProfileId });

  const service = new ApprovalService();
  const result = await service.unsuspend(businessProfileId, {
    id: sessionUser.id,
    name: sessionUser.name,
    role: sessionUser.role,
  });

  revalidatePath(`/dashboard/identity/business-profiles/${businessProfileId}`);
  return { success: true, data: result };
}

export async function sendEmailVerificationAction() {
  const session = await auth();
  const sessionUser = getSessionUser(session);

  logger.info("Identity Action: sendEmailVerificationAction called");

  const service = new VerificationService();
  await service.sendEmailVerification(sessionUser.id);

  return { success: true, data: null };
}

export async function verifyEmailAction(token: string) {
  const session = await auth();
  const sessionUser = getSessionUser(session);

  logger.info("Identity Action: verifyEmailAction called");

  const service = new VerificationService();
  await service.verifyEmail(sessionUser.id, token);

  revalidatePath("/dashboard/identity/profile");
  return { success: true, data: null };
}

export async function sendPhoneVerificationAction() {
  const session = await auth();
  const sessionUser = getSessionUser(session);

  logger.info("Identity Action: sendPhoneVerificationAction called");

  const service = new VerificationService();
  await service.sendPhoneVerification(sessionUser.id);

  return { success: true, data: null };
}

export async function verifyPhoneAction(otp: string) {
  const session = await auth();
  const sessionUser = getSessionUser(session);

  logger.info("Identity Action: verifyPhoneAction called");

  const service = new VerificationService();
  await service.verifyPhone(sessionUser.id, otp);

  revalidatePath("/dashboard/identity/profile");
  return { success: true, data: null };
}
