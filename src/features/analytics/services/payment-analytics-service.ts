import { EventFactRepository } from "../repositories/event-fact-repository";
import { AnalyticsCacheService } from "./analytics-cache-service";
import {
  type PaymentAnalyticsData,
  type MetricCardData,
  ANALYTICS_EVENT_NAMES,
} from "../domain/analytics-entity";
import { resolveDateRange } from "./analytics-query-service";

export class PaymentAnalyticsService {
  private readonly facts = new EventFactRepository();
  private readonly cache = AnalyticsCacheService.getInstance();

  async getPaymentAnalytics(rangeInput?: {
    from?: Date;
    to?: Date;
    preset?: string;
  }): Promise<PaymentAnalyticsData> {
    const cacheKey = rangeInput?.preset ?? "30d";
    const cached = await this.cache.get<PaymentAnalyticsData>("payment", cacheKey);
    if (cached) return cached;

    const range = resolveDateRange(rangeInput);

    const [totalOrders, cancellations, paymentMethods] = await Promise.all([
      this.facts.countInRange(range.from, range.to, {
        eventName: [ANALYTICS_EVENT_NAMES.ORDER_CREATED, ANALYTICS_EVENT_NAMES.ORDER_PAID],
      }),
      this.facts.countInRange(range.from, range.to, {
        eventName: ANALYTICS_EVENT_NAMES.ORDER_CANCELLED,
      }),
      this.facts.topByField(
        range.from,
        range.to,
        "checkout.payment_selected",
        "metadata.method",
        10,
      ),
    ]);

    const successRate =
      totalOrders > 0 ? Math.round(((totalOrders - cancellations) / totalOrders) * 1000) / 10 : 0;

    const data: PaymentAnalyticsData = {
      range: { from: range.from.toISOString(), to: range.to.toISOString() },
      paymentMethods: paymentMethods.map((r) => ({ id: r.key, label: r.key, value: r.count })),
      successRate,
      failedPayments: cancellations,
      pendingPayments: 0,
      metrics: [
        {
          key: "success_rate",
          label: "Success Rate",
          value: successRate,
          format: "percent",
        },
        {
          key: "failed",
          label: "Failed Payments",
          value: cancellations,
          format: "number",
        },
        {
          key: "total",
          label: "Total Payments",
          value: totalOrders,
          format: "number",
        },
      ],
    };

    await this.cache.set("payment", data, cacheKey);
    return data;
  }
}

export default PaymentAnalyticsService;
