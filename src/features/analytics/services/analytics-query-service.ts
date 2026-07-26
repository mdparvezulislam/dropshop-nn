import { EventFactRepository } from "../repositories/event-fact-repository";
import {
  ANALYTICS_EVENT_NAMES,
  type AnalyticsOverview,
  type MetricCardData,
  type RankedItem,
  type TimeSeriesPoint,
} from "../domain/analytics-entity";

export interface DateRange {
  from: Date;
  to: Date;
}

function pctChange(current: number, previous: number): number | undefined {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function previousRange(range: DateRange): DateRange {
  const ms = range.to.getTime() - range.from.getTime();
  return {
    from: new Date(range.from.getTime() - ms - 1),
    to: new Date(range.from.getTime() - 1),
  };
}

export function resolveDateRange(input?: { from?: Date; to?: Date; preset?: string }): DateRange {
  const to = input?.to ? new Date(input.to) : new Date();
  to.setHours(23, 59, 59, 999);

  if (input?.from && input.preset === "custom") {
    const from = new Date(input.from);
    from.setHours(0, 0, 0, 0);
    return { from, to };
  }

  const from = new Date(to);
  from.setHours(0, 0, 0, 0);
  switch (input?.preset) {
    case "today":
      break;
    case "7d":
      from.setDate(from.getDate() - 6);
      break;
    case "90d":
      from.setDate(from.getDate() - 89);
      break;
    case "12m":
      from.setFullYear(from.getFullYear() - 1);
      break;
    case "30d":
    default:
      from.setDate(from.getDate() - 29);
      break;
  }
  if (input?.from && input?.to) {
    const f = new Date(input.from);
    f.setHours(0, 0, 0, 0);
    return { from: f, to };
  }
  return { from, to };
}

export class AnalyticsQueryService {
  private readonly facts = new EventFactRepository();

  async getOverview(rangeInput?: {
    from?: Date;
    to?: Date;
    preset?: string;
  }): Promise<AnalyticsOverview> {
    const range = resolveDateRange(rangeInput);
    const prev = previousRange(range);

    const [
      revenue,
      prevRevenue,
      orders,
      prevOrders,
      checkoutsStarted,
      checkoutsCompleted,
      addToCart,
      sessions,
      prevSessions,
      revenueSeries,
      ordersSeries,
      topProducts,
      topCategories,
      topKeywords,
      topArticles,
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
        eventName: ANALYTICS_EVENT_NAMES.CHECKOUT_STARTED,
      }),
      this.facts.countInRange(range.from, range.to, {
        eventName: ANALYTICS_EVENT_NAMES.CHECKOUT_COMPLETED,
      }),
      this.facts.countInRange(range.from, range.to, {
        eventName: ANALYTICS_EVENT_NAMES.ADD_TO_CART,
      }),
      this.facts.distinctSessions(range.from, range.to),
      this.facts.distinctSessions(prev.from, prev.to),
      this.facts.seriesByDay(
        range.from,
        range.to,
        [ANALYTICS_EVENT_NAMES.ORDER_CREATED, ANALYTICS_EVENT_NAMES.ORDER_PAID],
        "sum",
      ),
      this.facts.seriesByDay(
        range.from,
        range.to,
        [ANALYTICS_EVENT_NAMES.ORDER_CREATED, ANALYTICS_EVENT_NAMES.ORDER_PAID],
        "count",
      ),
      this.facts.topByField(
        range.from,
        range.to,
        ANALYTICS_EVENT_NAMES.PRODUCT_VIEWED,
        "entityId",
        8,
      ),
      this.facts.topByField(
        range.from,
        range.to,
        ANALYTICS_EVENT_NAMES.CATEGORY_VIEWED,
        "entityId",
        8,
      ),
      this.facts.topByField(
        range.from,
        range.to,
        ANALYTICS_EVENT_NAMES.SEARCH_COMPLETED,
        "metadata.query",
        8,
      ),
      this.facts.topByField(range.from, range.to, ANALYTICS_EVENT_NAMES.BLOG_VIEWED, "entityId", 8),
    ]);

    const conversionRate = sessions > 0 ? Math.round((orders / sessions) * 1000) / 10 : 0;
    const cartAbandonmentRate =
      checkoutsStarted > 0
        ? Math.round(((checkoutsStarted - checkoutsCompleted) / checkoutsStarted) * 1000) / 10
        : 0;

    const metrics: MetricCardData[] = [
      {
        key: "revenue",
        label: "Revenue",
        value: revenue,
        previousValue: prevRevenue,
        changePercent: pctChange(revenue, prevRevenue),
        format: "currency",
        currency: "BDT",
      },
      {
        key: "orders",
        label: "Orders",
        value: orders,
        previousValue: prevOrders,
        changePercent: pctChange(orders, prevOrders),
        format: "number",
      },
      {
        key: "sessions",
        label: "Sessions",
        value: sessions,
        previousValue: prevSessions,
        changePercent: pctChange(sessions, prevSessions),
        format: "number",
      },
      {
        key: "conversion",
        label: "Conversion",
        value: conversionRate,
        format: "percent",
      },
      {
        key: "aov",
        label: "Avg Order Value",
        value: orders > 0 ? Math.round(revenue / orders) : 0,
        format: "currency",
        currency: "BDT",
      },
      {
        key: "add_to_cart",
        label: "Add to Cart",
        value: addToCart,
        format: "number",
      },
      {
        key: "cart_abandonment",
        label: "Cart Abandonment",
        value: cartAbandonmentRate,
        format: "percent",
      },
    ];

    const mapRanked = (
      rows: { key: string; count: number; sum: number }[],
      useSum = false,
    ): RankedItem[] =>
      rows.map((r) => ({
        id: r.key,
        label: r.key,
        value: useSum ? r.sum : r.count,
        secondary: useSum ? r.count : undefined,
      }));

    return {
      range: { from: range.from.toISOString(), to: range.to.toISOString() },
      metrics,
      revenueSeries: revenueSeries as TimeSeriesPoint[],
      ordersSeries: ordersSeries as TimeSeriesPoint[],
      topProducts: mapRanked(topProducts),
      topCategories: mapRanked(topCategories),
      topSearchKeywords: mapRanked(topKeywords),
      topArticles: mapRanked(topArticles),
      sessions,
      conversionRate,
      cartAbandonmentRate,
    };
  }

  async getSalesReport(rangeInput?: { from?: Date; to?: Date; preset?: string }): Promise<{
    range: { from: string; to: string };
    revenue: number;
    orders: number;
    aov: number;
    series: TimeSeriesPoint[];
  }> {
    const range = resolveDateRange(rangeInput);
    const [revenue, orders, series] = await Promise.all([
      this.facts.sumValueInRange(range.from, range.to, [
        ANALYTICS_EVENT_NAMES.ORDER_CREATED,
        ANALYTICS_EVENT_NAMES.ORDER_PAID,
      ]),
      this.facts.countInRange(range.from, range.to, {
        eventName: [ANALYTICS_EVENT_NAMES.ORDER_CREATED, ANALYTICS_EVENT_NAMES.ORDER_PAID],
      }),
      this.facts.seriesByDay(
        range.from,
        range.to,
        [ANALYTICS_EVENT_NAMES.ORDER_CREATED, ANALYTICS_EVENT_NAMES.ORDER_PAID],
        "sum",
      ),
    ]);
    return {
      range: { from: range.from.toISOString(), to: range.to.toISOString() },
      revenue,
      orders,
      aov: orders > 0 ? Math.round(revenue / orders) : 0,
      series,
    };
  }

  async getOrdersFunnel(rangeInput?: { from?: Date; to?: Date; preset?: string }): Promise<{
    range: { from: string; to: string };
    steps: { key: string; label: string; value: number }[];
  }> {
    const range = resolveDateRange(rangeInput);
    const names = [
      { key: ANALYTICS_EVENT_NAMES.PRODUCT_VIEWED, label: "Product views" },
      { key: ANALYTICS_EVENT_NAMES.ADD_TO_CART, label: "Add to cart" },
      { key: ANALYTICS_EVENT_NAMES.CHECKOUT_STARTED, label: "Checkout started" },
      { key: ANALYTICS_EVENT_NAMES.CHECKOUT_COMPLETED, label: "Checkout completed" },
      { key: ANALYTICS_EVENT_NAMES.ORDER_CREATED, label: "Orders created" },
      { key: ANALYTICS_EVENT_NAMES.ORDER_CANCELLED, label: "Cancelled" },
    ];
    const values = await Promise.all(
      names.map((n) => this.facts.countInRange(range.from, range.to, { eventName: n.key })),
    );
    return {
      range: { from: range.from.toISOString(), to: range.to.toISOString() },
      steps: names.map((n, i) => ({ key: n.key, label: n.label, value: values[i] })),
    };
  }

  async getCatalogInsights(rangeInput?: { from?: Date; to?: Date; preset?: string }): Promise<{
    productViews: number;
    searches: number;
    topProducts: RankedItem[];
    topKeywords: RankedItem[];
  }> {
    const range = resolveDateRange(rangeInput);
    const [productViews, searches, topProducts, topKeywords] = await Promise.all([
      this.facts.countInRange(range.from, range.to, {
        eventName: ANALYTICS_EVENT_NAMES.PRODUCT_VIEWED,
      }),
      this.facts.countInRange(range.from, range.to, {
        eventName: ANALYTICS_EVENT_NAMES.SEARCH_COMPLETED,
      }),
      this.facts.topByField(
        range.from,
        range.to,
        ANALYTICS_EVENT_NAMES.PRODUCT_VIEWED,
        "metadata.name",
        10,
      ),
      this.facts.topByField(
        range.from,
        range.to,
        ANALYTICS_EVENT_NAMES.SEARCH_COMPLETED,
        "metadata.query",
        10,
      ),
    ]);
    return {
      productViews,
      searches,
      topProducts: topProducts.map((r) => ({
        id: r.key,
        label: r.key,
        value: r.count,
      })),
      topKeywords: topKeywords.map((r) => ({
        id: r.key,
        label: r.key,
        value: r.count,
      })),
    };
  }

  async getContentInsights(rangeInput?: { from?: Date; to?: Date; preset?: string }): Promise<{
    blogViews: number;
    blogShares: number;
    cmsPublishes: number;
    topArticles: RankedItem[];
  }> {
    const range = resolveDateRange(rangeInput);
    const [blogViews, blogShares, cmsPublishes, topArticles] = await Promise.all([
      this.facts.countInRange(range.from, range.to, {
        eventName: ANALYTICS_EVENT_NAMES.BLOG_VIEWED,
      }),
      this.facts.countInRange(range.from, range.to, {
        eventName: ANALYTICS_EVENT_NAMES.BLOG_SHARED,
      }),
      this.facts.countInRange(range.from, range.to, {
        eventName: ANALYTICS_EVENT_NAMES.CMS_PUBLISHED,
      }),
      this.facts.topByField(
        range.from,
        range.to,
        ANALYTICS_EVENT_NAMES.BLOG_VIEWED,
        "metadata.title",
        10,
      ),
    ]);
    return {
      blogViews,
      blogShares,
      cmsPublishes,
      topArticles: topArticles.map((r) => ({
        id: r.key,
        label: r.key,
        value: r.count,
      })),
    };
  }

  async exportEventsCsv(rangeInput?: { from?: Date; to?: Date; preset?: string }): Promise<string> {
    const range = resolveDateRange(rangeInput);
    const events = await this.facts.listRecent(500);
    const filtered = events.filter((e) => e.timestamp >= range.from && e.timestamp <= range.to);
    const header = [
      "eventId",
      "eventName",
      "timestamp",
      "actorRole",
      "sessionId",
      "module",
      "entityType",
      "entityId",
      "value",
      "currency",
    ];
    const lines = [header.join(",")];
    for (const e of filtered) {
      lines.push(
        [
          e.eventId,
          e.eventName,
          new Date(e.timestamp).toISOString(),
          e.actorRole ?? "",
          e.sessionId ?? "",
          e.module,
          e.entityType ?? "",
          e.entityId ?? "",
          e.value ?? "",
          e.currency ?? "",
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(","),
      );
    }
    return lines.join("\n");
  }
}

export default AnalyticsQueryService;
