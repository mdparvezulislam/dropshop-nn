import type { SearchResultItem } from "@/lib/platform/platform-types";
import { AnalyticsReportRepository } from "../repositories/analytics-report-repository";
import { AnalyticsSnapshotRepository } from "../repositories/analytics-snapshot-repository";
import { AnalyticsCacheService } from "./analytics-cache-service";

export class AnalyticsSearchService {
  private readonly reportRepo = new AnalyticsReportRepository();
  private readonly snapshotRepo = new AnalyticsSnapshotRepository();
  private readonly cache = AnalyticsCacheService.getInstance();

  async search(query: string, limit = 20): Promise<SearchResultItem[]> {
    if (!query || query.trim().length < 2) return [];

    const cacheKey = `q:${query.toLowerCase().trim()}`;
    const cached = await this.cache.get<SearchResultItem[]>("search", cacheKey);
    if (cached) return cached;

    const results: SearchResultItem[] = [];
    const lowerQuery = query.toLowerCase();

    const reports = await this.reportRepo.search(query, limit);
    for (const report of reports) {
      results.push({
        id: report.id,
        type: "report",
        title: report.title,
        description: report.description ?? `Report - ${report.type}`,
        href: `/dashboard/analytics/reports/${report.id}`,
      });
    }

    const snapshots = await this.searchSnapshots(lowerQuery, limit);
    for (const snap of snapshots) {
      results.push({
        id: snap.id,
        type: "snapshot",
        title: `${snap.type.charAt(0).toUpperCase() + snap.type.slice(1)} Snapshot - ${snap.snapshotDate.toISOString().slice(0, 10)}`,
        description: `Metrics: ${Object.keys(snap.metrics).slice(0, 3).join(", ")}`,
        href: `/dashboard/analytics`,
      });
    }

    const matchedTypes = this.matchTypes(lowerQuery);
    for (const mt of matchedTypes) {
      results.push(mt);
    }

    const finalResults = results.slice(0, limit);
    await this.cache.set("search", finalResults, cacheKey, 60);
    return finalResults;
  }

  private async searchSnapshots(query: string, limit: number): Promise<any[]> {
    const allSnapshots = await (this.snapshotRepo as any).find(
      {},
      { limit: 50, sort: { snapshotDate: -1 } },
    );
    return allSnapshots
      .filter(
        (s: any) => s.type.includes(query) || Object.keys(s.metrics).some((k) => k.includes(query)),
      )
      .slice(0, limit);
  }

  private matchTypes(query: string): SearchResultItem[] {
    const types: { key: string; label: string; href: string }[] = [
      { key: "executive", label: "Executive Dashboard", href: "/dashboard/analytics/executive" },
      { key: "order", label: "Order Analytics", href: "/dashboard/analytics/orders" },
      { key: "product", label: "Product Analytics", href: "/dashboard/analytics/products" },
      { key: "customer", label: "Customer Analytics", href: "/dashboard/analytics/customers" },
      { key: "reseller", label: "Reseller Analytics", href: "/dashboard/analytics/resellers" },
      { key: "wholesale", label: "Wholesale Analytics", href: "/dashboard/analytics/wholesale" },
      { key: "finance", label: "Finance Analytics", href: "/dashboard/analytics/finance" },
      { key: "logistics", label: "Logistics Analytics", href: "/dashboard/analytics/logistics" },
      { key: "inventory", label: "Inventory Analytics", href: "/dashboard/analytics/inventory" },
      { key: "payment", label: "Payment Analytics", href: "/dashboard/analytics/payments" },
      { key: "report", label: "Report Center", href: "/dashboard/analytics/reports" },
      { key: "live", label: "Live Dashboard", href: "/dashboard/analytics/live" },
    ];
    return types
      .filter(
        (t) =>
          t.key.includes(query.toLowerCase()) ||
          t.label.toLowerCase().includes(query.toLowerCase()),
      )
      .map((t) => ({
        id: t.key,
        type: "page",
        title: t.label,
        description: `Analytics ${t.label}`,
        href: t.href,
      }));
  }
}

export default AnalyticsSearchService;
