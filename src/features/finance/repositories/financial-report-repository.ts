import { BaseRepository } from "@/lib/database/generic-repository";
import { FinancialReportModel } from "./financial-report-model";
import type { FinancialReport, ReportType } from "../domain/financial-report-entity";
import type { BaseDocument } from "@/lib/database/types";

interface FinancialReportDocument extends BaseDocument {
  referenceNumber: string;
  title: string;
  type: string;
  startDate: Date;
  endDate: Date;
  summaryData: Record<string, unknown>;
  format: string;
}

function mapToDomain(doc: any): FinancialReport {
  return {
    id: doc.id ?? doc._id?.toString(),
    referenceNumber: doc.referenceNumber ?? `RPT-${doc._id?.toString().slice(-6).toUpperCase()}`,
    title: doc.title,
    type: doc.type as ReportType,
    startDate: doc.startDate ? new Date(doc.startDate) : new Date(),
    endDate: doc.endDate ? new Date(doc.endDate) : new Date(),
    summaryData: doc.summaryData,
    generatedBy: doc.createdBy ?? "system",
    format: (doc.format as any) ?? "csv",
    status: doc.status ?? "cleared",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted,
    metadata: doc.metadata,
  };
}

export class FinancialReportRepository extends BaseRepository<
  FinancialReportDocument,
  FinancialReport
> {
  constructor() {
    super(FinancialReportModel as any, mapToDomain);
  }

  async findRecentReports(limit: number = 30): Promise<FinancialReport[]> {
    const docs = await FinancialReportModel.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return docs.map((d: any) => mapToDomain({ ...d, id: d._id.toString() }));
  }
}

export default FinancialReportRepository;
