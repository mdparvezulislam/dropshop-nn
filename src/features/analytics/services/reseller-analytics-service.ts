import { EventFactRepository } from "../repositories/event-fact-repository";
import { AnalyticsCacheService } from "./analytics-cache-service";
import {
  type ResellerAnalyticsData,
  type MetricCardData,
  ANALYTICS_EVENT_NAMES,
} from "../domain/analytics-entity";
import { resolveDateRange } from "./analytics-query-service";

export class ResellerAnalyticsService {
  private readonly facts = new EventFactRepository();
  private readonly cache = AnalyticsCacheService.getInstance();

  async getResellerAnalytics(rangeInput?: {
    from?: Date;
    to?: Date;
    preset?: string;
  }): Promise<ResellerAnalyticsData> {
    const cacheKey = rangeInput?.preset ?? "30d";
    const cached = await this.cache.get<ResellerAnalyticsData>("reseller", cacheKey);
    if (cached) return cached;

    const range = resolveDateRange(rangeInput);

    const [resellerOrders, resellerRevenue, topResellers] = await Promise.all([
      this.facts.countInRange(range.from, range.to, {
        eventName: [ANALYTICS_EVENT_NAMES.ORDER_CREATED, ANALYTICS_EVENT_NAMES.ORDER_PAID],
        module: "reseller",
      }),
      this.facts.sumValueInRange(range.from, range.to, [
        ANALYTICS_EVENT_NAMES.ORDER_CREATED,
        ANALYTICS_EVENT_NAMES.ORDER_PAID,
      ]),
      this.facts.topByField(
        range.from,
        range.to,
        ANALYTICS_EVENT_NAMES.ORDER_CREATED,
        "metadata.resellerId",
        10,
      ),
    ]);

    const data: ResellerAnalyticsData = {
      range: { from: range.from.toISOString(), to: range.to.toISOString() },
      topResellers: topResellers.map((r) => ({ id: r.key, label: r.key, value: r.count })),
      lowestPerformingResellers: [],
      totalCommission: Math.round(resellerRevenue * 0.1),
      totalRevenue: resellerRevenue,
      totalOrderCount: resellerOrders,
      totalConversion: 0,
      metrics: [
        {
          key: "reseller_revenue",
          label: "Reseller Revenue",
          value: resellerRevenue,
          format: "currency",
          currency: "BDT",
        },
        {
          key: "reseller_orders",
          label: "Reseller Orders",
          value: resellerOrders,
          format: "number",
        },
        {
          key: "commission",
          label: "Commission",
          value: Math.round(resellerRevenue * 0.1),
          format: "currency",
          currency: "BDT",
        },
      ],
    };

    await this.cache.set("reseller", data, cacheKey);
    return data;
  }
}

export default ResellerAnalyticsService;
