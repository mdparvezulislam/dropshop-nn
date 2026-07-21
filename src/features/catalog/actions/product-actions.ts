"use server";

import { auth } from "@/shared/lib/auth";
import { ProductService } from "../services/product-service";
import { createProductSchema, updateProductSchema } from "../types/validation";
import { checkPermission } from "@/shared/lib/check-permission";
import { UnauthorizedError } from "@/shared/errors/app-error";
import { logger } from "@/shared/utils/logger";
import { revalidatePath } from "next/cache";

function getSessionUser(session: any): { id: string; name?: string; role?: string } {
  if (!session?.user) throw new UnauthorizedError("Session expired or invalid");
  return session.user;
}

export async function createProductAction(formData: any) {
  const session = await auth();
  checkPermission(session, "Product.Create");
  const sessionUser = getSessionUser(session);

  logger.info("Catalog Action: createProductAction", { user: sessionUser.id });

  const validated = createProductSchema.parse(formData);
  const service = new ProductService();
  const result = await service.create(validated, {
    id: sessionUser.id,
    name: sessionUser.name,
    role: sessionUser.role,
  });

  revalidatePath("/dashboard/catalog/products");
  return { success: true, data: result };
}

export async function updateProductAction(id: string, formData: any) {
  const session = await auth();
  checkPermission(session, "Product.Update");
  const sessionUser = getSessionUser(session);

  logger.info("Catalog Action: updateProductAction", { id });

  const validated = updateProductSchema.parse(formData);
  const service = new ProductService();
  const result = await service.update(id, validated, {
    id: sessionUser.id,
    name: sessionUser.name,
    role: sessionUser.role,
  });

  revalidatePath(`/dashboard/catalog/products/${id}`);
  return { success: true, data: result };
}

export async function publishProductAction(id: string) {
  const session = await auth();
  checkPermission(session, "Product.Publish");
  const sessionUser = getSessionUser(session);

  logger.info("Catalog Action: publishProductAction", { id });

  const service = new ProductService();
  const result = await service.publish(id, {
    id: sessionUser.id,
    name: sessionUser.name,
    role: sessionUser.role,
  });

  revalidatePath(`/dashboard/catalog/products/${id}`);
  revalidatePath("/dashboard/catalog/products");
  return { success: true, data: result };
}

export async function archiveProductAction(id: string, reason?: string) {
  const session = await auth();
  checkPermission(session, "Product.Archive");
  const sessionUser = getSessionUser(session);

  logger.info("Catalog Action: archiveProductAction", { id, reason });

  const service = new ProductService();
  const result = await service.archive(id, reason, {
    id: sessionUser.id,
    name: sessionUser.name,
    role: sessionUser.role,
  });

  revalidatePath(`/dashboard/catalog/products/${id}`);
  revalidatePath("/dashboard/catalog/products");
  return { success: true, data: result };
}

export async function deleteProductAction(id: string) {
  const session = await auth();
  checkPermission(session, "Product.Delete");
  const sessionUser = getSessionUser(session);

  logger.info("Catalog Action: deleteProductAction", { id });

  const service = new ProductService();
  const result = await service.delete(id, {
    id: sessionUser.id,
    name: sessionUser.name,
    role: sessionUser.role,
  });

  revalidatePath("/dashboard/catalog/products");
  return { success: true, data: { deleted: result } };
}

export async function duplicateProductAction(id: string) {
  const session = await auth();
  checkPermission(session, "Product.Create");
  const sessionUser = getSessionUser(session);

  logger.info("Catalog Action: duplicateProductAction", { id });

  const service = new ProductService();
  const result = await service.duplicate(id, {
    id: sessionUser.id,
    name: sessionUser.name,
    role: sessionUser.role,
  });

  revalidatePath("/dashboard/catalog/products");
  return { success: true, data: result };
}

export async function getProductAction(id: string) {
  const session = await auth();
  getSessionUser(session);

  const service = new ProductService();
  const result = await service.findById(id);

  return { success: true, data: result };
}

export async function getProductBySlugAction(slug: string) {
  const service = new ProductService();
  const result = await service.findBySlug(slug);

  return { success: true, data: result };
}

export async function listProductsAction(
  filter: Record<string, unknown> = {},
  pagination: { cursor?: string; limit?: number } = {},
) {
  const session = await auth();
  getSessionUser(session);

  const service = new ProductService();
  const result = await service.list(filter, {
    cursor: pagination.cursor,
    limit: pagination.limit || 20,
  });

  return { success: true, data: result };
}

export async function changeVisibilityAction(id: string, visibility: string) {
  const session = await auth();
  checkPermission(session, "Product.Publish");
  const sessionUser = getSessionUser(session);

  const service = new ProductService();
  const result = await service.changeVisibility(id, visibility as any, {
    id: sessionUser.id,
    name: sessionUser.name,
    role: sessionUser.role,
  });

  revalidatePath(`/dashboard/catalog/products/${id}`);
  return { success: true, data: result };
}
