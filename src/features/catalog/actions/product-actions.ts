"use server";

import { auth } from "@/lib/auth";
import { ProductService } from "../services/product-service";
import { createProductSchema, updateProductSchema } from "../types/validation";
import { checkPermission } from "@/lib/check-permission";
import { UnauthorizedError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";

function getSessionUser(session: any): { id: string; name?: string; role?: string } {
  if (!session?.user) throw new UnauthorizedError("Session expired or invalid");
  return session.user;
}

export async function createProductAction(formData: unknown) {
  try {
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
  } catch (error: unknown) {
    logger.error("createProductAction failed", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create product",
    };
  }
}

export async function updateProductAction(id: string, formData: unknown) {
  try {
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
  } catch (error: unknown) {
    logger.error("updateProductAction failed", error, { id });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update product",
    };
  }
}

export async function publishProductAction(id: string) {
  try {
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
  } catch (error: unknown) {
    logger.error("publishProductAction failed", error, { id });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to publish product",
    };
  }
}

export async function archiveProductAction(id: string, reason?: string) {
  try {
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
  } catch (error: unknown) {
    logger.error("archiveProductAction failed", error, { id });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to archive product",
    };
  }
}

export async function deleteProductAction(id: string) {
  try {
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
  } catch (error: unknown) {
    logger.error("deleteProductAction failed", error, { id });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete product",
    };
  }
}

export async function duplicateProductAction(id: string) {
  try {
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
  } catch (error: unknown) {
    logger.error("duplicateProductAction failed", error, { id });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to duplicate product",
    };
  }
}

export async function getProductAction(id: string) {
  try {
    const session = await auth();
    getSessionUser(session);

    const service = new ProductService();
    const result = await service.findById(id);

    return { success: true, data: result };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch product",
    };
  }
}

export async function getProductBySlugAction(slug: string) {
  try {
    const service = new ProductService();
    const result = await service.findBySlug(slug);

    return { success: true, data: result };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch product by slug",
    };
  }
}

export async function listProductsAction(
  filter: Record<string, unknown> = {},
  pagination: { cursor?: string; limit?: number } = {},
) {
  try {
    const session = await auth();
    getSessionUser(session);

    const service = new ProductService();
    const result = await service.list(filter, {
      cursor: pagination.cursor,
      limit: pagination.limit || 20,
    });

    return { success: true, data: result };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list products",
    };
  }
}

export async function changeVisibilityAction(id: string, visibility: string) {
  try {
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
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to change visibility",
    };
  }
}

export async function updateProductStatusAction(
  id: string,
  status: "active" | "draft" | "archived",
) {
  if (status === "active") return publishProductAction(id);
  if (status === "archived") return archiveProductAction(id);
  return updateProductAction(id, { status });
}

export async function checkSkuUniquenessAction(sku: string, currentProductId?: string) {
  try {
    const service = new ProductService();
    const existing = await service.findBySku(sku.trim().toUpperCase());
    const isUnique = !existing || (Boolean(currentProductId) && existing.id === currentProductId);
    return { success: true, data: { isUnique } };
  } catch (error: unknown) {
    return { success: false, error: "Failed to check SKU uniqueness" };
  }
}

export async function checkSlugUniquenessAction(slug: string, currentProductId?: string) {
  try {
    const service = new ProductService();
    const existing = await service.findBySlug(slug.trim().toLowerCase());
    const isUnique = !existing || (Boolean(currentProductId) && existing.id === currentProductId);
    return { success: true, data: { isUnique } };
  } catch (error: unknown) {
    return { success: false, error: "Failed to check Slug uniqueness" };
  }
}
