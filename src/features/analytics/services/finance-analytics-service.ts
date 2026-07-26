import { EventFactRepository } from "../repositories/event-fact-repository";
import { AnalyticsCacheService } from "./analytics-cache-service";
import {
  type FinanceAnalyticsData,
  type MetricCardData,
  type TimeSeriesPoint,
  ANALYTICS_EVENT_NAMES,
} from "../domain/analytics-entity";
import { resolveDateRange } from "./analytics-query-service";

function pctChange(current: number, previous: number): number | undefined {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export class FinanceAnalyticsService {
  private readonly facts = new EventFactRepository();
  private readonly cache = AnalyticsCacheService.getInstance();

  async getFinanceAnalytics(rangeInput?: {
    from?: Date;
    to?: Date;
    preset?: string;
  }): Promise<FinanceAnalyticsData> {
    const cacheKey = rangeInput?.preset ?? "30d";
    const cached = await this.cache.get<FinanceAnalyticsData>("finance", cacheKey);
    if (cached) return cached;

    const range = resolveDateRange(rangeInput);

    const [revenue, refunds, revenueSeries, profitSeries] = await Promise.all([
      this.facts.sumValueInRange(range.from, range.to, [
        ANALYTICS_EVENT_NAMES.ORDER_CREATED,
        ANALYTICS_EVENT_NAMES.ORDER_PAID,
      ]),
      this.facts.sumValueInRange(range.from, range.to, [
        ANALYTICS_EVENT_NAMES.REFUND_COMPLETED,
        "order.refunded",
      ]),
      this.getTimeSeries(range, "sum"),
      this.getProfitSeries(range),
    ]);

    const data: FinanceAnalyticsData = {
      range: { from: range.from.toISOString(), to: range.to.toISOString() },
      totalRevenue: revenue,
      totalProfit: revenue - refunds,
      totalExpenses: refunds,
      totalRefunds: refunds,
      walletBalances: 0,
      settlementStatus: "settled",
      codOutstanding: 0,
      revenueSeries,
      profitSeries,
      metrics: [
        {
          key: "revenue",
          label: "Revenue",
          value: revenue,
          format: "currency",
          currency: "BDT",
        },
        {
          key: "profit",
          label: "Profit",
          value: revenue - refunds,
          format: "currency",
          currency: "BDT",
        },
        {
          key: "refunds",
          label: "Refunds",
          value: refunds,
          format: "currency",
          currency: "BDT",
        },
        {
          key: "expenses",
          label: "Expenses",
          value: refunds,
          format: "currency",
          currency: "BDT",
        },
      ],
    };

    await this.cache.set("finance", data, cacheKey);
    return data;
  }

  private async getTimeSeries(
    range: { from: Date; to: Date },
    mode: "count" | "sum",
  ): Promise<TimeSeriesPoint[]> {
    const events = [ANALYTICS_EVENT_NAMES.ORDER_CREATED, ANALYTICS_EVENT_NAMES.ORDER_PAID];
    return this.facts.seriesByDay(range.from, range.to, events, mode) as Promise<TimeSeriesPoint[]>;
  }

  private async getProfitSeries(range: { from: Date; to: Date }): Promise<TimeSeriesPoint[]> {
    const revenueData = (await this.facts.seriesByDay(
      range.from,
      range.to,
      [ANALYTICS_EVENT_NAMES.ORDER_CREATED, ANALYTICS_EVENT_NAMES.ORDER_PAID],
      "sum",
    )) as { date: string; value: number }[];
    const refundData = (await this.facts.seriesByDay(
      range.from,
      range.to,
      [ANALYTICS_EVENT_NAMES.REFUND_COMPLETED, "order.refunded"],
      "sum",
    )) as { date: string; value: number }[];

    const refundMap = new Map(refundData.map((r) => [r.date, r.value]));
    return revenueData.map((r) => ({
      date: r.date,
      value: r.value - (refundMap.get(r.date) ?? 0),
    }));
  }
}

export default FinanceAnalyticsService;
