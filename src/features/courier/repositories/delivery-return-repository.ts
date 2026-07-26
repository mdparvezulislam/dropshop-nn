import { BaseRepository } from "@/lib/database/generic-repository";
import { DeliveryReturnModel, RTSRecordModel } from "./delivery-return-model";
import type { DeliveryReturn, RTSRecord } from "../domain/delivery-return-entity";
import type { BaseDocument } from "@/lib/database/types";

interface DeliveryReturnDocument extends BaseDocument {
  returnNumber: string;
  shipmentId: string;
  orderId: string;
  trackingCode: string;
  reason: any;
  status: any;
  returnChargeCents: number;
  initiatedBy: string;
  notes?: string;
  receivedAt?: Date;
  completedAt?: Date;
}

function mapToDomainReturn(doc: any): DeliveryReturn {
  return {
    id: doc.id ?? doc._id?.toString(),
    returnNumber: doc.returnNumber,
    shipmentId: doc.shipmentId,
    orderId: doc.orderId,
    trackingCode: doc.trackingCode,
    reason: doc.reason,
    status: doc.status || "return_initiated",
    returnChargeCents: doc.returnChargeCents ?? 0,
    initiatedBy: doc.initiatedBy,
    notes: doc.notes,
    receivedAt: doc.receivedAt,
    completedAt: doc.completedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted ?? false,
    metadata: doc.metadata,
  };
}

function mapToDomainRTS(doc: any): RTSRecord {
  return {
    id: doc.id ?? doc._id?.toString(),
    rtsNumber: doc.rtsNumber,
    shipmentId: doc.shipmentId,
    orderId: doc.orderId,
    reason: doc.reason,
    status: doc.status || "rts_created",
    inspectionCondition: doc.inspectionCondition,
    inspectorNotes: doc.inspectorNotes,
    receivedAt: doc.receivedAt,
    completedAt: doc.completedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted ?? false,
    metadata: doc.metadata,
  };
}

export class DeliveryReturnRepository extends BaseRepository<
  DeliveryReturnDocument,
  DeliveryReturn
> {
  constructor() {
    super(DeliveryReturnModel as any, mapToDomainReturn);
  }

  async findByShipmentId(shipmentId: string): Promise<DeliveryReturn | null> {
    await this.ensureConnected();
    const doc = await DeliveryReturnModel.findOne({ shipmentId, isDeleted: { $ne: true } }).lean();
    return doc ? mapToDomainReturn({ ...doc, id: doc._id.toString() }) : null;
  }

  async listReturns(): Promise<DeliveryReturn[]> {
    await this.ensureConnected();
    const docs = await DeliveryReturnModel.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .lean();
    return docs.map((d: any) => mapToDomainReturn({ ...d, id: d._id.toString() }));
  }

  // RTS Helpers
  async findRTSByShipmentId(shipmentId: string): Promise<RTSRecord | null> {
    await this.ensureConnected();
    const doc = await RTSRecordModel.findOne({ shipmentId, isDeleted: { $ne: true } }).lean();
    return doc ? mapToDomainRTS({ ...doc, id: doc._id.toString() }) : null;
  }

  async createRTS(data: any): Promise<RTSRecord> {
    await this.ensureConnected();
    const doc = await RTSRecordModel.create(data);
    return mapToDomainRTS({ ...doc.toObject(), id: doc._id.toString() });
  }

  async updateRTS(id: string, data: any): Promise<RTSRecord> {
    await this.ensureConnected();
    const doc = await RTSRecordModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    return mapToDomainRTS({ ...doc, id: doc._id.toString() });
  }

  async listRTS(): Promise<RTSRecord[]> {
    await this.ensureConnected();
    const docs = await RTSRecordModel.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .lean();
    return docs.map((d: any) => mapToDomainRTS({ ...d, id: d._id.toString() }));
  }
}

export default DeliveryReturnRepository;
