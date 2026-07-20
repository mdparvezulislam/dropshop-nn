"use server";

import { auth } from "@/shared/lib/auth";
import { IdentityService } from "../services/identity-service";
import { customerRegistrationSchema, businessRegistrationSchema } from "../types/validation";
import { UnauthorizedError } from "@/shared/errors/app-error";
import { logger } from "@/shared/utils/logger";
import { revalidatePath } from "next/cache";

function getSessionUser(session: any): { id: string; name?: string; role?: string } {
  if (!session?.user) {
    throw new UnauthorizedError("Session expired or invalid");
  }
  return session.user;
}

export async function registerCustomerAction(formData: any) {
  logger.info("Identity Action: registerCustomerAction called");

  const validated = customerRegistrationSchema.parse(formData);
  const service = new IdentityService();
  const result = await service.registerCustomer(validated);

  revalidatePath("/");
  return { success: true, data: { id: result.id, email: result.email, role: result.role } };
}

export async function registerBusinessAction(formData: any) {
  logger.info("Identity Action: registerBusinessAction called", {
    email: formData.email,
    role: formData.role,
  });

  const validated = businessRegistrationSchema.parse(formData);
  const service = new IdentityService();
  const result = await service.registerBusiness(validated);

  revalidatePath("/");
  return {
    success: true,
    data: {
      userId: result.user.id,
      businessProfileId: result.businessProfile.id,
      businessName: result.businessProfile.businessName,
      role: result.businessProfile.role,
    },
  };
}

export async function inviteUserAction(formData: any) {
  const session = await auth();
  const sessionUser = getSessionUser(session);

  logger.info("Identity Action: inviteUserAction called", { email: formData.email });

  const { inviteUserSchema } = await import("../types/validation");
  const validated = inviteUserSchema.parse(formData);

  revalidatePath("/dashboard/identity/users");
  return { success: true, data: { email: validated.email, role: validated.role, invited: true } };
}
