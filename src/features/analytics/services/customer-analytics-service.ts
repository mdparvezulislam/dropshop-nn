import { EventFactRepository } from "../repositories/event-fact-repository";
import { AnalyticsCacheService } from "./analytics-cache-service";
import {
  type CustomerAnalyticsData, type MetricCardData, ANALYTICS_EVENT_NAMES,
} from "../domain/analytics-entity";
import { resolveDateRange } from "./analytics-query-service";

export class CustomerAnalyticsService {
  private readonly facts = new EventFactRepository();
  private readonly cache = AnalyticsCacheService.getInstance();

  async getCustomerAnalytics(rangeInput?: {
    from?: Date; to?: Date; preset?: string;
  }): Promise<CustomerAnalyticsData> {
    const cacheKey = rangeInput?.preset ?? "30d";
    const cached = await this.cache.get<CustomerAnalyticsData>("customer", cacheKey);
    if (cached) return cached;

    const range = resolveDateRange(rangeInput);

    const [
      sessions, orders, revenue, newCustomers, returningCustomers,
    ] = await Promise.all([
      this.facts.distinctSessions(range.from, range.to),
      this.facts.countInRange(range.from, range.to, {
        eventName: [ANALYTICS_EVENT_NAMES.ORDER_CREATED, ANALYTICS_EVENT_NAMES.ORDER_PAID],
      }),
      this.facts.sumValueInRange(range.from, range.to, [
        ANALYTICS_EVENT_NAMES.ORDER_CREATED, ANALYTICS_EVENT_NAMES.ORDER_PAID,
      ]),
      this.facts.distinctActors(range.from, range.to, "customer"),
      this.getReturningCustomerCount(range),
    ]);

    const averageSpend = sessions > 0 ? Math.round(revenue / sessions) : 0;
    const lifetimeValue = orders > 0 ? Math.round(revenue / (newCustomers || 1)) : 0;
    const repeatPurchaseRate = (newCustomers + returningCustomers) > 0
      ? Math.round((returningCustomers / (newCustomers + returningCustomers)) * 1000) / 10
      : 0;

    const data: CustomerAnalyticsData = {
      range: { from: range.from.toISOString(), to: range.to.toISOString() },
      newCustomers,
      returningCustomers,
      lifetimeValue,
      averageSpend,
      repeatPurchaseRate,
      inactiveCustomers: 0,
      totalCustomers: newCustomers + returningCustomers,
      customerAcquisitionSeries: [],
      metrics: [
        {
          key: "new_customers", label: "New Customers",
          value: newCustomers, format: "number",
        },
        {
          key: "returning", label: "Returning",
          value: returningCustomers, format: "number",
        },
        {
          key: "ltv", label: "Lifetime Value",
          value: lifetimeValue, format: "currency", currency: "BDT",
        },
        {
          key: "avg_spend", label: "Avg Spend",
          value: averageSpend, format: "currency", currency: "BDT",
        },
        {
          key: "repeat_rate", label: "Repeat Rate",
          value: repeatPurchaseRate, format: "percent",
        },
      ],
    };

    await this.cache.set("customer", data, cacheKey);
    return data;
  }

  private async getReturningCustomerCount(range: { from: Date; to: Date }): Promise<number> {
    const allActors = await this.facts.getDistinctActorsWithCount(range.from, range.to, "customer");
    return allActors.filter((a) => a.count > 1).length;
  }
}

export default CustomerAnalyticsService;
