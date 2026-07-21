"use server";

import { auth } from "@/shared/lib/auth";
import { ResellerService } from "../services/reseller-service";
import { ProductAssignmentService } from "../services/product-assignment-service";
import {
  createResellerSchema,
  updateResellerSchema,
  resellerStatusSchema,
  assignProductSchema,
  updateResellerProductSchema,
  updateResellerProductPricingSchema,
  createCollectionSchema,
  createProductGroupSchema,
  resellerListQuerySchema,
  resellerProductSearchSchema,
} from "../types/validation";
import { checkPermission } from "@/shared/lib/check-permission";
import { logger } from "@/shared/utils/logger";
import { revalidatePath } from "next/cache";

const RESELLERS_PATH = "/dashboard/resellers";

export async function createResellerAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ResellerService["createReseller"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.Create");

  logger.info("Reseller Action: createResellerAction", {
    email: session?.user?.email,
    event: "Reseller Created",
  });

  const validated = createResellerSchema.parse(formData);
  const service = new ResellerService();
  const result = await service.createReseller(validated, session?.user?.id);

  revalidatePath(RESELLERS_PATH);
  return { success: true, data: result };
}

export async function updateResellerAction(
  id: string,
  formData: unknown,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ResellerService["updateReseller"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.Update");

  logger.info("Reseller Action: updateResellerAction", {
    id,
    event: "Reseller Updated",
  });

  const validated = updateResellerSchema.parse(formData);
  const service = new ResellerService();
  const result = await service.updateReseller(id, validated, session?.user?.id);

  revalidatePath(RESELLERS_PATH);
  revalidatePath(`${RESELLERS_PATH}/${id}`);
  return { success: true, data: result };
}

export async function updateResellerStatusAction(
  id: string,
  status: unknown,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ResellerService["updateStatus"]>>;
  error?: string;
}> {
  const session = await auth();
  const parsedStatus = resellerStatusSchema.parse(status);

  const permission =
    parsedStatus === "suspended" || parsedStatus === "blocked"
      ? "Reseller.Suspend"
      : "Reseller.Update";
  checkPermission(session, permission);

  logger.info("Reseller Action: updateResellerStatusAction", { id, status: parsedStatus });

  const service = new ResellerService();
  const result = await service.updateStatus(id, parsedStatus, session?.user?.id);

  revalidatePath(RESELLERS_PATH);
  revalidatePath(`${RESELLERS_PATH}/${id}`);
  return { success: true, data: result };
}

export async function getResellerByIdAction(id: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ResellerService["getResellerById"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.View");

  const service = new ResellerService();
  const result = await service.getResellerById(id);
  return { success: true, data: result };
}

export async function listResellersAction(query: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ResellerService["searchResellers"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.View");

  const validated = resellerListQuerySchema.parse(query);
  const service = new ResellerService();
  const result = await service.searchResellers(validated);
  return { success: true, data: result };
}

export async function softDeleteResellerAction(id: string): Promise<{
  success: boolean;
  data?: boolean;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.Update");

  const service = new ResellerService();
  const result = await service.softDelete(id);

  revalidatePath(RESELLERS_PATH);
  return { success: true, data: result };
}

export async function assignProductAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ProductAssignmentService["assignProduct"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.Update");

  logger.info("Reseller Action: assignProductAction", {
    email: session?.user?.email,
    event: "Product Added",
  });

  const validated = assignProductSchema.parse(formData);
  const service = new ProductAssignmentService();
  const result = await service.assignProduct(validated, session?.user?.id);

  revalidatePath(`${RESELLERS_PATH}/${validated.resellerId}`);
  revalidatePath(`${RESELLERS_PATH}/${validated.resellerId}/products`);
  return { success: true, data: result };
}

export async function removeResellerProductAction(id: string): Promise<{
  success: boolean;
  data?: boolean;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.Update");

  logger.info("Reseller Action: removeResellerProductAction", {
    id,
    event: "Product Removed",
  });

  const service = new ProductAssignmentService();
  const result = await service.removeProduct(id, session?.user?.id);

  revalidatePath(RESELLERS_PATH);
  return { success: true, data: result };
}

export async function updateResellerProductAction(
  id: string,
  formData: unknown,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ProductAssignmentService["updateResellerProduct"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.Update");

  const validated = updateResellerProductSchema.parse(formData);
  const service = new ProductAssignmentService();
  const result = await service.updateResellerProduct(id, validated, session?.user?.id);

  revalidatePath(RESELLERS_PATH);
  return { success: true, data: result };
}

export async function updateResellerProductPricingAction(
  id: string,
  formData: unknown,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ProductAssignmentService["updatePricing"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.Update");

  logger.info("Reseller Action: updateResellerProductPricingAction", {
    id,
    event: "Price Updated",
  });

  const validated = updateResellerProductPricingSchema.parse(formData);
  const service = new ProductAssignmentService();
  const result = await service.updatePricing(id, validated, session?.user?.id);

  revalidatePath(RESELLERS_PATH);
  return { success: true, data: result };
}

export async function resetResellerProductPriceAction(id: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ProductAssignmentService["resetPrice"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.Update");

  const service = new ProductAssignmentService();
  const result = await service.resetPrice(id, session?.user?.id);

  revalidatePath(RESELLERS_PATH);
  return { success: true, data: result };
}

export async function previewResellerProductPricingAction(
  id: string,
  formData: unknown,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ProductAssignmentService["previewPricing"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.View");

  const validated = updateResellerProductPricingSchema.parse(formData);
  const service = new ProductAssignmentService();
  const result = await service.previewPricing(id, validated);
  return { success: true, data: result };
}

export async function searchResellerProductsAction(query: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ProductAssignmentService["searchResellerProducts"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.View");

  const validated = resellerProductSearchSchema.parse(query);
  const service = new ProductAssignmentService();
  const result = await service.searchResellerProducts(validated);
  return { success: true, data: result };
}

export async function getResellerDashboardAction(resellerId: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ProductAssignmentService["getDashboardStats"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.View");

  const service = new ProductAssignmentService();
  const result = await service.getDashboardStats(resellerId);
  return { success: true, data: result };
}

export async function createResellerCollectionAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ProductAssignmentService["createCollection"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.Update");

  const validated = createCollectionSchema.parse(formData);
  const service = new ProductAssignmentService();
  const result = await service.createCollection(validated, session?.user?.id);

  revalidatePath(`${RESELLERS_PATH}/${validated.resellerId}`);
  return { success: true, data: result };
}

export async function createResellerProductGroupAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ProductAssignmentService["createProductGroup"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.Update");

  const validated = createProductGroupSchema.parse(formData);
  const service = new ProductAssignmentService();
  const result = await service.createProductGroup(validated, session?.user?.id);

  revalidatePath(`${RESELLERS_PATH}/${validated.resellerId}`);
  return { success: true, data: result };
}

export async function favoriteResellerProductAction(
  id: string,
  isFavorite: boolean,
): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ProductAssignmentService["favoriteProduct"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.Update");

  const service = new ProductAssignmentService();
  const result = await service.favoriteProduct(id, isFavorite, session?.user?.id);

  revalidatePath(RESELLERS_PATH);
  return { success: true, data: result };
}

export async function hideResellerProductAction(id: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<ProductAssignmentService["hideProduct"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Reseller.Update");

  const service = new ProductAssignmentService();
  const result = await service.hideProduct(id, session?.user?.id);

  revalidatePath(RESELLERS_PATH);
  return { success: true, data: result };
}
