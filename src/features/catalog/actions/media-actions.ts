"use server";

import { auth } from "@/shared/lib/auth";
import { ProductService } from "../services/product-service";
import { UnauthorizedError } from "@/shared/errors/app-error";
import { logger } from "@/shared/utils/logger";
import { revalidatePath } from "next/cache";

function getSessionUser(session: any): { id: string; name?: string; role?: string } {
  if (!session?.user) throw new UnauthorizedError("Session expired or invalid");
  return session.user;
}

export async function addProductMediaAction(productId: string, formData: any) {
  const session = await auth();
  const sessionUser = getSessionUser(session);

  logger.info("Catalog Action: addProductMediaAction", { productId });

  const { productMediaSchema } = await import("../types/validation");
  const validated = productMediaSchema.parse(formData);
  const service = new ProductService();
  const result = await service.addMedia(productId, validated, {
    id: sessionUser.id,
    name: sessionUser.name,
    role: sessionUser.role,
  });

  revalidatePath(`/dashboard/catalog/products/${productId}`);
  return { success: true, data: result };
}

export async function removeProductMediaAction(productId: string, mediaUrl: string) {
  const session = await auth();
  const sessionUser = getSessionUser(session);

  logger.info("Catalog Action: removeProductMediaAction", { productId });

  const service = new ProductService();
  const result = await service.removeMedia(productId, mediaUrl, {
    id: sessionUser.id,
    name: sessionUser.name,
    role: sessionUser.role,
  });

  revalidatePath(`/dashboard/catalog/products/${productId}`);
  return { success: true, data: result };
}

export async function setFeaturedMediaAction(productId: string, mediaUrl: string) {
  const session = await auth();
  const sessionUser = getSessionUser(session);

  logger.info("Catalog Action: setFeaturedMediaAction", { productId });

  const service = new ProductService();
  const result = await service.setFeaturedMedia(productId, mediaUrl, {
    id: sessionUser.id,
    name: sessionUser.name,
    role: sessionUser.role,
  });

  revalidatePath(`/dashboard/catalog/products/${productId}`);
  return { success: true, data: result };
}

export async function addProductVariantAction(productId: string, formData: any) {
  const session = await auth();
  const sessionUser = getSessionUser(session);

  logger.info("Catalog Action: addProductVariantAction", { productId });

  const { productVariantSchema } = await import("../types/validation");
  const validated = productVariantSchema.parse(formData);
  const service = new ProductService();
  const result = await service.addVariant(productId, validated, {
    id: sessionUser.id,
    name: sessionUser.name,
    role: sessionUser.role,
  });

  revalidatePath(`/dashboard/catalog/products/${productId}`);
  return { success: true, data: result };
}

export async function updateProductVariantAction(productId: string, sku: string, formData: any) {
  const session = await auth();
  const sessionUser = getSessionUser(session);

  logger.info("Catalog Action: updateProductVariantAction", { productId, sku });

  const { productVariantSchema } = await import("../types/validation");
  const validated = productVariantSchema.parse(formData);
  const service = new ProductService();
  const result = await service.updateVariant(productId, sku, validated, {
    id: sessionUser.id,
    name: sessionUser.name,
    role: sessionUser.role,
  });

  revalidatePath(`/dashboard/catalog/products/${productId}`);
  return { success: true, data: result };
}

export async function removeProductVariantAction(productId: string, sku: string) {
  const session = await auth();
  const sessionUser = getSessionUser(session);

  logger.info("Catalog Action: removeProductVariantAction", { productId, sku });

  const service = new ProductService();
  const result = await service.removeVariant(productId, sku, {
    id: sessionUser.id,
    name: sessionUser.name,
    role: sessionUser.role,
  });

  revalidatePath(`/dashboard/catalog/products/${productId}`);
  return { success: true, data: result };
}

export async function updateProductSEOAction(productId: string, formData: any) {
  const session = await auth();
  const sessionUser = getSessionUser(session);

  logger.info("Catalog Action: updateProductSEOAction", { productId });

  const { productSEOSchema } = await import("../types/validation");
  const validated = productSEOSchema.parse(formData);
  const service = new ProductService();
  const result = await service.updateSEO(productId, validated, {
    id: sessionUser.id,
    name: sessionUser.name,
    role: sessionUser.role,
  });

  revalidatePath(`/dashboard/catalog/products/${productId}`);
  return { success: true, data: result };
}
