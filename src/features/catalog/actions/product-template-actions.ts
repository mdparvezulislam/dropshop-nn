"use server";

import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/check-permission";
import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";
import { ProductTemplateService } from "@/features/catalog/services/product-template-service";
import { createProductTemplateSchema, updateProductTemplateSchema } from "@/features/catalog/types/validation";

const service = new ProductTemplateService();

async function getActor() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  return { id: session.user.id!, name: session.user.name ?? session.user.email ?? undefined };
}

export async function listProductTemplatesAction() {
  try {
    const templates = await service.listAll();
    return { success: true, data: templates };
  } catch (err: unknown) {
    logger.error("Failed to list product templates", err);
    return { success: false, error: "Failed to load templates" };
  }
}

export async function getProductTemplateAction(id: string) {
  try {
    const template = await service.findById(id);
    return { success: true, data: template };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Template not found" };
  }
}

export async function searchProductTemplatesAction(query: string) {
  try {
    if (!query.trim()) return { success: true, data: [] };
    const templates = await service.search(query);
    return { success: true, data: templates };
  } catch (err: unknown) {
    return { success: false, error: "Search failed" };
  }
}

export async function getTemplatesByCategoryAction(categoryName: string) {
  try {
    const templates = await service.findByCategory(categoryName);
    return { success: true, data: templates };
  } catch (err: unknown) {
    return { success: false, error: "Failed to load templates" };
  }
}

export async function createProductTemplateAction(data: unknown) {
  try {
    const session = await auth();
    checkPermission(session, "Product.Create");
    const actor = await getActor();
    const validated = createProductTemplateSchema.parse(data);
    const template = await service.create(validated, actor);
    revalidatePath("/dashboard/products");
    return { success: true, data: template };
  } catch (err: unknown) {
    logger.error("Failed to create product template", err);
    return { success: false, error: err instanceof Error ? err.message : "Create failed" };
  }
}

export async function updateProductTemplateAction(id: string, data: unknown) {
  try {
    const session = await auth();
    checkPermission(session, "Product.Update");
    const actor = await getActor();
    const validated = updateProductTemplateSchema.parse(data);
    const template = await service.update(id, validated, actor);
    revalidatePath("/dashboard/products");
    return { success: true, data: template };
  } catch (err: unknown) {
    logger.error("Failed to update product template", err);
    return { success: false, error: err instanceof Error ? err.message : "Update failed" };
  }
}

export async function deleteProductTemplateAction(id: string) {
  try {
    const session = await auth();
    checkPermission(session, "Product.Delete");
    await service.delete(id);
    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Delete failed" };
  }
}

export async function autoSuggestFromNameAction(productName: string) {
  try {
    const templates = await service.search(productName);
    return {
      success: true,
      data: {
        suggestedTemplates: templates.slice(0, 3).map((t) => ({
          id: t.id,
          name: t.name,
          nameBangla: t.nameBangla,
          categoryName: t.categoryName,
          iconName: t.iconName,
        })),
      },
    };
  } catch (err: unknown) {
    return { success: false, error: "Auto-suggest failed" };
  }
}
