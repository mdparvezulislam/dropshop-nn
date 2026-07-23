import { BaseRepository } from "@/lib/database/generic-repository";
import { DeliveryAttemptModel } from "./delivery-attempt-model";
import type { DeliveryAttempt } from "../domain/delivery-attempt-entity";
import type { BaseDocument } from "@/lib/database/types";

interface DeliveryAttemptDocument extends BaseDocument {
  shipmentId: string;
  orderId: string;
  attemptNumber: number;
  courier: string;
  deliveryAgent?: { name?: string; phone?: string; agentId?: string };
  attemptTime: Date;
  status: any;
  failureReason?: any;
  customerResponse?: string;
  notes?: string;
}

function mapToDomain(doc: any): DeliveryAttempt {
  return {
    id: doc.id ?? doc._id?.toString(),
    shipmentId: doc.shipmentId,
    orderId: doc.orderId,
    attemptNumber: doc.attemptNumber,
    courier: doc.courier,
    deliveryAgent: doc.deliveryAgent,
    attemptTime: doc.attemptTime,
    status: doc.status || "attempted",
    failureReason: doc.failureReason,
    customerResponse: doc.customerResponse,
    notes: doc.notes,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted ?? false,
    metadata: doc.metadata,
  };
}

export class DeliveryAttemptRepository extends BaseRepository<DeliveryAttemptDocument, DeliveryAttempt> {
  constructor() {
    super(DeliveryAttemptModel as any, mapToDomain);
  }

  async findByShipmentId(shipmentId: string): Promise<DeliveryAttempt[]> {
    await this.ensureConnected();
    const docs = await DeliveryAttemptModel.find({ shipmentId, isDeleted: { $ne: true } })
      .sort({ attemptNumber: 1 })
      .lean();
    return docs.map((d: any) => mapToDomain({ ...d, id: d._id.toString() }));
  }
}

export default DeliveryAttemptRepository;
