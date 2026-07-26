"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { checkPermission, sessionActor } from "@/lib/check-permission";
import { logger } from "@/lib/utils/logger";
import { generateSlug } from "@/lib/utils/slug-utils";

import { ClassificationService } from "../services/classification-service";
import {
  CollectionRepository,
  ProductTagRepository,
} from "../repositories/classification-repository";
import type {
  Brand,
  Category,
  CategoryTreeNode,
  Collection,
  ProductTag,
} from "../domain/classification-entity";
import {
  collectionSchema,
  createBrandSchema,
  createCategorySchema,
  tagSchema,
  updateBrandSchema,
  updateCategorySchema,
} from "../types/validation";

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  /** Field-level messages, so forms can highlight the offending input. */
  fieldErrors?: Record<string, string[]>;
}

/** Turns Zod issues and domain ValidationErrors into a friendly, field-aware payload. */
function toActionError(error: unknown, fallback: string): ActionResult<never> {
  if (error instanceof z.ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const key = issue.path.join(".") || "form";
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return { success: false, error: error.issues[0]?.message ?? fallback, fieldErrors };
  }
  if (error && typeof error === "object" && "fields" in error) {
    const domain = error as { message?: string; fields?: Record<string, string[]> };
    return { success: false, error: domain.message ?? fallback, fieldErrors: domain.fields };
  }
  return { success: false, error: error instanceof Error ? error.message : fallback };
}

function revalidateTaxonomy(): void {
  revalidatePath("/dashboard/catalog/categories");
  revalidatePath("/dashboard/catalog/brands");
  revalidatePath("/dashboard/products");
}

/* ════════════════════════════════ Categories ═══════════════════════════════ */

export async function listCategoriesAction(search?: string): Promise<ActionResult<Category[]>> {
  try {
    const session = await auth();
    checkPermission(session, "Product.View");
    const data = await new ClassificationService().listCategories(search);
    return { success: true, data };
  } catch (error: unknown) {
    logger.error("listCategoriesAction failed", error);
    return toActionError(error, "Failed to load categories");
  }
}

export async function getCategoryTreeAction(
  search?: string,
): Promise<ActionResult<CategoryTreeNode[]>> {
  try {
    const session = await auth();
    checkPermission(session, "Product.View");
    const data = await new ClassificationService().listCategoryTree(search);
    return { success: true, data };
  } catch (error: unknown) {
    logger.error("getCategoryTreeAction failed", error);
    return toActionError(error, "Failed to load category tree");
  }
}

export interface CategoryAdminRow extends Category {
  productCount: number;
  depth: number;
  path: string;
}

/** Category list for the admin table: hierarchy order plus per-row product counts. */
export async function listCategoriesAdminAction(
  search?: string,
): Promise<ActionResult<CategoryAdminRow[]>> {
  try {
    const session = await auth();
    checkPermission(session, "Product.View");

    const service = new ClassificationService();
    const [tree, counts] = await Promise.all([
      service.listCategoryTree(search),
      service.productCounts(),
    ]);

    const rows: CategoryAdminRow[] = [];
    const walk = (nodes: CategoryTreeNode[]): void => {
      for (const node of nodes) {
        const { children, ...rest } = node;
        rows.push({ ...rest, productCount: counts.byCategory.get(node.id) ?? 0 });
        walk(children);
      }
    };
    walk(tree);

    return { success: true, data: rows };
  } catch (error: unknown) {
    logger.error("listCategoriesAdminAction failed", error);
    return toActionError(error, "Failed to load categories");
  }
}

export async function createCategoryAction(input: unknown): Promise<ActionResult<Category>> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Create");
    const actor = sessionActor(session);

    const parsed = createCategorySchema.parse(input);
    const data = await new ClassificationService().createCategory(parsed, actor);

    revalidateTaxonomy();
    return { success: true, data };
  } catch (error: unknown) {
    logger.error("createCategoryAction failed", error);
    return toActionError(error, "Failed to create category");
  }
}

export async function updateCategoryAction(
  id: string,
  input: unknown,
): Promise<ActionResult<Category>> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Update");
    const actor = sessionActor(session);

    const parsed = updateCategorySchema.parse(input);
    const data = await new ClassificationService().updateCategory(id, parsed, actor);

    revalidateTaxonomy();
    return { success: true, data };
  } catch (error: unknown) {
    logger.error("updateCategoryAction failed", error, { id });
    return toActionError(error, "Failed to update category");
  }
}

export async function deleteCategoryAction(
  id: string,
): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Delete");

    const deleted = await new ClassificationService().deleteCategory(id);

    revalidateTaxonomy();
    return { success: true, data: { deleted } };
  } catch (error: unknown) {
    logger.error("deleteCategoryAction failed", error, { id });
    return toActionError(error, "Failed to delete category");
  }
}

export async function restoreCategoryAction(id: string): Promise<ActionResult<Category>> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Update");
    const actor = sessionActor(session);

    const data = await new ClassificationService().restoreCategory(id, actor);

    revalidateTaxonomy();
    return { success: true, data };
  } catch (error: unknown) {
    logger.error("restoreCategoryAction failed", error, { id });
    return toActionError(error, "Failed to restore category");
  }
}

/* ══════════════════════════════════ Brands ═════════════════════════════════ */

export interface BrandAdminRow extends Brand {
  productCount: number;
}

export async function listBrandsAction(search?: string): Promise<ActionResult<Brand[]>> {
  try {
    const session = await auth();
    checkPermission(session, "Product.View");
    const data = await new ClassificationService().listBrands(search);
    return { success: true, data };
  } catch (error: unknown) {
    logger.error("listBrandsAction failed", error);
    return toActionError(error, "Failed to load brands");
  }
}

export async function listBrandsAdminAction(
  search?: string,
): Promise<ActionResult<BrandAdminRow[]>> {
  try {
    const session = await auth();
    checkPermission(session, "Product.View");

    const service = new ClassificationService();
    const [brands, counts] = await Promise.all([
      service.listBrands(search),
      service.productCounts(),
    ]);

    return {
      success: true,
      data: brands.map((brand) => ({
        ...brand,
        productCount: counts.byBrand.get(brand.id) ?? 0,
      })),
    };
  } catch (error: unknown) {
    logger.error("listBrandsAdminAction failed", error);
    return toActionError(error, "Failed to load brands");
  }
}

export async function createBrandAction(input: unknown): Promise<ActionResult<Brand>> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Create");
    const actor = sessionActor(session);

    const parsed = createBrandSchema.parse(input);
    const data = await new ClassificationService().createBrand(parsed, actor);

    revalidateTaxonomy();
    return { success: true, data };
  } catch (error: unknown) {
    logger.error("createBrandAction failed", error);
    return toActionError(error, "Failed to create brand");
  }
}

export async function updateBrandAction(id: string, input: unknown): Promise<ActionResult<Brand>> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Update");
    const actor = sessionActor(session);

    const parsed = updateBrandSchema.parse(input);
    const data = await new ClassificationService().updateBrand(id, parsed, actor);

    revalidateTaxonomy();
    return { success: true, data };
  } catch (error: unknown) {
    logger.error("updateBrandAction failed", error, { id });
    return toActionError(error, "Failed to update brand");
  }
}

export async function deleteBrandAction(id: string): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Delete");

    const deleted = await new ClassificationService().deleteBrand(id);

    revalidateTaxonomy();
    return { success: true, data: { deleted } };
  } catch (error: unknown) {
    logger.error("deleteBrandAction failed", error, { id });
    return toActionError(error, "Failed to delete brand");
  }
}

export async function restoreBrandAction(id: string): Promise<ActionResult<Brand>> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Update");
    const actor = sessionActor(session);

    const data = await new ClassificationService().restoreBrand(id, actor);

    revalidateTaxonomy();
    return { success: true, data };
  } catch (error: unknown) {
    logger.error("restoreBrandAction failed", error, { id });
    return toActionError(error, "Failed to restore brand");
  }
}

/* ═══════════════════════════ Collections & Tags ════════════════════════════ */

export async function listCollectionsAction(): Promise<ActionResult<Collection[]>> {
  try {
    const session = await auth();
    checkPermission(session, "Product.View");
    const data = await new CollectionRepository().findActive();
    return { success: true, data };
  } catch (error: unknown) {
    logger.error("listCollectionsAction failed", error);
    return toActionError(error, "Failed to load collections");
  }
}

export async function createCollectionAction(input: unknown): Promise<ActionResult<Collection>> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Create");
    const actor = sessionActor(session);

    const parsed = collectionSchema.parse(input);
    const data = await new CollectionRepository().create({
      ...parsed,
      slug: generateSlug(parsed.name),
      createdBy: actor.id,
      updatedBy: actor.id,
    });

    revalidatePath("/dashboard/catalog/collections");
    return { success: true, data };
  } catch (error: unknown) {
    logger.error("createCollectionAction failed", error);
    return toActionError(error, "Failed to create collection");
  }
}

export async function updateCollectionAction(
  id: string,
  input: unknown,
): Promise<ActionResult<Collection>> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Update");
    const actor = sessionActor(session);

    const parsed = collectionSchema.partial().parse(input);
    const data = await new CollectionRepository().update(id, {
      ...parsed,
      updatedBy: actor.id,
    });

    revalidatePath("/dashboard/catalog/collections");
    return { success: true, data };
  } catch (error: unknown) {
    logger.error("updateCollectionAction failed", error, { id });
    return toActionError(error, "Failed to update collection");
  }
}

export async function addProductToCollectionAction(
  collectionId: string,
  productId: string,
): Promise<ActionResult<null>> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Update");

    const repo = new CollectionRepository();
    const collection = await repo.findById(collectionId);
    if (!collection) return { success: false, error: "Collection not found" };

    if (!collection.productIds.includes(productId)) {
      await repo.update(collectionId, { productIds: [...collection.productIds, productId] });
    }

    revalidatePath("/dashboard/catalog/collections");
    return { success: true, data: null };
  } catch (error: unknown) {
    logger.error("addProductToCollectionAction failed", error);
    return toActionError(error, "Failed to add product to collection");
  }
}

export async function removeProductFromCollectionAction(
  collectionId: string,
  productId: string,
): Promise<ActionResult<null>> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Update");

    const repo = new CollectionRepository();
    const collection = await repo.findById(collectionId);
    if (!collection) return { success: false, error: "Collection not found" };

    await repo.update(collectionId, {
      productIds: collection.productIds.filter((id) => id !== productId),
    });

    revalidatePath("/dashboard/catalog/collections");
    return { success: true, data: null };
  } catch (error: unknown) {
    logger.error("removeProductFromCollectionAction failed", error);
    return toActionError(error, "Failed to remove product from collection");
  }
}

export async function listTagsAction(): Promise<ActionResult<ProductTag[]>> {
  try {
    const session = await auth();
    checkPermission(session, "Product.View");
    const data = await new ProductTagRepository().find({});
    return { success: true, data };
  } catch (error: unknown) {
    logger.error("listTagsAction failed", error);
    return toActionError(error, "Failed to load tags");
  }
}

export async function createTagAction(input: unknown): Promise<ActionResult<ProductTag>> {
  try {
    const session = await auth();
    checkPermission(session, "Product.Create");
    const actor = sessionActor(session);

    const parsed = tagSchema.parse(input);
    const data = await new ProductTagRepository().create({
      ...parsed,
      slug: generateSlug(parsed.name),
      createdBy: actor.id,
      updatedBy: actor.id,
    });

    revalidatePath("/dashboard/catalog/tags");
    return { success: true, data };
  } catch (error: unknown) {
    logger.error("createTagAction failed", error);
    return toActionError(error, "Failed to create tag");
  }
}
