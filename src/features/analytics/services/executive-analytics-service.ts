import { logger } from "@/lib/utils/logger";
import { EventFactRepository } from "../repositories/event-fact-repository";
import { resolveDateRange, type DateRange } from "./analytics-query-service";
import {
  ANALYTICS_EVENT_NAMES,
  type ExecutiveDashboardData,
  type MetricCardData,
  type TimeSeriesPoint,
} from "../domain/analytics-entity";
import { AnalyticsCacheService } from "./analytics-cache-service";

function pctChange(current: number, previous: number): number | undefined {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function previousRange(range: DateRange): DateRange {
  const ms = range.to.getTime() - range.from.getTime();
  return { from: new Date(range.from.getTime() - ms), to: new Date(range.from.getTime() - 1) };
}

export class ExecutiveAnalyticsService {
  private readonly facts = new EventFactRepository();
  private readonly cache = AnalyticsCacheService.getInstance();

  async getExecutiveDashboard(rangeInput?: {
    from?: Date;
    to?: Date;
    preset?: string;
  }): Promise<ExecutiveDashboardData> {
    const cacheKey = `executive:${rangeInput?.preset ?? "30d"}`;
    const cached = await this.cache.get<ExecutiveDashboardData>("executive", cacheKey);
    if (cached) return cached;

    const range = resolveDateRange(rangeInput);
    const prev = previousRange(range);
    const today = resolveDateRange({ preset: "today" });

    const [
      todayRevenue,
      todayOrders,
      revenue,
      prevRevenue,
      orders,
      prevOrders,
      shipments,
      deliveries,
      returnsCount,
      grossSales,
      netSales,
      profit,
      expensesVal,
      outstandingCOD,
      revenueSeries,
      ordersSeries,
    ] = await Promise.all([
      this.facts.sumValueInRange(today.from, today.to, [
        ANALYTICS_EVENT_NAMES.ORDER_CREATED,
        ANALYTICS_EVENT_NAMES.ORDER_PAID,
      ]),
      this.facts.countInRange(today.from, today.to, {
        eventName: [ANALYTICS_EVENT_NAMES.ORDER_CREATED, ANALYTICS_EVENT_NAMES.ORDER_PAID],
      }),
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
      this.getCountByEventName(range, ["courier.shipment_created"]),
      this.getCountByEventName(range, ["courier.shipment_delivered", "order.delivered"]),
      this.getCountByEventName(range, ["order.returned", "order.refunded"]),
      this.getSumByEventName(range, ["order.created", "order.paid"]),
      0, // netSales calculated below
      0, // profit calculated below
      0, // expenses
      this.getSumByEventName(range, ["order.returned"]),
      this.getTimeSeries(range, "sum"),
      this.getTimeSeries(range, "count"),
    ]);

    const result: ExecutiveDashboardData = {
      range: { from: range.from.toISOString(), to: range.to.toISOString() },
      todayRevenue,
      todayOrders,
      todayShipments: shipments,
      todayDeliveries: deliveries,
      todayReturns: returnsCount,
      grossSales,
      netSales: grossSales - (returnsCount > 0 ? expensesVal : 0),
      profit: grossSales - expensesVal,
      expenses: expensesVal,
      outstandingCOD,
      metrics: this.buildMetrics(revenue, prevRevenue, orders, prevOrders, grossSales),
      revenueSeries,
      ordersSeries,
    };

    await this.cache.set("executive", result, cacheKey, 300);
    return result;
  }

  private async getCountByEventName(range: DateRange, eventNames: string[]): Promise<number> {
    return this.facts.countInRange(range.from, range.to, { eventName: eventNames });
  }

  private async getSumByEventName(range: DateRange, eventNames: string[]): Promise<number> {
    return this.facts.sumValueInRange(range.from, range.to, eventNames);
  }

  private async getTimeSeries(range: DateRange, mode: "count" | "sum"): Promise<TimeSeriesPoint[]> {
    const events = [ANALYTICS_EVENT_NAMES.ORDER_CREATED, ANALYTICS_EVENT_NAMES.ORDER_PAID];
    return this.facts.seriesByDay(range.from, range.to, events, mode) as Promise<TimeSeriesPoint[]>;
  }

  private buildMetrics(
    revenue: number,
    prevRevenue: number,
    orders: number,
    prevOrders: number,
    grossSales: number,
  ): MetricCardData[] {
    return [
      {
        key: "revenue",
        label: "Gross Revenue",
        value: revenue,
        previousValue: prevRevenue,
        changePercent: pctChange(revenue, prevRevenue),
        format: "currency",
        currency: "BDT",
      },
      {
        key: "orders",
        label: "Total Orders",
        value: orders,
        previousValue: prevOrders,
        changePercent: pctChange(orders, prevOrders),
        format: "number",
      },
      {
        key: "aov",
        label: "Avg Order Value",
        value: orders > 0 ? Math.round(revenue / orders) : 0,
        format: "currency",
        currency: "BDT",
      },
      {
        key: "gross_sales",
        label: "Gross Sales",
        value: grossSales,
        format: "currency",
        currency: "BDT",
      },
    ];
  }
}

export default ExecutiveAnalyticsService;
