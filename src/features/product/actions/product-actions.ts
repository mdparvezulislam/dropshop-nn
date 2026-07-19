"use server";

import { auth } from "@/shared/lib/auth";
import { ProductService } from "../services/product-service";
import { createProductSchema, updateProductSchema } from "../types/validation";
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

export async function createProductAction(formData: any) {
  const session = await auth();
  checkPermission(session, "Product.Create");

  logger.info("Product Action: createProductAction called", { email: session?.user?.email });

  const validated = createProductSchema.parse(formData);
  const service = new ProductService();
  const result = await service.createProduct(validated);

  revalidatePath("/dashboard/products");
  return { success: true, data: result };
}

export async function updateProductAction(id: string, formData: any) {
  const session = await auth();
  checkPermission(session, "Product.Update");

  logger.info("Product Action: updateProductAction called", { id });

  const validated = updateProductSchema.parse(formData);
  const service = new ProductService();
  const result = await service.updateProduct(id, validated);

  revalidatePath(`/dashboard/products/${id}`);
  return { success: true, data: result };
}

export async function updateProductStatusAction(
  id: string,
  status: "draft" | "pending_review" | "active" | "inactive" | "archived",
) {
  const session = await auth();

  let permission = "Product.Update";
  if (status === "active") permission = "Product.Publish";
  if (status === "archived") permission = "Product.Archive";

  checkPermission(session, permission);

  logger.info("Product Action: updateProductStatusAction called", { id, status });

  const service = new ProductService();
  const result = await service.updateStatus(id, status);

  revalidatePath(`/dashboard/products/${id}`);
  revalidatePath("/dashboard/products");
  return { success: true, data: result };
}

export async function duplicateProductAction(id: string) {
  const session = await auth();
  checkPermission(session, "Product.Create");

  logger.info("Product Action: duplicateProductAction called", { id });

  const service = new ProductService();
  const result = await service.duplicateProduct(id);

  revalidatePath("/dashboard/products");
  return { success: true, data: result };
}

export async function softDeleteProductAction(id: string) {
  const session = await auth();
  checkPermission(session, "Product.Delete");

  logger.info("Product Action: softDeleteProductAction called", { id });

  const service = new ProductService();
  const result = await service.softDeleteProduct(id);

  revalidatePath("/dashboard/products");
  return { success: true, data: result };
}
