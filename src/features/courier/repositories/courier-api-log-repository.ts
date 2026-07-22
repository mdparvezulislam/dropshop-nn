import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { CourierApiLogModel } from "./courier-api-log-model";
import type { CourierApiLog } from "../domain/courier-api-log-entity";
import type { BaseDocument } from "@/shared/lib/database/types";

interface CourierApiLogDocument extends BaseDocument {
  provider: string;
  logType: any;
  endpoint: string;
  requestPayload?: any;
  responsePayload?: any;
  statusCode?: number;
  responseTimeMs?: number;
  success: boolean;
  errorMessage?: string;
  timestamp: Date;
}

function mapToDomain(doc: any): CourierApiLog {
  return {
    id: doc.id ?? doc._id?.toString(),
    provider: doc.provider,
    logType: doc.logType,
    endpoint: doc.endpoint,
    requestPayload: doc.requestPayload,
    responsePayload: doc.responsePayload,
    statusCode: doc.statusCode,
    responseTimeMs: doc.responseTimeMs,
    success: doc.success ?? true,
    errorMessage: doc.errorMessage,
    timestamp: doc.timestamp || doc.createdAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted ?? false,
    status: doc.status || "active",
    metadata: doc.metadata,
  };
}

export class CourierApiLogRepository extends BaseRepository<CourierApiLogDocument, CourierApiLog> {
  constructor() {
    super(CourierApiLogModel as any, mapToDomain);
  }

  async listLogs(provider?: string, logType?: string, limit: number = 100): Promise<CourierApiLog[]> {
    await this.ensureConnected();
    const query: any = { isDeleted: { $ne: true } };
    if (provider && provider !== "all") query.provider = provider.toLowerCase();
    if (logType && logType !== "all") query.logType = logType;

    const docs = await CourierApiLogModel.find(query).sort({ timestamp: -1 }).limit(limit).lean();
    return docs.map((d: any) => mapToDomain({ ...d, id: d._id.toString() }));
  }

  async getHealthStats(provider: string): Promise<{
    totalRequests: number;
    errorCount: number;
    avgResponseTimeMs: number;
    lastSuccessAt?: Date;
    lastErrorAt?: Date;
  }> {
    await this.ensureConnected();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const docs = await CourierApiLogModel.find({
      provider: provider.toLowerCase(),
      timestamp: { $gte: today },
    }).lean();

    const totalRequests = docs.length;
    const errors = docs.filter((d: any) => !d.success);
    const errorCount = errors.length;

    let totalTime = 0;
    let timedCount = 0;

    for (const d of docs) {
      if (d.responseTimeMs) {
        totalTime += d.responseTimeMs;
        timedCount++;
      }
    }

    const avgResponseTimeMs = timedCount > 0 ? Math.round(totalTime / timedCount) : 0;

    const lastSuccess = await CourierApiLogModel.findOne({ provider: provider.toLowerCase(), success: true })
      .sort({ timestamp: -1 })
      .lean();
    const lastErr = await CourierApiLogModel.findOne({ provider: provider.toLowerCase(), success: false })
      .sort({ timestamp: -1 })
      .lean();

    return {
      totalRequests,
      errorCount,
      avgResponseTimeMs,
      lastSuccessAt: lastSuccess?.timestamp,
      lastErrorAt: lastErr?.timestamp,
    };
  }
}

export default CourierApiLogRepository;
