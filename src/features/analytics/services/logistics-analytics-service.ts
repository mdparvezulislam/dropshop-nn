import { EventFactRepository } from "../repositories/event-fact-repository";
import { AnalyticsCacheService } from "./analytics-cache-service";
import { type LogisticsAnalyticsData, type MetricCardData } from "../domain/analytics-entity";
import { resolveDateRange } from "./analytics-query-service";

export class LogisticsAnalyticsService {
  private readonly facts = new EventFactRepository();
  private readonly cache = AnalyticsCacheService.getInstance();

  async getLogisticsAnalytics(rangeInput?: {
    from?: Date;
    to?: Date;
    preset?: string;
  }): Promise<LogisticsAnalyticsData> {
    const cacheKey = rangeInput?.preset ?? "30d";
    const cached = await this.cache.get<LogisticsAnalyticsData>("logistics", cacheKey);
    if (cached) return cached;

    const range = resolveDateRange(rangeInput);

    const [deliveries, shipped, returned, courierPerformance] = await Promise.all([
      this.facts.countInRange(range.from, range.to, {
        eventName: ["courier.shipment_delivered", "order.delivered"],
      }),
      this.facts.countInRange(range.from, range.to, {
        eventName: ["courier.shipment_created", "order.shipped"],
      }),
      this.facts.countInRange(range.from, range.to, {
        eventName: ["courier.shipment_returned", "order.returned"],
      }),
      this.facts.topByField(
        range.from,
        range.to,
        "courier.shipment_delivered",
        "metadata.courier",
        10,
      ),
    ]);

    const returnRate = deliveries > 0 ? Math.round((returned / deliveries) * 1000) / 10 : 0;

    const data: LogisticsAnalyticsData = {
      range: { from: range.from.toISOString(), to: range.to.toISOString() },
      courierPerformance: courierPerformance.map((r) => ({
        id: r.key,
        label: r.key,
        value: r.count,
      })),
      averageDeliveryTime: 0,
      failedDeliveries: 0,
      returnRate,
      hubPerformance: [],
      metrics: [
        {
          key: "delivered",
          label: "Delivered",
          value: deliveries,
          format: "number",
        },
        {
          key: "shipped",
          label: "Shipped",
          value: shipped,
          format: "number",
        },
        {
          key: "returned",
          label: "Returned",
          value: returned,
          format: "number",
        },
        {
          key: "return_rate",
          label: "Return Rate",
          value: returnRate,
          format: "percent",
        },
      ],
    };

    await this.cache.set("logistics", data, cacheKey);
    return data;
  }
}

export default LogisticsAnalyticsService;
