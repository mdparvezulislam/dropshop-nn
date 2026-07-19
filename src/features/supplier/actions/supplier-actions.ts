"use server";

import { auth } from "@/shared/lib/auth";
import { SupplierService } from "../services/supplier-service";
import {
  createSupplierSchema,
  updateSupplierSchema,
  settingsSchema,
  bankAccountSchema,
} from "../types/validation";
import { ForbiddenError, UnauthorizedError } from "@/shared/errors/app-error";
import { logger } from "@/shared/utils/logger";
import { revalidatePath } from "next/cache";

function checkPermission(session: any, permission: string) {
  if (!session) {
    throw new UnauthorizedError("Session expired or invalid");
  }
  const permissions = session.user?.permissions || [];
  if (!permissions.includes("*") && !permissions.includes(permission)) {
    throw new ForbiddenError(`Missing required permission: ${permission}`);
  }
}

export async function createSupplierAction(formData: any) {
  const session = await auth();
  checkPermission(session, "Supplier.Create");

  logger.info("Supplier Action: createSupplierAction called", { email: session?.user?.email });

  const validated = createSupplierSchema.parse(formData);
  const service = new SupplierService();
  const result = await service.createSupplier(validated);

  revalidatePath("/dashboard/suppliers");
  return { success: true, data: result };
}

export async function updateSupplierAction(id: string, formData: any) {
  const session = await auth();
  checkPermission(session, "Supplier.Update");

  logger.info("Supplier Action: updateSupplierAction called", { id });

  const validated = updateSupplierSchema.parse(formData);
  const service = new SupplierService();
  const result = await service.updateSupplier(id, validated);

  revalidatePath(`/dashboard/suppliers/${id}`);
  return { success: true, data: result };
}

export async function updateSupplierStatusAction(
  id: string,
  status: "pending" | "active" | "suspended" | "blocked" | "archived",
) {
  const session = await auth();

  const permission =
    status === "suspended" || status === "blocked" ? "Supplier.Suspend" : "Supplier.Update";
  checkPermission(session, permission);

  logger.info("Supplier Action: updateSupplierStatusAction called", { id, status });

  const service = new SupplierService();
  const result = await service.updateStatus(id, status);

  revalidatePath(`/dashboard/suppliers/${id}`);
  revalidatePath("/dashboard/suppliers");
  return { success: true, data: result };
}

export async function updateSupplierSettingsAction(id: string, formData: any) {
  const session = await auth();
  checkPermission(session, "Supplier.Update");

  logger.info("Supplier Action: updateSupplierSettingsAction called", { id });

  const validated = settingsSchema.parse(formData);
  const service = new SupplierService();
  const result = await service.updateSettings(id, validated);

  revalidatePath(`/dashboard/suppliers/${id}`);
  return { success: true, data: result };
}

export async function updateSupplierBankingAction(id: string, formData: any) {
  const session = await auth();
  checkPermission(session, "Supplier.Update");

  logger.info("Supplier Action: updateSupplierBankingAction called", { id });

  const validated = bankAccountSchema.parse(formData);
  const service = new SupplierService();
  const result = await service.updateBanking(id, validated);

  revalidatePath(`/dashboard/suppliers/${id}`);
  return { success: true, data: result };
}
