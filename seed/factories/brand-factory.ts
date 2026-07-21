import { BrandRepository } from "@/features/catalog/repositories/classification-repository";
import { BRANDS_DATA } from "../datasets/brands-data";
import { SeedLogger } from "../helpers/logger";
import { Brand } from "@/features/catalog/domain/classification-entity";

export async function seedBrands(): Promise<Brand[]> {
  const repo = new BrandRepository();
  const brands: Brand[] = [];

  for (const b of BRANDS_DATA) {
    let existing = await repo.findBySlug(b.slug);
    if (!existing) {
      existing = await repo.create({
        name: b.name,
        slug: b.slug,
        logo: b.logo,
        description: b.description,
        status: "active",
      });
    }
    brands.push(existing);
  }

  SeedLogger.success("Brands seeded", brands.length);
  return brands;
}
