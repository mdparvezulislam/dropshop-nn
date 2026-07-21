import { EventFactModel } from "@/features/analytics/repositories/event-fact-model";
import { MetricBucketRepository } from "@/features/analytics/repositories/metric-bucket-repository";
import { SeedLogger } from "../helpers/logger";
import { Product } from "@/features/catalog/domain/product-entity";
import { User } from "@/features/auth/domain/user-entity";
import { getRandomElement, getRandomInt } from "../helpers/random";

export async function seedAnalytics(products: Product[], customers: User[]): Promise<void> {
  const metricRepo = new MetricBucketRepository();
  let factCount = 0;

  const eventTypes = [
    "product.viewed",
    "catalog.searched",
    "cart.item_added",
    "checkout.started",
    "order.created",
    "order.completed",
  ];

  for (let i = 1; i <= 200; i++) {
    const eventName = getRandomElement(eventTypes);
    const product = getRandomElement(products);
    const customer = getRandomElement(customers);

    try {
      await EventFactModel.create({
        eventId: `evt_${i}_${Date.now()}`,
        eventName,
        timestamp: new Date(Date.now() - getRandomInt(0, 30) * 86400000),
        actorId: customer.id,
        actorRole: "customer",
        source: "website",
        module: "catalog",
        entityType: "product",
        entityId: product.id,
        value: (product as any).retailPrice || 350000,
        currency: "BDT",
      });
      factCount++;
    } catch {
      // ignore duplicates
    }
  }

  // Seed Metric Bucket for dashboard charts
  await metricRepo.increment("sales.gross_revenue", "day", new Date(), 12500000);

  SeedLogger.success("Analytics event facts & metric buckets seeded", factCount);
}
