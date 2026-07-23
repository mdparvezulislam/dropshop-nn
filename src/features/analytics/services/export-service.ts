import { EventFactRepository } from "../repositories/event-fact-repository";
import { AnalyticsReportRepository } from "../repositories/analytics-report-repository";
import { resolveDateRange, type DateRange } from "./analytics-query-service";
import type { AnalyticsFilter, ExportFormat } from "../domain/analytics-entity";
import { logger } from "@/shared/utils/logger";

interface ExportResult {
  content: string;
  filename: string;
  mimeType: string;
}

export class ExportService {
  private readonly facts = new EventFactRepository();
  private readonly reportRepo = new AnalyticsReportRepository();

  async exportAnalytics(
    input: {
      format: ExportFormat;
      filters?: AnalyticsFilter;
      type?: "executive" | "orders" | "products" | "finance" | "logistics";
    },
  ): Promise<ExportResult> {
    const range = resolveDateRange(input.filters);
    const events = await this.facts.listRecent(1000);
    const filtered = events.filter(
      (e) => e.timestamp >= range.from && e.timestamp <= range.to,
    );

    switch (input.format) {
      case "csv":
        return this.toCsv(filtered, input.type ?? "executive");
      case "excel":
        return this.toExcel(filtered);
      case "pdf":
        return this.toPdf(filtered);
    }
  }

  async exportReport(reportId: string, format: ExportFormat): Promise<ExportResult> {
    const report = await this.reportRepo.findById(reportId);
    if (!report) {
      throw new Error(`Report ${reportId} not found`);
    }

    const csv = this.convertReportToCsv(report);
    const filename = `${report.title.replace(/\s+/g, "-").toLowerCase()}-${format}.csv`;
    return { content: csv, filename, mimeType: "text/csv" };
  }

  async exportSnapshot(
    data: Record<string, unknown>,
    metrics: Record<string, number>,
    title: string,
    format: ExportFormat,
  ): Promise<ExportResult> {
    const headers = ["metric", "value"];
    const rows = Object.entries(metrics).map(([key, value]) => `${key},${value}`);
    const csv = [headers.join(","), ...rows, "", "# Snapshot Data", JSON.stringify(data)].join("\n");
    return {
      content: csv,
      filename: `${title.replace(/\s+/g, "-").toLowerCase()}-snapshot.csv`,
      mimeType: "text/csv",
    };
  }

  private async toCsv(events: any[], type: string): Promise<ExportResult> {
    const headers = ["eventId", "eventName", "timestamp", "actorRole", "module", "entityType", "entityId", "value", "currency"];
    const rows = events.map((e) => [
      e.eventId, e.eventName, new Date(e.timestamp).toISOString(),
      e.actorRole ?? "", e.module, e.entityType ?? "", e.entityId ?? "",
      e.value ?? "", e.currency ?? "",
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const content = [headers.join(","), ...rows].join("\n");
    return {
      content,
      filename: `analytics-${type}-${Date.now()}.csv`,
      mimeType: "text/csv",
    };
  }

  private async toExcel(events: any[]): Promise<ExportResult> {
    const excelCsv = await this.toCsv(events, "export");
    return {
      ...excelCsv,
      filename: excelCsv.filename.replace(".csv", ".xlsx"),
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }

  private async toPdf(events: any[]): Promise<ExportResult> {
    const pdfCsv = await this.toCsv(events, "export");
    return {
      content: pdfCsv.content,
      filename: pdfCsv.filename.replace(".csv", ".pdf"),
      mimeType: "application/pdf",
    };
  }

  private convertReportToCsv(report: any): string {
    const lines: string[] = [`Report: ${report.title}`, `Generated: ${new Date(report.generatedAt).toISOString()}`, `Type: ${report.type}`, ""];
    if (report.metrics?.length > 0) {
      lines.push("Metrics", "key,label,value");
      for (const m of report.metrics) {
        lines.push(`${m.key},${m.label},${m.value}`);
      }
      lines.push("");
    }
    if (report.charts?.length > 0) {
      for (const chart of report.charts) {
        lines.push(`Chart: ${chart.title}`, "date,value");
        for (const d of chart.data) {
          lines.push(`${d.date},${d.value}`);
        }
        lines.push("");
      }
    }
    return lines.join("\n");
  }
}

export default ExportService;
