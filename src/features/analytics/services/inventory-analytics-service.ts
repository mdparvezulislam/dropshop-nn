import { EventFactRepository } from "../repositories/event-fact-repository";
import { AnalyticsCacheService } from "./analytics-cache-service";
import { type InventoryAnalyticsData, type MetricCardData } from "../domain/analytics-entity";
import { resolveDateRange } from "./analytics-query-service";

export class InventoryAnalyticsService {
  private readonly facts = new EventFactRepository();
  private readonly cache = AnalyticsCacheService.getInstance();

  async getInventoryAnalytics(rangeInput?: {
    from?: Date;
    to?: Date;
    preset?: string;
  }): Promise<InventoryAnalyticsData> {
    const cacheKey = rangeInput?.preset ?? "30d";
    const cached = await this.cache.get<InventoryAnalyticsData>("inventory", cacheKey);
    if (cached) return cached;

    const range = resolveDateRange(rangeInput);

    const [stockAdjustments, lowStockEvents, outOfStockEvents] = await Promise.all([
      this.facts.countInRange(range.from, range.to, { eventName: "inventory.stock_adjusted" }),
      this.facts.countInRange(range.from, range.to, { eventName: "inventory.low_stock" }),
      this.facts.countInRange(range.from, range.to, { eventName: "inventory.out_of_stock" }),
    ]);

    const data: InventoryAnalyticsData = {
      range: { from: range.from.toISOString(), to: range.to.toISOString() },
      stockMovement: [],
      fastMovingProducts: [],
      slowMovingProducts: [],
      inventoryValue: 0,
      deadStock: [],
      metrics: [
        {
          key: "stock_adjustments",
          label: "Stock Adjustments",
          value: stockAdjustments,
          format: "number",
        },
        {
          key: "low_stock",
          label: "Low Stock Events",
          value: lowStockEvents,
          format: "number",
        },
        {
          key: "out_of_stock",
          label: "Out of Stock Events",
          value: outOfStockEvents,
          format: "number",
        },
      ],
    };

    await this.cache.set("inventory", data, cacheKey);
    return data;
  }
}

export default InventoryAnalyticsService;
