import { BaseRepository } from "@/lib/database/generic-repository";
import { FailedDeliveryModel } from "./failed-delivery-model";
import type { FailedDelivery } from "../domain/failed-delivery-entity";
import type { BaseDocument } from "@/lib/database/types";

export interface FailedDeliveryDocument extends BaseDocument {
  orderId: string;
  orderNumber?: string;
  courierName: string;
  trackingNumber: string;
  reason: string;
  attemptCount: number;
  customerResponse?: string;
  nextAction: string;
  notes?: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

function toDomain(doc: any): FailedDelivery {
  return {
    id: doc.id ?? doc._id.toString(),
    orderId: doc.orderId,
    orderNumber: doc.orderNumber,
    courierName: doc.courierName,
    trackingNumber: doc.trackingNumber,
    reason: doc.reason,
    attemptCount: doc.attemptCount ?? 1,
    customerResponse: doc.customerResponse,
    nextAction: doc.nextAction,
    notes: doc.notes,
    resolved: doc.resolved ?? false,
    resolvedAt: doc.resolvedAt,
    resolvedBy: doc.resolvedBy,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted,
    status: doc.status ?? "active",
    metadata: doc.metadata,
  };
}

export class FailedDeliveryRepository extends BaseRepository<FailedDeliveryDocument, FailedDelivery> {
  constructor() {
    super(FailedDeliveryModel as any, toDomain);
  }

  async findByOrder(orderId: string): Promise<FailedDelivery[]> {
    return this.find({ orderId }, { sort: { createdAt: -1 } } as any);
  }

  async findUnresolved(): Promise<FailedDelivery[]> {
    return this.find({ resolved: false }, { sort: { createdAt: -1 } } as any);
  }

  async findByCourier(courierName: string): Promise<FailedDelivery[]> {
    return this.find({ courierName }, { sort: { createdAt: -1 } } as any);
  }

  async countByReason(): Promise<Record<string, number>> {
    const pipeline = [{ $group: { _id: "$reason", count: { $sum: 1 } } }];
    const results = await (FailedDeliveryModel as any).aggregate(pipeline);
    const counts: Record<string, number> = {};
    for (const r of results) {
      counts[r._id] = r.count;
    }
    return counts;
  }

  async countByAction(): Promise<Record<string, number>> {
    const pipeline = [{ $group: { _id: "$nextAction", count: { $sum: 1 } } }];
    const results = await (FailedDeliveryModel as any).aggregate(pipeline);
    const counts: Record<string, number> = {};
    for (const r of results) {
      counts[r._id] = r.count;
    }
    return counts;
  }
}

export default FailedDeliveryRepository;
