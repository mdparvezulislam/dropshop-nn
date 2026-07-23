"use server";

import { auth } from "@/shared/lib/auth";
import { checkPermission } from "@/shared/lib/check-permission";
import { revalidatePath } from "next/cache";
import { AnalyticsPublisher } from "../services/analytics-publisher";
import { AnalyticsQueryService } from "../services/analytics-query-service";
import { ExecutiveAnalyticsService } from "../services/executive-analytics-service";
import { OrderAnalyticsService } from "../services/order-analytics-service";
import { ProductAnalyticsService } from "../services/product-analytics-service";
import { CustomerAnalyticsService } from "../services/customer-analytics-service";
import { ResellerAnalyticsService } from "../services/reseller-analytics-service";
import { WholesaleAnalyticsService } from "../services/wholesale-analytics-service";
import { FinanceAnalyticsService } from "../services/finance-analytics-service";
import { LogisticsAnalyticsService } from "../services/logistics-analytics-service";
import { InventoryAnalyticsService } from "../services/inventory-analytics-service";
import { PaymentAnalyticsService } from "../services/payment-analytics-service";
import { ReportService } from "../services/report-service";
import { ExportService } from "../services/export-service";
import { AggregationService } from "../services/aggregation-service";
import { AnalyticsSearchService } from "../services/analytics-search-service";
import { AnalyticsCacheService } from "../services/analytics-cache-service";
import {
  trackEventSchema,
  overviewQuerySchema,
  exportQuerySchema,
  reportGenerateSchema,
  reportExportSchema,
  analyticsSearchSchema,
} from "../types/validation";
import type { AnalyticsModule } from "../domain/analytics-entity";
// Response types follow the pattern: { success: boolean; data?: T; error?: string }

export async function trackAnalyticsEventAction(payload: unknown): Promise<{ success: boolean; data?: { eventId: string }; error?: string }> {
  try {
    const session = await auth();
    const validated = trackEventSchema.parse(payload);
    const user = (session as any)?.user;
    const publisher = new AnalyticsPublisher();
    const result = await publisher.track({
      ...validated,
      actorId: validated.actorId ?? user?.id,
      actorRole: validated.actorRole ?? user?.role ?? "guest",
      source: validated.source ?? "client",
      module: (validated.module ?? "website") as AnalyticsModule,
    });
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to track event" };
  }
}

export async function getAnalyticsOverviewAction(query: unknown = {}): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");
    const validated = overviewQuerySchema.parse(query ?? {});
    const service = new AnalyticsQueryService();
    const data = await service.getOverview(validated);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load overview" };
  }
}

export async function getSalesAnalyticsAction(query: unknown = {}): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");
    const validated = overviewQuerySchema.parse(query ?? {});
    const service = new AnalyticsQueryService();
    const data = await service.getSalesReport(validated);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load sales analytics" };
  }
}

export async function getOrdersFunnelAction(query: unknown = {}): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");
    const validated = overviewQuerySchema.parse(query ?? {});
    const service = new AnalyticsQueryService();
    const data = await service.getOrdersFunnel(validated);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load funnel" };
  }
}

export async function getCatalogAnalyticsAction(query: unknown = {}): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");
    const validated = overviewQuerySchema.parse(query ?? {});
    const service = new AnalyticsQueryService();
    const data = await service.getCatalogInsights(validated);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load catalog analytics" };
  }
}

export async function getContentAnalyticsAction(query: unknown = {}): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");
    const validated = overviewQuerySchema.parse(query ?? {});
    const service = new AnalyticsQueryService();
    const data = await service.getContentInsights(validated);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load content analytics" };
  }
}

export async function getExecutiveDashboardAction(query: unknown = {}): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");
    const validated = overviewQuerySchema.parse(query ?? {});
    const service = new ExecutiveAnalyticsService();
    const data = await service.getExecutiveDashboard(validated);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load executive dashboard" };
  }
}

export async function getOrderAnalyticsAction(query: unknown = {}): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");
    const validated = overviewQuerySchema.parse(query ?? {});
    const service = new OrderAnalyticsService();
    const data = await service.getOrderAnalytics(validated);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load order analytics" };
  }
}

export async function getProductAnalyticsAction(query: unknown = {}): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");
    const validated = overviewQuerySchema.parse(query ?? {});
    const service = new ProductAnalyticsService();
    const data = await service.getProductAnalytics(validated);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load product analytics" };
  }
}

export async function getCustomerAnalyticsAction(query: unknown = {}): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");
    const validated = overviewQuerySchema.parse(query ?? {});
    const service = new CustomerAnalyticsService();
    const data = await service.getCustomerAnalytics(validated);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load customer analytics" };
  }
}

export async function getResellerAnalyticsAction(query: unknown = {}): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");
    const validated = overviewQuerySchema.parse(query ?? {});
    const service = new ResellerAnalyticsService();
    const data = await service.getResellerAnalytics(validated);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load reseller analytics" };
  }
}

export async function getWholesaleAnalyticsAction(query: unknown = {}): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");
    const validated = overviewQuerySchema.parse(query ?? {});
    const service = new WholesaleAnalyticsService();
    const data = await service.getWholesaleAnalytics(validated);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load wholesale analytics" };
  }
}

export async function getFinanceAnalyticsAction(query: unknown = {}): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");
    const validated = overviewQuerySchema.parse(query ?? {});
    const service = new FinanceAnalyticsService();
    const data = await service.getFinanceAnalytics(validated);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load finance analytics" };
  }
}

export async function getLogisticsAnalyticsAction(query: unknown = {}): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");
    const validated = overviewQuerySchema.parse(query ?? {});
    const service = new LogisticsAnalyticsService();
    const data = await service.getLogisticsAnalytics(validated);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load logistics analytics" };
  }
}

export async function getInventoryAnalyticsAction(query: unknown = {}): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");
    const validated = overviewQuerySchema.parse(query ?? {});
    const service = new InventoryAnalyticsService();
    const data = await service.getInventoryAnalytics(validated);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load inventory analytics" };
  }
}

export async function getPaymentAnalyticsAction(query: unknown = {}): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");
    const validated = overviewQuerySchema.parse(query ?? {});
    const service = new PaymentAnalyticsService();
    const data = await service.getPaymentAnalytics(validated);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load payment analytics" };
  }
}

export async function getLiveDashboardAction(): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");
    const todayRange = { preset: "today" };
    const service = new ExecutiveAnalyticsService();
    const data = await service.getExecutiveDashboard(todayRange);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load live dashboard" };
  }
}

export async function generateReportAction(input: unknown): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Report.Generate");
    const validated = reportGenerateSchema.parse(input);
    const user = (session as any)?.user;
    const service = new ReportService();
    const report = await service.generateReport({
      title: validated.title,
      description: validated.description,
      type: validated.type,
      filters: validated.filters ?? {},
      generatedBy: user?.id,
    });
    revalidatePath("/dashboard/analytics/reports");
    return { success: true, data: report };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to generate report" };
  }
}

export async function getReportsAction(query?: { type?: string }): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Report.View");
    const service = new ReportService();
    const reports = await service.listReports(query?.type as any);
    return { success: true, data: reports };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load reports" };
  }
}

export async function getReportAction(id: string): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Report.View");
    const service = new ReportService();
    const report = await service.getReport(id);
    if (!report) return { success: false, error: "Report not found" };
    return { success: true, data: report };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load report" };
  }
}

export async function exportAnalyticsAction(input: unknown): Promise<{ success: boolean; data?: { content: string; filename: string; mimeType: string }; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Report.Export");
    const validated = exportQuerySchema.parse(input ?? {});
    const service = new ExportService();
    const result = await service.exportAnalytics(validated);
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to export" };
  }
}

export async function exportReportAction(input: unknown): Promise<{ success: boolean; data?: { content: string; filename: string; mimeType: string }; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Report.Export");
    const validated = reportExportSchema.parse(input);
    const service = new ExportService();
    const result = await service.exportReport(validated.reportId, validated.format);
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to export report" };
  }
}

export async function generateDailySnapshotAction(): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Admin.Analytics");
    const service = new AggregationService();
    const snapshot = await service.generateDailySnapshot();
    revalidatePath("/dashboard/analytics");
    return { success: true, data: snapshot };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to generate snapshot" };
  }
}

export async function generateMonthlySnapshotAction(): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Admin.Analytics");
    const service = new AggregationService();
    const snapshot = await service.generateMonthlySnapshot();
    revalidatePath("/dashboard/analytics");
    return { success: true, data: snapshot };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to generate monthly snapshot" };
  }
}

export async function getLatestSnapshotAction(type: string): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");
    const service = new AggregationService();
    const snapshot = await service.getLatestSnapshot(type as any);
    return { success: true, data: snapshot };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to load snapshot" };
  }
}

export async function refreshDashboardAction(dashboard: string): Promise<{ success: boolean; data?: { refreshed: boolean }; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Admin.Analytics");
    const cache = AnalyticsCacheService.getInstance();
    await cache.invalidate(dashboard as any);
    revalidatePath(`/dashboard/analytics/${dashboard}`);
    return { success: true, data: { refreshed: true } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to refresh dashboard" };
  }
}

export async function searchAnalyticsAction(query: unknown): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Analytics.View");
    const validated = analyticsSearchSchema.parse(query);
    const service = new AnalyticsSearchService();
    const results = await service.search(validated.query, validated.limit);
    return { success: true, data: results };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Search failed" };
  }
}
