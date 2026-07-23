import { BaseRepository } from "@/lib/database/generic-repository";
import {
  AnalyticsReportModel,
  type AnalyticsReportDocument,
} from "./analytics-report-model";
import type { AnalyticsReport, AnalyticsReportChart, ReportFrequency } from "../domain/analytics-entity";

function mapReport(doc: any): AnalyticsReport {
  return {
    id: doc._id?.toString?.() ?? doc._id?.toString() ?? "",
    title: doc.title,
    description: doc.description,
    type: doc.type as ReportFrequency,
    filters: (doc.filters ?? {}) as any,
    data: doc.data ?? {},
    metrics: (doc.metrics ?? []).map((m: any) => ({
      key: m.key,
      label: m.label,
      value: m.value,
      previousValue: m.previousValue,
      changePercent: m.changePercent,
      format: m.format as "number" | "currency" | "percent" | undefined,
      currency: m.currency,
    })),
    charts: (doc.charts ?? []).map((c: any) => ({
      id: c.id,
      title: c.title,
      type: c.type as "area" | "bar" | "line" | "pie" | "heatmap",
      data: c.data,
      config: c.config,
    })),
    generatedAt: doc.generatedAt,
    generatedBy: doc.generatedBy,
    format: doc.format as "csv" | "excel" | "pdf",
    fileUrl: doc.fileUrl,
    size: doc.size,
    schedule: doc.schedule,
    recipients: doc.recipients,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted ?? false,
    status: doc.status ?? "active",
  };
}

export class AnalyticsReportRepository extends BaseRepository<
  AnalyticsReportDocument,
  AnalyticsReport
> {
  constructor() {
    super(AnalyticsReportModel as any, mapReport);
  }

  async findByType(
    type: ReportFrequency,
    limit = 20,
  ): Promise<AnalyticsReport[]> {
    const docs = await AnalyticsReportModel.find({ type, isDeleted: { $ne: true } })
      .sort({ generatedAt: -1 })
      .limit(limit)
      .lean();
    return docs.map((d) => mapReport(d as any));
  }

  async findByDateRange(from: Date, to: Date): Promise<AnalyticsReport[]> {
    const docs = await AnalyticsReportModel.find({
      generatedAt: { $gte: from, $lte: to },
      isDeleted: { $ne: true },
    })
      .sort({ generatedAt: -1 })
      .lean();
    return docs.map((d) => mapReport(d as any));
  }

  async search(query: string, limit = 20): Promise<AnalyticsReport[]> {
    const docs = await AnalyticsReportModel.find(
      { $text: { $search: query }, isDeleted: { $ne: true } },
      { score: { $meta: "textScore" } },
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(limit)
      .lean();
    return docs.map((d) => mapReport(d as any));
  }
}

export default AnalyticsReportRepository;
