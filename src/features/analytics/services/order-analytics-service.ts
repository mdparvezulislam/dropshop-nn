import { EventFactRepository } from "../repositories/event-fact-repository";
import { AnalyticsCacheService } from "./analytics-cache-service";
import {
  type OrderAnalyticsData,
  type MetricCardData,
  type TimeSeriesPoint,
  ANALYTICS_EVENT_NAMES,
} from "../domain/analytics-entity";
import { resolveDateRange, type DateRange } from "./analytics-query-service";

function pctChange(current: number, previous: number): number | undefined {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function previousRange(range: DateRange): DateRange {
  const ms = range.to.getTime() - range.from.getTime();
  return { from: new Date(range.from.getTime() - ms), to: new Date(range.from.getTime() - 1) };
}

export class OrderAnalyticsService {
  private readonly facts = new EventFactRepository();
  private readonly cache = AnalyticsCacheService.getInstance();

  async getOrderAnalytics(rangeInput?: {
    from?: Date;
    to?: Date;
    preset?: string;
  }): Promise<OrderAnalyticsData> {
    const cacheKey = rangeInput?.preset ?? "30d";
    const cached = await this.cache.get<OrderAnalyticsData>("order", cacheKey);
    if (cached) return cached;

    const range = resolveDateRange(rangeInput);
    const prev = previousRange(range);

    const [
      totalRevenue,
      prevRevenue,
      totalOrders,
      prevOrders,
      cancelledOrders,
      returnedOrders,
      pendingOrders,
      sessions,
      revenueSeries,
      ordersSeries,
      ordersByHour,
      ordersByDay,
      ordersByMonth,
    ] = await Promise.all([
      this.facts.sumValueInRange(range.from, range.to, [
        ANALYTICS_EVENT_NAMES.ORDER_CREATED,
        ANALYTICS_EVENT_NAMES.ORDER_PAID,
      ]),
      this.facts.sumValueInRange(prev.from, prev.to, [
        ANALYTICS_EVENT_NAMES.ORDER_CREATED,
        ANALYTICS_EVENT_NAMES.ORDER_PAID,
      ]),
      this.facts.countInRange(range.from, range.to, {
        eventName: [ANALYTICS_EVENT_NAMES.ORDER_CREATED, ANALYTICS_EVENT_NAMES.ORDER_PAID],
      }),
      this.facts.countInRange(prev.from, prev.to, {
        eventName: [ANALYTICS_EVENT_NAMES.ORDER_CREATED, ANALYTICS_EVENT_NAMES.ORDER_PAID],
      }),
      this.facts.countInRange(range.from, range.to, {
        eventName: ANALYTICS_EVENT_NAMES.ORDER_CANCELLED,
      }),
      this.getReturnedCount(range),
      this.facts.countInRange(range.from, range.to, {
        eventName: ANALYTICS_EVENT_NAMES.ORDER_CREATED,
      }),
      this.facts.distinctSessions(range.from, range.to),
      this.getTimeSeries(range, "sum"),
      this.getTimeSeries(range, "count"),
      this.getSeriesByHour(range),
      this.getSeriesByDayOfMonth(range),
      this.getSeriesByMonth(range),
    ]);

    const conversionRate = sessions > 0 ? Math.round((totalOrders / sessions) * 1000) / 10 : 0;

    const data: OrderAnalyticsData = {
      range: { from: range.from.toISOString(), to: range.to.toISOString() },
      ordersByHour,
      ordersByDay,
      ordersByMonth,
      averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
      conversionRate,
      cancelledOrders,
      returnedOrders,
      pendingOrders,
      totalOrders,
      metrics: [
        {
          key: "total_orders",
          label: "Total Orders",
          value: totalOrders,
          previousValue: prevOrders,
          changePercent: pctChange(totalOrders, prevOrders),
          format: "number",
        },
        {
          key: "revenue",
          label: "Revenue",
          value: totalRevenue,
          previousValue: prevRevenue,
          changePercent: pctChange(totalRevenue, prevRevenue),
          format: "currency",
          currency: "BDT",
        },
        {
          key: "aov",
          label: "Avg Order Value",
          value: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
          format: "currency",
          currency: "BDT",
        },
        {
          key: "conversion",
          label: "Conversion Rate",
          value: conversionRate,
          format: "percent",
        },
        {
          key: "cancelled",
          label: "Cancelled",
          value: cancelledOrders,
          format: "number",
        },
        {
          key: "returned",
          label: "Returned",
          value: returnedOrders,
          format: "number",
        },
      ],
    };

    await this.cache.set("order", data, cacheKey);
    return data;
  }

  private async getReturnedCount(range: DateRange): Promise<number> {
    return this.facts.countInRange(range.from, range.to, {
      eventName: ["order.returned", "order.refunded", ANALYTICS_EVENT_NAMES.REFUND_COMPLETED],
    });
  }

  private async getTimeSeries(range: DateRange, mode: "count" | "sum"): Promise<TimeSeriesPoint[]> {
    const events = [ANALYTICS_EVENT_NAMES.ORDER_CREATED, ANALYTICS_EVENT_NAMES.ORDER_PAID];
    return this.facts.seriesByDay(range.from, range.to, events, mode) as Promise<TimeSeriesPoint[]>;
  }

  private async getSeriesByHour(range: DateRange): Promise<TimeSeriesPoint[]> {
    const rows = (await this.facts.getSeriesByTimeUnit(range.from, range.to, "%H")) as any[];
    return rows.map((r: any) => ({ date: r._id, value: r.value }));
  }

  private async getSeriesByDayOfMonth(range: DateRange): Promise<TimeSeriesPoint[]> {
    const rows = (await this.facts.getSeriesByTimeUnit(range.from, range.to, "%d")) as any[];
    return rows.map((r: any) => ({ date: r._id, value: r.value }));
  }

  private async getSeriesByMonth(range: DateRange): Promise<TimeSeriesPoint[]> {
    const rows = (await this.facts.getSeriesByTimeUnit(range.from, range.to, "%Y-%m")) as any[];
    return rows.map((r: any) => ({ date: r._id, value: r.value }));
  }
}

export default OrderAnalyticsService;
