import { BrandRepository, CategoryRepository } from "../repositories/classification-repository";
import { ProductRepository } from "../repositories/product-repository";
import type { Brand, Category, CategoryTreeNode } from "../domain/classification-entity";
import type {
  CreateBrandInput,
  CreateCategoryInput,
  UpdateBrandInput,
  UpdateCategoryInput,
} from "../types/validation";
import { NotFoundError, ValidationError } from "@/lib/errors/app-error";
import { generateSlug } from "@/lib/utils/slug-utils";
import { logger } from "@/lib/utils/logger";
import type { ActorInfo } from "@/lib/core/types";

/** Guards against a malformed tree sending ancestry resolution into an endless walk. */
const MAX_CATEGORY_DEPTH = 12;

/**
 * Single source of truth for the product taxonomy.
 *
 * Both Product Studio's selectors and the taxonomy admin pages read through this
 * service, so uniqueness, hierarchy and deletion rules are enforced in exactly one place
 * rather than being re-implemented per caller.
 */
export class ClassificationService {
  private readonly categoryRepository: CategoryRepository;
  private readonly brandRepository: BrandRepository;
  private readonly productRepository: ProductRepository;

  constructor() {
    this.categoryRepository = new CategoryRepository();
    this.brandRepository = new BrandRepository();
    this.productRepository = new ProductRepository();
  }

  /* ══════════════════════════════ Categories ══════════════════════════════ */

  async listCategories(search?: string): Promise<Category[]> {
    const filter: Record<string, unknown> = {};
    if (search?.trim()) {
      const pattern = escapeRegex(search.trim());
      filter.$or = [
        { name: { $regex: pattern, $options: "i" } },
        { slug: { $regex: pattern, $options: "i" } },
        { description: { $regex: pattern, $options: "i" } },
      ];
    }
    return this.categoryRepository.find(filter);
  }

  /**
   * Flat list annotated with depth and a "Parent > Child" path, ordered so children
   * always follow their parent. Selectors need the ordering; breadcrumbs need the path.
   */
  async listCategoryTree(search?: string): Promise<CategoryTreeNode[]> {
    const all = await this.categoryRepository.find({});
    const byParent = new Map<string | null, Category[]>();

    for (const category of all) {
      const key = category.parentCategoryId ?? null;
      const bucket = byParent.get(key);
      if (bucket) bucket.push(category);
      else byParent.set(key, [category]);
    }
    for (const bucket of byParent.values()) {
      bucket.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    }

    const flattened: CategoryTreeNode[] = [];

    const walk = (parentId: string | null, depth: number, prefix: string): CategoryTreeNode[] => {
      if (depth > MAX_CATEGORY_DEPTH) return [];
      return (byParent.get(parentId) ?? []).map((category) => {
        const path = prefix ? `${prefix} > ${category.name}` : category.name;
        const node: CategoryTreeNode = {
          ...category,
          depth,
          path,
          children: walk(category.id, depth + 1, path),
        };
        flattened.push(node);
        return node;
      });
    };

    const roots = walk(null, 0, "");

    if (!search?.trim()) return roots;

    // Search matches against the full path, so typing "mobile" finds
    // "Electronics > Mobile" and typing "electronics" keeps its descendants reachable.
    const needle = search.trim().toLowerCase();
    return flattened.filter(
      (node) =>
        node.path.toLowerCase().includes(needle) || node.slug.toLowerCase().includes(needle),
    );
  }

  async getCategory(id: string): Promise<Category | null> {
    return this.categoryRepository.findById(id);
  }

  async createCategory(input: CreateCategoryInput, actor?: ActorInfo): Promise<Category> {
    const name = input.name.trim();
    await this.assertCategoryNameFree(name);

    const slug = await this.uniqueCategorySlug(input.slug?.trim() || name);

    if (input.parentCategoryId) {
      const parent = await this.categoryRepository.findById(input.parentCategoryId);
      if (!parent) {
        throw new ValidationError("Parent category not found", {
          parentCategoryId: ["The selected parent category does not exist"],
        });
      }
    }

    logger.info("ClassificationService: creating category", { name, slug });

    return this.categoryRepository.create({
      ...input,
      name,
      slug,
      parentCategoryId: input.parentCategoryId || null,
      createdBy: actor?.id,
      updatedBy: actor?.id,
    });
  }

  async updateCategory(
    id: string,
    input: UpdateCategoryInput,
    actor?: ActorInfo,
  ): Promise<Category> {
    const existing = await this.categoryRepository.findById(id);
    if (!existing) throw new NotFoundError("Category not found");

    const name = input.name?.trim();
    if (name && name.toLowerCase() !== existing.name.toLowerCase()) {
      await this.assertCategoryNameFree(name, id);
    }

    let slug = existing.slug;
    if (input.slug?.trim() && input.slug.trim() !== existing.slug) {
      slug = await this.uniqueCategorySlug(input.slug.trim(), id);
    } else if (name && !input.slug?.trim() && name !== existing.name) {
      slug = await this.uniqueCategorySlug(name, id);
    }

    if (input.parentCategoryId !== undefined) {
      await this.assertNoCycle(id, input.parentCategoryId || null);
    }

    return this.categoryRepository.update(id, {
      ...input,
      ...(name ? { name } : {}),
      slug,
      ...(input.parentCategoryId !== undefined
        ? { parentCategoryId: input.parentCategoryId || null }
        : {}),
      updatedBy: actor?.id,
    });
  }

  /**
   * Soft-deletes a category.
   *
   * Refuses while the category still has children or assigned products — deleting either
   * would orphan records the storefront and Product Studio still resolve against.
   */
  async deleteCategory(id: string): Promise<boolean> {
    const existing = await this.categoryRepository.findById(id);
    if (!existing) throw new NotFoundError("Category not found");

    const [childCount, productCount] = await Promise.all([
      this.categoryRepository.count({ parentCategoryId: id }),
      this.productRepository.count({ categoryId: id }),
    ]);

    if (childCount > 0) {
      throw new ValidationError("Category has sub-categories", {
        id: [`Move or delete the ${childCount} sub-categor${childCount === 1 ? "y" : "ies"} first`],
      });
    }
    if (productCount > 0) {
      throw new ValidationError("Category is in use", {
        id: [
          `${productCount} product${productCount === 1 ? "" : "s"} still use this category. ` +
            `Reassign them before deleting.`,
        ],
      });
    }

    logger.info("ClassificationService: deleting category", { id, name: existing.name });
    return this.categoryRepository.delete(id);
  }

  async restoreCategory(id: string, actor?: ActorInfo): Promise<Category> {
    const existing = await this.categoryRepository.findById(id, { showDeleted: true });
    if (!existing) throw new NotFoundError("Category not found");

    return this.categoryRepository.update(
      id,
      { isDeleted: false, deletedAt: null, updatedBy: actor?.id },
      { showDeleted: true },
    );
  }

  /* ════════════════════════════════ Brands ════════════════════════════════ */

  async listBrands(search?: string): Promise<Brand[]> {
    const filter: Record<string, unknown> = {};
    if (search?.trim()) {
      const pattern = escapeRegex(search.trim());
      filter.$or = [
        { name: { $regex: pattern, $options: "i" } },
        { slug: { $regex: pattern, $options: "i" } },
        { website: { $regex: pattern, $options: "i" } },
      ];
    }
    const brands = await this.brandRepository.find(filter);
    // Featured first, then display order, then alphabetical — the order selectors expect.
    return brands.sort(
      (a, b) =>
        Number(b.isFeatured) - Number(a.isFeatured) ||
        a.sortOrder - b.sortOrder ||
        a.name.localeCompare(b.name),
    );
  }

  async getBrand(id: string): Promise<Brand | null> {
    return this.brandRepository.findById(id);
  }

  async createBrand(input: CreateBrandInput, actor?: ActorInfo): Promise<Brand> {
    const name = input.name.trim();
    await this.assertBrandNameFree(name);

    const slug = await this.uniqueBrandSlug(input.slug?.trim() || name);

    logger.info("ClassificationService: creating brand", { name, slug });

    return this.brandRepository.create({
      ...input,
      name,
      slug,
      createdBy: actor?.id,
      updatedBy: actor?.id,
    });
  }

  async updateBrand(id: string, input: UpdateBrandInput, actor?: ActorInfo): Promise<Brand> {
    const existing = await this.brandRepository.findById(id);
    if (!existing) throw new NotFoundError("Brand not found");

    const name = input.name?.trim();
    if (name && name.toLowerCase() !== existing.name.toLowerCase()) {
      await this.assertBrandNameFree(name, id);
    }

    let slug = existing.slug;
    if (input.slug?.trim() && input.slug.trim() !== existing.slug) {
      slug = await this.uniqueBrandSlug(input.slug.trim(), id);
    } else if (name && !input.slug?.trim() && name !== existing.name) {
      slug = await this.uniqueBrandSlug(name, id);
    }

    return this.brandRepository.update(id, {
      ...input,
      ...(name ? { name } : {}),
      slug,
      updatedBy: actor?.id,
    });
  }

  async deleteBrand(id: string): Promise<boolean> {
    const existing = await this.brandRepository.findById(id);
    if (!existing) throw new NotFoundError("Brand not found");

    const productCount = await this.productRepository.count({ brandId: id });
    if (productCount > 0) {
      throw new ValidationError("Brand is in use", {
        id: [
          `${productCount} product${productCount === 1 ? "" : "s"} still use this brand. ` +
            `Reassign them before deleting.`,
        ],
      });
    }

    logger.info("ClassificationService: deleting brand", { id, name: existing.name });
    return this.brandRepository.delete(id);
  }

  async restoreBrand(id: string, actor?: ActorInfo): Promise<Brand> {
    const existing = await this.brandRepository.findById(id, { showDeleted: true });
    if (!existing) throw new NotFoundError("Brand not found");

    return this.brandRepository.update(
      id,
      { isDeleted: false, deletedAt: null, updatedBy: actor?.id },
      { showDeleted: true },
    );
  }

  /* ══════════════════════════ Counts for admin lists ══════════════════════ */

  /** Product counts per category/brand id, in one query each rather than per row. */
  async productCounts(): Promise<{
    byCategory: Map<string, number>;
    byBrand: Map<string, number>;
  }> {
    const [categoryRows, brandRows] = await Promise.all([
      this.productRepository.groupCountBy("categoryId").catch(() => []),
      this.productRepository.groupCountBy("brandId").catch(() => []),
    ]);
    return {
      byCategory: new Map(categoryRows.map((r) => [r.key, r.count])),
      byBrand: new Map(brandRows.map((r) => [r.key, r.count])),
    };
  }

  /* ═════════════════════════════ Internal rules ═══════════════════════════ */

  private async assertCategoryNameFree(name: string, excludeId?: string): Promise<void> {
    const existing = await this.categoryRepository.findOne({
      name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });
    if (existing) {
      throw new ValidationError("Category name already exists", {
        name: [`"${name}" is already used by another category`],
      });
    }
  }

  private async assertBrandNameFree(name: string, excludeId?: string): Promise<void> {
    const existing = await this.brandRepository.findOne({
      name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });
    if (existing) {
      throw new ValidationError("Brand name already exists", {
        name: [`"${name}" is already used by another brand`],
      });
    }
  }

  /**
   * Walks up from the proposed parent looking for `categoryId`.
   *
   * Without this a category could be made its own ancestor, and every subsequent tree
   * walk — selectors, breadcrumbs, storefront navigation — would loop forever.
   */
  private async assertNoCycle(categoryId: string, parentId: string | null): Promise<void> {
    if (!parentId) return;

    if (parentId === categoryId) {
      throw new ValidationError("A category cannot be its own parent", {
        parentCategoryId: ["A category cannot be its own parent"],
      });
    }

    const parent = await this.categoryRepository.findById(parentId);
    if (!parent) {
      throw new ValidationError("Parent category not found", {
        parentCategoryId: ["The selected parent category does not exist"],
      });
    }

    let cursor: string | null = parent.parentCategoryId ?? null;
    let depth = 0;

    while (cursor && depth < MAX_CATEGORY_DEPTH) {
      if (cursor === categoryId) {
        throw new ValidationError("Circular category hierarchy", {
          parentCategoryId: [
            "That category is already a descendant of this one — choose a different parent",
          ],
        });
      }
      const ancestor: Category | null = await this.categoryRepository.findById(cursor);
      cursor = ancestor?.parentCategoryId ?? null;
      depth++;
    }

    if (depth >= MAX_CATEGORY_DEPTH) {
      throw new ValidationError("Category hierarchy is too deep", {
        parentCategoryId: [`Categories may not nest deeper than ${MAX_CATEGORY_DEPTH} levels`],
      });
    }
  }

  private async uniqueCategorySlug(source: string, excludeId?: string): Promise<string> {
    return uniqueSlug(source, async (candidate) => {
      const found = await this.categoryRepository.findBySlug(candidate);
      return Boolean(found) && found?.id !== excludeId;
    });
  }

  private async uniqueBrandSlug(source: string, excludeId?: string): Promise<string> {
    return uniqueSlug(source, async (candidate) => {
      const found = await this.brandRepository.findBySlug(candidate);
      return Boolean(found) && found?.id !== excludeId;
    });
  }
}

async function uniqueSlug(
  source: string,
  isTaken: (candidate: string) => Promise<boolean>,
): Promise<string> {
  const base = generateSlug(source) || "item";
  let candidate = base;
  let counter = 1;
  while (counter < 50) {
    if (!(await isTaken(candidate))) return candidate;
    candidate = `${base}-${counter}`;
    counter++;
  }
  return `${base}-${Date.now()}`;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default ClassificationService;
