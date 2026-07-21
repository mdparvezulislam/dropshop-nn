"use server";

import { auth } from "@/shared/lib/auth";
import { SupplierService } from "../services/supplier-service";
import {
  createSupplierSchema,
  updateSupplierSchema,
  settingsSchema,
  bankAccountSchema,
  supplierNoteSchema,
  supplierListQuerySchema,
  createSupplierProductMappingSchema,
  updateSupplierProductMappingSchema,
} from "../types/validation";
import { checkPermission } from "@/shared/lib/check-permission";
import { logger } from "@/shared/utils/logger";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/shared/constants";

export async function createSupplierAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<SupplierService["createSupplier"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Supplier.Create");

  const validated = createSupplierSchema.parse(formData);
  const service = new SupplierService();
  const result = await service.createSupplier({ ...validated, createdBy: session?.user?.id });

  revalidatePath(ROUTES.RESELLERS, "layout");
  return { success: true, data: result };
}

export async function updateSupplierAction(
  id: string,
  formData: unknown,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<SupplierService["updateSupplier"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Supplier.Update");

  const validated = updateSupplierSchema.parse(formData);
  const service = new SupplierService();
  const result = await service.updateSupplier(id, { ...validated, updatedBy: session?.user?.id });

  revalidatePath(`${ROUTES.RESELLERS}/${id}`);
  return { success: true, data: result };
}

export async function getSupplierByIdAction(id: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<SupplierService["getSupplierById"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Supplier.View");

  const service = new SupplierService();
  const result = await service.getSupplierById(id);
  return { success: true, data: result };
}

export async function listSuppliersAction(query: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<SupplierService["listSuppliers"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Supplier.View");

  const validated = supplierListQuerySchema.parse(query);
  const filter: Record<string, unknown> = {};

  if (validated.status && validated.status !== "all") filter.status = validated.status;
  if (validated.supplierCategory && validated.supplierCategory !== "all") {
    filter.supplierCategory = validated.supplierCategory;
  }
  if (validated.district) filter["address.district"] = validated.district;
  if (validated.search) {
    const escaped = validated.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { businessName: { $regex: escaped, $options: "i" } },
      { code: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
    ];
  }

  const service = new SupplierService();
  const result = await service.listSuppliers(
    filter,
    { page: validated.page, limit: validated.limit },
    validated.sortBy
      ? { sortBy: validated.sortBy, sortOrder: validated.sortOrder }
      : { sortBy: "updatedAt", sortOrder: "desc" },
  );

  return { success: true, data: result };
}

export async function searchSuppliersAction(query: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<SupplierService["searchSuppliers"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Supplier.View");

  const service = new SupplierService();
  const result = await service.searchSuppliers(query);
  return { success: true, data: result };
}

export async function updateSupplierStatusAction(
  id: string,
  status: "pending" | "active" | "inactive" | "suspended" | "blocked" | "archived",
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<SupplierService["updateStatus"]>>;
  error?: string;
}> {
  const session = await auth();

  const permission =
    status === "suspended" || status === "blocked" ? "Supplier.Suspend" : "Supplier.Update";
  checkPermission(session, permission);

  const service = new SupplierService();
  const result = await service.updateStatus(id, status);

  revalidatePath("/dashboard/suppliers");
  revalidatePath(`/dashboard/suppliers/${id}`);
  return { success: true, data: result };
}

export async function updateSupplierSettingsAction(
  id: string,
  formData: unknown,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<SupplierService["updateSettings"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Supplier.Update");

  const validated = settingsSchema.parse(formData);
  const service = new SupplierService();
  const result = await service.updateSettings(id, validated);

  revalidatePath(`/dashboard/suppliers/${id}`);
  return { success: true, data: result };
}

export async function updateSupplierBankingAction(
  id: string,
  formData: unknown,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<SupplierService["updateBanking"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Supplier.Update");

  const validated = bankAccountSchema.parse(formData);
  const service = new SupplierService();
  const result = await service.updateBanking(id, validated);

  revalidatePath(`/dashboard/suppliers/${id}`);
  return { success: true, data: result };
}

export async function addSupplierNoteAction(
  id: string,
  formData: unknown,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<SupplierService["addNote"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Supplier.Update");

  const validated = supplierNoteSchema.parse(formData);
  const service = new SupplierService();
  const result = await service.addNote(id, validated.content, session?.user?.id);

  revalidatePath(`/dashboard/suppliers/${id}`);
  return { success: true, data: result };
}

export async function addSupplierTagsAction(
  id: string,
  tags: string[],
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<SupplierService["addTags"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Supplier.Update");

  const service = new SupplierService();
  const result = await service.addTags(id, tags);

  revalidatePath(`/dashboard/suppliers/${id}`);
  return { success: true, data: result };
}

export async function mapProductToSupplierAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<SupplierService["mapProduct"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Supplier.Update");

  const validated = createSupplierProductMappingSchema.parse(formData);
  const service = new SupplierService();
  const result = await service.mapProduct(validated, session?.user?.id);

  revalidatePath("/dashboard/suppliers");
  return { success: true, data: result };
}

export async function updateSupplierProductMappingAction(
  id: string,
  formData: unknown,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<SupplierService["updateProductMapping"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Supplier.Update");

  const validated = updateSupplierProductMappingSchema.parse(formData);
  const service = new SupplierService();
  const result = await service.updateProductMapping(id, validated, session?.user?.id);

  revalidatePath("/dashboard/suppliers");
  return { success: true, data: result };
}

export async function removeProductMappingAction(id: string): Promise<{
  success: boolean;
  data?: boolean;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Supplier.Update");

  const service = new SupplierService();
  const result = await service.removeProductMapping(id);

  revalidatePath("/dashboard/suppliers");
  return { success: true, data: result };
}

export async function getSupplierProductMappingsAction(supplierId: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<SupplierService["getSupplierProductMappings"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Supplier.View");

  const service = new SupplierService();
  const result = await service.getSupplierProductMappings(supplierId);
  return { success: true, data: result };
}

export async function getSupplierStatsAction(id: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<SupplierService["getSupplierStats"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Supplier.View");

  const service = new SupplierService();
  const result = await service.getSupplierStats(id);
  return { success: true, data: result };
}
