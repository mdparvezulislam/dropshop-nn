import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { ExchangeModel } from "./exchange-model";
import type { ExchangeEntity, ExchangeStatus } from "../domain/exchange-entity";
import type { BaseDocument } from "@/shared/lib/database/types";

export interface ExchangeDocument extends BaseDocument {
  exchangeNumber: string;
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
  }>;
  reason: string;
  customerNote?: string;
  internalNote?: string;
  rejectionReason?: string;
  pickupAddress?: string;
  pickupDate?: Date;
  replacementProductId?: string;
  replacementVariantSku?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  requestedAt?: Date;
  approvedAt?: Date;
  completedAt?: Date;
  requestedBy?: string;
  approvedBy?: string;
}

function toDomain(doc: any): ExchangeEntity {
  return {
    id: doc.id ?? doc._id.toString(),
    exchangeNumber: doc.exchangeNumber,
    orderId: doc.orderId,
    orderNumber: doc.orderNumber,
    status: doc.status ?? "requested",
    previousStatuses: doc.previousStatuses || [],
    items: doc.items || [],
    reason: doc.reason,
    customerNote: doc.customerNote,
    internalNote: doc.internalNote,
    rejectionReason: doc.rejectionReason,
    pickupAddress: doc.pickupAddress,
    pickupDate: doc.pickupDate,
    replacementProductId: doc.replacementProductId,
    replacementVariantSku: doc.replacementVariantSku,
    trackingNumber: doc.trackingNumber,
    trackingUrl: doc.trackingUrl,
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

export class ExchangeRepository extends BaseRepository<ExchangeDocument, ExchangeEntity> {
  constructor() {
    super(ExchangeModel as any, toDomain);
  }

  async findByOrder(orderId: string): Promise<ExchangeEntity[]> {
    return this.find({ orderId }, { sort: { createdAt: -1 } } as any);
  }

  async findByExchangeNumber(exchangeNumber: string): Promise<ExchangeEntity | null> {
    return this.findOne({ exchangeNumber });
  }

  async findByStatus(status: ExchangeStatus): Promise<ExchangeEntity[]> {
    return this.find({ status });
  }

  async updateStatus(id: string, status: ExchangeStatus): Promise<ExchangeEntity> {
    return this.update(id, { status } as any);
  }

  async countByStatus(): Promise<Record<string, number>> {
    const pipeline = [{ $group: { _id: "$status", count: { $sum: 1 } } }];
    const results = await (ExchangeModel as any).aggregate(pipeline);
    const counts: Record<string, number> = {};
    for (const r of results) {
      counts[r._id] = r.count;
    }
    return counts;
  }
}

export default ExchangeRepository;
