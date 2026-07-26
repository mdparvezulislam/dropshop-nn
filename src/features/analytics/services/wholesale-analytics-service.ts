import { EventFactRepository } from "../repositories/event-fact-repository";
import { AnalyticsCacheService } from "./analytics-cache-service";
import {
  type WholesaleAnalyticsData,
  type MetricCardData,
  ANALYTICS_EVENT_NAMES,
} from "../domain/analytics-entity";
import { resolveDateRange } from "./analytics-query-service";

export class WholesaleAnalyticsService {
  private readonly facts = new EventFactRepository();
  private readonly cache = AnalyticsCacheService.getInstance();

  async getWholesaleAnalytics(rangeInput?: {
    from?: Date;
    to?: Date;
    preset?: string;
  }): Promise<WholesaleAnalyticsData> {
    const cacheKey = rangeInput?.preset ?? "30d";
    const cached = await this.cache.get<WholesaleAnalyticsData>("wholesale", cacheKey);
    if (cached) return cached;

    const range = resolveDateRange(rangeInput);

    const [revenue, orders, topBuyers] = await Promise.all([
      this.facts.sumValueInRange(range.from, range.to, [
        ANALYTICS_EVENT_NAMES.ORDER_CREATED,
        ANALYTICS_EVENT_NAMES.ORDER_PAID,
      ]),
      this.facts.countInRange(range.from, range.to, {
        eventName: [ANALYTICS_EVENT_NAMES.ORDER_CREATED, ANALYTICS_EVENT_NAMES.ORDER_PAID],
        module: "wholesale",
      }),
      this.facts.topByField(
        range.from,
        range.to,
        ANALYTICS_EVENT_NAMES.ORDER_CREATED,
        "metadata.wholesaleId",
        10,
      ),
    ]);

    const data: WholesaleAnalyticsData = {
      range: { from: range.from.toISOString(), to: range.to.toISOString() },
      wholesaleRevenue: revenue,
      wholesaleOrders: orders,
      topWholesaleBuyers: topBuyers.map((r) => ({ id: r.key, label: r.key, value: r.count })),
      metrics: [
        {
          key: "wholesale_revenue",
          label: "Wholesale Revenue",
          value: revenue,
          format: "currency",
          currency: "BDT",
        },
        {
          key: "wholesale_orders",
          label: "Wholesale Orders",
          value: orders,
          format: "number",
        },
        {
          key: "top_buyers",
          label: "Top Buyers",
          value: topBuyers.length,
          format: "number",
        },
      ],
    };

    await this.cache.set("wholesale", data, cacheKey);
    return data;
  }
}

export default WholesaleAnalyticsService;
