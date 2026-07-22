import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { ReturnModel } from "./return-model";
import type { ReturnEntity, ReturnStatus } from "../domain/return-entity";
import type { BaseDocument } from "@/shared/lib/database/types";

export interface ReturnDocument extends BaseDocument {
  returnNumber: string;
  orderId: string;
  orderNumber: string;
  status: string;
  previousStatuses: string[];
  items: Array<{
    productId: string;
    variantSku?: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    reason?: string;
  }>;
  reason: string;
  customerNote?: string;
  internalNote?: string;
  inspectionNotes?: string;
  rejectionReason?: string;
  refundAmount?: number;
  refundedAt?: Date;
  requestedAt?: Date;
  approvedAt?: Date;
  receivedAt?: Date;
  completedAt?: Date;
  requestedBy?: string;
  approvedBy?: string;
}

function toDomain(doc: any): ReturnEntity {
  return {
    id: doc.id ?? doc._id.toString(),
    returnNumber: doc.returnNumber,
    orderId: doc.orderId,
    orderNumber: doc.orderNumber,
    status: doc.status ?? "requested",
    previousStatuses: doc.previousStatuses || [],
    items: doc.items || [],
    reason: doc.reason,
    customerNote: doc.customerNote,
    internalNote: doc.internalNote,
    inspectionNotes: doc.inspectionNotes,
    rejectionReason: doc.rejectionReason,
    refundAmount: doc.refundAmount,
    refundedAt: doc.refundedAt,
    requestedAt: doc.requestedAt,
    approvedAt: doc.approvedAt,
    receivedAt: doc.receivedAt,
    completedAt: doc.completedAt,
    requestedBy: doc.requestedBy,
    approvedBy: doc.approvedBy,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted,
    metadata: doc.metadata,
  };
}

export class ReturnRepository extends BaseRepository<ReturnDocument, ReturnEntity> {
  constructor() {
    super(ReturnModel as any, toDomain);
  }

  async findByOrder(orderId: string): Promise<ReturnEntity[]> {
    return this.find({ orderId }, { sort: { createdAt: -1 } } as any);
  }

  async findByReturnNumber(returnNumber: string): Promise<ReturnEntity | null> {
    return this.findOne({ returnNumber });
  }

  async findByStatus(status: ReturnStatus): Promise<ReturnEntity[]> {
    return this.find({ status });
  }

  async updateStatus(id: string, status: ReturnStatus): Promise<ReturnEntity> {
    return this.update(id, { status } as any);
  }

  async countByStatus(): Promise<Record<string, number>> {
    const pipeline = [{ $group: { _id: "$status", count: { $sum: 1 } } }];
    const results = await (ReturnModel as any).aggregate(pipeline);
    const counts: Record<string, number> = {};
    for (const r of results) {
      counts[r._id] = r.count;
    }
    return counts;
  }
}

export default ReturnRepository;
