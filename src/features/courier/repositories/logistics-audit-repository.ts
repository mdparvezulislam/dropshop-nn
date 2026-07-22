import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { LogisticsAuditModel } from "./logistics-audit-model";
import type { LogisticsAuditLog } from "../domain/logistics-audit-entity";
import type { BaseDocument } from "@/shared/lib/database/types";

interface LogisticsAuditDocument extends BaseDocument {
  referenceNumber: string;
  shipmentId?: string;
  orderId?: string;
  provider?: string;
  action: string;
  actorId: string;
  oldStatus?: string;
  newStatus?: string;
  reason?: string;
  details?: Record<string, unknown>;
}

function mapToDomain(doc: any): LogisticsAuditLog {
  return {
    id: doc.id ?? doc._id?.toString(),
    referenceNumber: doc.referenceNumber,
    shipmentId: doc.shipmentId,
    orderId: doc.orderId,
    provider: doc.provider,
    action: doc.action,
    actorId: doc.actorId,
    oldStatus: doc.oldStatus,
    newStatus: doc.newStatus,
    reason: doc.reason,
    details: doc.details,
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

export class LogisticsAuditRepository extends BaseRepository<LogisticsAuditDocument, LogisticsAuditLog> {
  constructor() {
    super(LogisticsAuditModel as any, mapToDomain);
  }

  async listRecentLogs(limit: number = 50): Promise<LogisticsAuditLog[]> {
    const docs = await LogisticsAuditModel.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return docs.map((d: any) => mapToDomain({ ...d, id: d._id.toString() }));
  }
}

export default LogisticsAuditRepository;
