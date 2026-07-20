"use server";

import { auth } from "@/shared/lib/auth";
import { BrandRepository, CategoryRepository, CollectionRepository, ProductTagRepository } from "../repositories/classification-repository";
import { brandSchema, categorySchema, collectionSchema, tagSchema } from "../types/validation";
import { ForbiddenError, UnauthorizedError } from "@/shared/errors/app-error";
import { logger } from "@/shared/utils/logger";
import { revalidatePath } from "next/cache";
import { generateSlug } from "@/shared/utils/slug-utils";

function checkPermission(session: any, permission: string) {
  if (!session) throw new UnauthorizedError("Session expired or invalid");
  const permissions = session.user?.permissions || [];
  if (!permissions.includes("*") && !permissions.includes(permission)) {
    throw new ForbiddenError(`Missing required permission: ${permission}`);
  }
}

function getSessionUser(session: any): { id: string; name?: string; role?: string } {
  if (!session?.user) throw new UnauthorizedError("Session expired or invalid");
  return session.user;
}

export async function createBrandAction(formData: any) {
  const session = await auth();
  getSessionUser(session);

  const validated = brandSchema.parse(formData);
  const slug = generateSlug(validated.name);
  const repo = new BrandRepository();
  const result = await repo.create({ ...validated, slug });

  revalidatePath("/dashboard/catalog/brands");
  return { success: true, data: result };
}

export async function updateBrandAction(id: string, formData: any) {
  const session = await auth();
  getSessionUser(session);

  const validated = brandSchema.parse(formData);
  const repo = new BrandRepository();
  const result = await repo.update(id, validated);

  revalidatePath(`/dashboard/catalog/brands/${id}`);
  return { success: true, data: result };
}

export async function listBrandsAction() {
  const repo = new BrandRepository();
  const result = await repo.find({});
  return { success: true, data: result };
}

export async function createCategoryAction(formData: any) {
  const session = await auth();
  getSessionUser(session);

  const validated = categorySchema.parse(formData);
  const slug = generateSlug(validated.name);
  const repo = new CategoryRepository();
  const result = await repo.create({ ...validated, slug });

  revalidatePath("/dashboard/catalog/categories");
  return { success: true, data: result };
}

export async function updateCategoryAction(id: string, formData: any) {
  const session = await auth();
  getSessionUser(session);

  const validated = categorySchema.parse(formData);
  const repo = new CategoryRepository();
  const result = await repo.update(id, validated);

  revalidatePath(`/dashboard/catalog/categories/${id}`);
  return { success: true, data: result };
}

export async function listCategoriesAction() {
  const repo = new CategoryRepository();
  const result = await repo.getTree();
  return { success: true, data: result };
}

export async function getCategoryTreeAction() {
  const repo = new CategoryRepository();
  const categories = await repo.getTree();

  const buildTree = (parentId: string | null): any[] =>
    categories
      .filter((c) => c.parentCategoryId === parentId)
      .map((c) => ({ ...c, children: buildTree(c.id) }));

  return { success: true, data: buildTree(null) };
}

export async function createCollectionAction(formData: any) {
  const session = await auth();
  checkPermission(session, "Product.Create");
  getSessionUser(session);

  const validated = collectionSchema.parse(formData);
  const slug = generateSlug(validated.name);
  const repo = new CollectionRepository();
  const result = await repo.create({ ...validated, slug });

  revalidatePath("/dashboard/catalog/collections");
  return { success: true, data: result };
}

export async function updateCollectionAction(id: string, formData: any) {
  const session = await auth();
  getSessionUser(session);

  const validated = collectionSchema.parse(formData);
  const repo = new CollectionRepository();
  const result = await repo.update(id, validated);

  revalidatePath(`/dashboard/catalog/collections/${id}`);
  return { success: true, data: result };
}

export async function listCollectionsAction() {
  const repo = new CollectionRepository();
  const result = await repo.findActive();
  return { success: true, data: result };
}

export async function addProductToCollectionAction(collectionId: string, productId: string) {
  const session = await auth();
  getSessionUser(session);

  const repo = new CollectionRepository();
  const collection = await repo.findById(collectionId);
  if (!collection) return { success: false, error: "Collection not found" };

  if (!collection.productIds.includes(productId)) {
    collection.productIds.push(productId);
    await repo.update(collectionId, { productIds: collection.productIds });
  }

  revalidatePath(`/dashboard/catalog/collections/${collectionId}`);
  return { success: true, data: null };
}

export async function removeProductFromCollectionAction(collectionId: string, productId: string) {
  const session = await auth();
  getSessionUser(session);

  const repo = new CollectionRepository();
  const collection = await repo.findById(collectionId);
  if (!collection) return { success: false, error: "Collection not found" };

  collection.productIds = collection.productIds.filter((id) => id !== productId);
  await repo.update(collectionId, { productIds: collection.productIds });

  revalidatePath(`/dashboard/catalog/collections/${collectionId}`);
  return { success: true, data: null };
}

export async function createTagAction(formData: any) {
  const session = await auth();
  getSessionUser(session);

  const validated = tagSchema.parse(formData);
  const slug = generateSlug(validated.name);
  const repo = new ProductTagRepository();
  const result = await repo.create({ ...validated, slug });

  revalidatePath("/dashboard/catalog/tags");
  return { success: true, data: result };
}

export async function listTagsAction() {
  const repo = new ProductTagRepository();
  const result = await repo.find({});
  return { success: true, data: result };
}
