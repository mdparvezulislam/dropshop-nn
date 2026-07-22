import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { WarrantyModel } from "./warranty-model";
import type { WarrantyEntity, WarrantyStatus } from "../domain/warranty-entity";
import type { BaseDocument } from "@/shared/lib/database/types";

export interface WarrantyDocument extends BaseDocument {
  warrantyNumber: string;
  orderId: string;
  orderNumber: string;
  status: string;
  previousStatuses: string[];
  productId: string;
  productName: string;
  variantSku?: string;
  issue: string;
  customerNote?: string;
  internalNote?: string;
  resolution?: string;
  rejectionReason?: string;
  repairNotes?: string;
  replacementProductId?: string;
  requestedAt?: Date;
  approvedAt?: Date;
  completedAt?: Date;
  requestedBy?: string;
  approvedBy?: string;
}

function toDomain(doc: any): WarrantyEntity {
  return {
    id: doc.id ?? doc._id.toString(),
    warrantyNumber: doc.warrantyNumber,
    orderId: doc.orderId,
    orderNumber: doc.orderNumber,
    status: doc.status ?? "requested",
    previousStatuses: doc.previousStatuses || [],
    productId: doc.productId,
    productName: doc.productName,
    variantSku: doc.variantSku,
    issue: doc.issue,
    customerNote: doc.customerNote,
    internalNote: doc.internalNote,
    resolution: doc.resolution,
    rejectionReason: doc.rejectionReason,
    repairNotes: doc.repairNotes,
    replacementProductId: doc.replacementProductId,
    requestedAt: doc.requestedAt,
    approvedAt: doc.approvedAt,
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

export class WarrantyRepository extends BaseRepository<WarrantyDocument, WarrantyEntity> {
  constructor() {
    super(WarrantyModel as any, toDomain);
  }

  async findByOrder(orderId: string): Promise<WarrantyEntity[]> {
    return this.find({ orderId }, { sort: { createdAt: -1 } } as any);
  }

  async findByWarrantyNumber(warrantyNumber: string): Promise<WarrantyEntity | null> {
    return this.findOne({ warrantyNumber });
  }

  async findByStatus(status: WarrantyStatus): Promise<WarrantyEntity[]> {
    return this.find({ status });
  }

  async updateStatus(id: string, status: WarrantyStatus): Promise<WarrantyEntity> {
    return this.update(id, { status } as any);
  }

  async countByStatus(): Promise<Record<string, number>> {
    const pipeline = [{ $group: { _id: "$status", count: { $sum: 1 } } }];
    const results = await (WarrantyModel as any).aggregate(pipeline);
    const counts: Record<string, number> = {};
    for (const r of results) {
      counts[r._id] = r.count;
    }
    return counts;
  }
}

export default WarrantyRepository;
