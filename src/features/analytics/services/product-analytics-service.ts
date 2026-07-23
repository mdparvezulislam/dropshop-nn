import { EventFactRepository } from "../repositories/event-fact-repository";
import { AnalyticsCacheService } from "./analytics-cache-service";
import {
  type ProductAnalyticsData, type MetricCardData, type RankedItem, ANALYTICS_EVENT_NAMES,
} from "../domain/analytics-entity";
import { resolveDateRange } from "./analytics-query-service";

export class ProductAnalyticsService {
  private readonly facts = new EventFactRepository();
  private readonly cache = AnalyticsCacheService.getInstance();

  async getProductAnalytics(rangeInput?: {
    from?: Date; to?: Date; preset?: string;
  }): Promise<ProductAnalyticsData> {
    const cacheKey = rangeInput?.preset ?? "30d";
    const cached = await this.cache.get<ProductAnalyticsData>("product", cacheKey);
    if (cached) return cached;

    const range = resolveDateRange(rangeInput);

    const [
      productViews, topSelling, mostViewed,
      topRevenue, categoryPerf, brandPerf,
    ] = await Promise.all([
      this.facts.countInRange(range.from, range.to, {
        eventName: ANALYTICS_EVENT_NAMES.PRODUCT_VIEWED,
      }),
      this.facts.topByField(range.from, range.to, [ANALYTICS_EVENT_NAMES.ORDER_CREATED], "metadata.productId", 10),
      this.facts.topByField(range.from, range.to, ANALYTICS_EVENT_NAMES.PRODUCT_VIEWED, "entityId", 10),
      this.getTopRevenueProducts(range),
      this.facts.topByField(range.from, range.to, ANALYTICS_EVENT_NAMES.CATEGORY_VIEWED, "entityId", 10),
      this.facts.topByField(range.from, range.to, ANALYTICS_EVENT_NAMES.PRODUCT_VIEWED, "metadata.brand", 10),
    ]);

    const data: ProductAnalyticsData = {
      range: { from: range.from.toISOString(), to: range.to.toISOString() },
      topSellingProducts: topSelling.map((r) => ({ id: r.key, label: r.key, value: r.count })),
      lowSellingProducts: [],
      lowStockProducts: [],
      outOfStockProducts: [],
      mostViewedProducts: mostViewed.map((r) => ({ id: r.key, label: r.key, value: r.count })),
      highestRevenueProducts: topRevenue.map((r) => ({ id: r.key, label: r.key, value: r.sum })),
      categoryPerformance: categoryPerf.map((r) => ({ id: r.key, label: r.key, value: r.count })),
      brandPerformance: brandPerf.map((r) => ({ id: r.key, label: r.key, value: r.count })),
      totalProducts: 0,
      activeProducts: 0,
      metrics: [
        {
          key: "product_views", label: "Product Views",
          value: productViews, format: "number",
        },
        {
          key: "active_products", label: "Active Products",
          value: 0, format: "number",
        },
        {
          key: "top_selling", label: "Top Selling Products",
          value: topSelling.length, format: "number",
        },
        {
          key: "low_stock", label: "Low Stock Items",
          value: 0, format: "number",
        },
      ],
    };

    await this.cache.set("product", data, cacheKey);
    return data;
  }

  private async getTopRevenueProducts(range: { from: Date; to: Date }): Promise<{ key: string; count: number; sum: number }[]> {
    return this.facts.topByField(
      range.from, range.to,
      [ANALYTICS_EVENT_NAMES.ORDER_CREATED, ANALYTICS_EVENT_NAMES.ORDER_PAID],
      "metadata.productId", 10,
    );
  }
}

export default ProductAnalyticsService;
