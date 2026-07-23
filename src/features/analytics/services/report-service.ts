import { logger } from "@/lib/utils/logger";
import { AnalyticsReportRepository } from "../repositories/analytics-report-repository";
import { AnalyticsCacheService } from "./analytics-cache-service";
import { EventFactRepository } from "../repositories/event-fact-repository";
import { resolveDateRange, type DateRange } from "./analytics-query-service";
import {
  type AnalyticsReport, type AnalyticsReportChart, type ReportFrequency,
  type AnalyticsFilter, type MetricCardData, type TimeSeriesPoint, ANALYTICS_EVENT_NAMES,
} from "../domain/analytics-entity";
import { EventBus } from "@/lib/event-bus";
import { ANALYTICS_DOMAIN_EVENTS } from "../domain/analytics-events";

export class ReportService {
  private readonly reportRepo = new AnalyticsReportRepository();
  private readonly facts = new EventFactRepository();
  private readonly cache = AnalyticsCacheService.getInstance();

  async generateReport(input: {
    title: string;
    description?: string;
    type: ReportFrequency;
    filters: AnalyticsFilter;
    generatedBy?: string;
  }): Promise<AnalyticsReport> {
    const range = this.resolveReportRange(input.type, input.filters);
    const data = await this.collectReportData(range, input.type);
    const metrics = await this.buildMetrics(range);
    const charts = await this.buildCharts(range);

    const report: AnalyticsReport = {
      id: "",
      title: input.title,
      description: input.description,
      type: input.type,
      filters: input.filters,
      data,
      metrics,
      charts,
      generatedAt: new Date(),
      generatedBy: input.generatedBy,
      format: "csv",
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      status: "active",
    };

    const saved = await this.reportRepo.create(report as any);

    await EventBus.publish(ANALYTICS_DOMAIN_EVENTS.REPORT_GENERATED, {
      reportId: saved.id,
      title: saved.title,
      type: saved.type,
    }, { source: "report-service" });

    return saved;
  }

  async getReport(id: string): Promise<AnalyticsReport | null> {
    return this.reportRepo.findById(id);
  }

  async listReports(type?: ReportFrequency, limit = 20): Promise<AnalyticsReport[]> {
    if (type) return this.reportRepo.findByType(type, limit);
    return (this.reportRepo as any).find({}, { sort: { generatedAt: -1 }, limit });
  }

  async searchReports(query: string): Promise<AnalyticsReport[]> {
    return this.reportRepo.search(query);
  }

  private resolveReportRange(type: ReportFrequency, filters: AnalyticsFilter): DateRange {
    if (filters.dateFrom && filters.dateTo) {
      return { from: filters.dateFrom, to: filters.dateTo };
    }
    const preset = filters.preset ?? this.getDefaultPreset(type);
    return resolveDateRange({ preset });
  }

  private getDefaultPreset(type: ReportFrequency): string {
    switch (type) {
      case "daily": return "today";
      case "weekly": return "7d";
      case "monthly": return "30d";
      case "quarterly": return "90d";
      case "yearly": return "12m";
      default: return "30d";
    }
  }

  private async collectReportData(range: DateRange, type: ReportFrequency): Promise<Record<string, unknown>> {
    const [revenue, orders, sessions, productViews] = await Promise.all([
      this.facts.sumValueInRange(range.from, range.to, [
        ANALYTICS_EVENT_NAMES.ORDER_CREATED, ANALYTICS_EVENT_NAMES.ORDER_PAID,
      ]),
      this.facts.countInRange(range.from, range.to, {
        eventName: [ANALYTICS_EVENT_NAMES.ORDER_CREATED, ANALYTICS_EVENT_NAMES.ORDER_PAID],
      }),
      this.facts.distinctSessions(range.from, range.to),
      this.facts.countInRange(range.from, range.to, { eventName: ANALYTICS_EVENT_NAMES.PRODUCT_VIEWED }),
    ]);

    return { revenue, orders, sessions, productViews, type, generatedAt: new Date().toISOString() };
  }

  private async buildMetrics(range: DateRange): Promise<MetricCardData[]> {
    const [revenue, orders, sessions] = await Promise.all([
      this.facts.sumValueInRange(range.from, range.to, [
        ANALYTICS_EVENT_NAMES.ORDER_CREATED, ANALYTICS_EVENT_NAMES.ORDER_PAID,
      ]),
      this.facts.countInRange(range.from, range.to, {
        eventName: [ANALYTICS_EVENT_NAMES.ORDER_CREATED, ANALYTICS_EVENT_NAMES.ORDER_PAID],
      }),
      this.facts.distinctSessions(range.from, range.to),
    ]);

    return [
      { key: "revenue", label: "Revenue", value: revenue, format: "currency", currency: "BDT" },
      { key: "orders", label: "Orders", value: orders, format: "number" },
      { key: "sessions", label: "Sessions", value: sessions, format: "number" },
      {
        key: "aov", label: "Avg Order Value",
        value: orders > 0 ? Math.round(revenue / orders) : 0, format: "currency", currency: "BDT",
      },
    ];
  }

  private async buildCharts(range: DateRange): Promise<AnalyticsReportChart[]> {
    const revenueSeries = await this.facts.seriesByDay(range.from, range.to, [
      ANALYTICS_EVENT_NAMES.ORDER_CREATED, ANALYTICS_EVENT_NAMES.ORDER_PAID,
    ], "sum") as TimeSeriesPoint[];

    const ordersSeries = await this.facts.seriesByDay(range.from, range.to, [
      ANALYTICS_EVENT_NAMES.ORDER_CREATED, ANALYTICS_EVENT_NAMES.ORDER_PAID,
    ], "count") as TimeSeriesPoint[];

    return [
      { id: "revenue", title: "Revenue Trend", type: "area", data: revenueSeries },
      { id: "orders", title: "Orders Trend", type: "bar", data: ordersSeries },
    ];
  }
}

export default ReportService;
