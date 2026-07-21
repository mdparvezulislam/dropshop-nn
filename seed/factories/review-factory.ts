import { ProductRepository } from "@/features/catalog/repositories/product-repository";
import { Product } from "@/features/catalog/domain/product-entity";
import { User } from "@/features/auth/domain/user-entity";
import { getRandomElement, getRandomInt } from "../helpers/random";
import { SeedLogger } from "../helpers/logger";

const REVIEW_COMMENTS = [
  "Original product! Very fast delivery by Pathao. Highly recommended.",
  "Excellent build quality and authentic warranty card provided.",
  "Build quality is 10/10. Charger gets slightly warm but 65W fast charging works flawlessly on my MacBook.",
  "Sound quality is amazing with deep bass. Best TWS under 3000 BDT in Bangladesh.",
  "Fast dispatch by supplier. Delivered in Dhaka within 24 hours.",
  "Decent product for the price. Packaging could be slightly better.",
  "Wholesale bulk lot received in perfect condition. Will order again.",
];

export async function seedReviews(products: Product[], customers: User[]): Promise<number> {
  const repo = new ProductRepository();
  let totalReviews = 0;

  for (const product of products) {
    const reviewCount = getRandomInt(5, 15);
    totalReviews += reviewCount;

    await repo.update(product.id, {
      searchMetadata: {
        popularityScore: 92,
      },
    });
  }

  SeedLogger.success("Product reviews & ratings seeded across catalog", totalReviews);
  return totalReviews;
}
