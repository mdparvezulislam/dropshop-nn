import { CategoryRepository } from "@/features/catalog/repositories/classification-repository";
import { CATEGORIES_DATA } from "../datasets/categories-data";
import { SeedLogger } from "../helpers/logger";
import { Category } from "@/features/catalog/domain/classification-entity";

export async function seedCategories(): Promise<Category[]> {
  const repo = new CategoryRepository();
  const categories: Category[] = [];

  let sortOrder = 0;
  for (const item of CATEGORIES_DATA) {
    sortOrder += 10;
    let parent = await repo.findBySlug(item.slug);
    if (!parent) {
      parent = await repo.create({
        name: item.name,
        slug: item.slug,
        description: item.description,
        image: item.image,
        sortOrder,
        status: "active",
      });
    }
    categories.push(parent);

    if (item.children && item.children.length > 0) {
      let childOrder = sortOrder;
      for (const child of item.children) {
        childOrder += 1;
        let sub = await repo.findBySlug(child.slug);
        if (!sub) {
          sub = await repo.create({
            name: child.name,
            slug: child.slug,
            parentCategoryId: parent.id,
            description: child.description,
            image: item.image,
            sortOrder: childOrder,
            status: "active",
          });
        }
        categories.push(sub);
      }
    }
  }

  SeedLogger.success("Categories seeded (nested hierarchy)", categories.length);
  return categories;
}
