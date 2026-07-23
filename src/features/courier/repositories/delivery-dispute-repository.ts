import { BaseRepository } from "@/lib/database/generic-repository";
import { DeliveryDisputeModel, LogisticsEscalationModel } from "./delivery-dispute-model";
import type { DeliveryDispute, LogisticsEscalation } from "../domain/delivery-dispute-entity";
import type { BaseDocument } from "@/lib/database/types";

interface DeliveryDisputeDocument extends BaseDocument {
  disputeNumber: string;
  shipmentId: string;
  orderId: string;
  disputeType: any;
  status: any;
  assignedStaffId?: string;
  assignedStaffName?: string;
  evidenceUrls?: string[];
  internalNotes?: string[];
  resolutionSummary?: string;
  codDiscrepancyCents?: number;
  resolvedAt?: Date;
}

function mapToDomainDispute(doc: any): DeliveryDispute {
  return {
    id: doc.id ?? doc._id?.toString(),
    disputeNumber: doc.disputeNumber,
    shipmentId: doc.shipmentId,
    orderId: doc.orderId,
    disputeType: doc.disputeType,
    status: doc.status || "created",
    assignedStaffId: doc.assignedStaffId,
    assignedStaffName: doc.assignedStaffName,
    evidenceUrls: doc.evidenceUrls || [],
    internalNotes: doc.internalNotes || [],
    resolutionSummary: doc.resolutionSummary,
    codDiscrepancyCents: doc.codDiscrepancyCents ?? 0,
    resolvedAt: doc.resolvedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted ?? false,
    metadata: doc.metadata,
  };
}

function mapToDomainEscalation(doc: any): LogisticsEscalation {
  return {
    id: doc.id ?? doc._id?.toString(),
    escalationNumber: doc.escalationNumber,
    disputeId: doc.disputeId,
    shipmentId: doc.shipmentId,
    level: doc.level,
    assignedRole: doc.assignedRole,
    reason: doc.reason,
    status: doc.status || "open",
    escalatedBy: doc.escalatedBy,
    resolvedBy: doc.resolvedBy,
    resolutionNotes: doc.resolutionNotes,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted ?? false,
    metadata: doc.metadata,
  };
}

export class DeliveryDisputeRepository extends BaseRepository<DeliveryDisputeDocument, DeliveryDispute> {
  constructor() {
    super(DeliveryDisputeModel as any, mapToDomainDispute);
  }

  async findByShipmentId(shipmentId: string): Promise<DeliveryDispute | null> {
    await this.ensureConnected();
    const doc = await DeliveryDisputeModel.findOne({ shipmentId, isDeleted: { $ne: true } }).lean();
    return doc ? mapToDomainDispute({ ...doc, id: doc._id.toString() }) : null;
  }

  async listDisputes(): Promise<DeliveryDispute[]> {
    await this.ensureConnected();
    const docs = await DeliveryDisputeModel.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .lean();
    return docs.map((d: any) => mapToDomainDispute({ ...d, id: d._id.toString() }));
  }

  // Escalations Helpers
  async createEscalation(data: any): Promise<LogisticsEscalation> {
    await this.ensureConnected();
    const doc = await LogisticsEscalationModel.create(data);
    return mapToDomainEscalation({ ...doc.toObject(), id: doc._id.toString() });
  }

  async listEscalations(): Promise<LogisticsEscalation[]> {
    await this.ensureConnected();
    const docs = await LogisticsEscalationModel.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .lean();
    return docs.map((d: any) => mapToDomainEscalation({ ...d, id: d._id.toString() }));
  }
}

export default DeliveryDisputeRepository;
