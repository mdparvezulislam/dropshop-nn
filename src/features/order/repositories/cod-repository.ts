import { BaseRepository } from "@/lib/database/generic-repository";
import { CodReconciliationModel } from "./cod-model";
import type { CodReconciliation, CodSettlementStatus } from "../domain/cod-entity";
import type { BaseDocument } from "@/lib/database/types";

export interface CodReconciliationDocument extends BaseDocument {
  orderId: string;
  orderNumber: string;
  courierName: string;
  trackingNumber: string;
  expectedAmount: number;
  receivedAmount: number;
  difference: number;
  settlementStatus: string;
  settlementDate?: Date;
  notes?: string;
  reconciledAt?: Date;
  reconciledBy?: string;
}

function toDomain(doc: any): CodReconciliation {
  return {
    id: doc.id ?? doc._id.toString(),
    orderId: doc.orderId,
    orderNumber: doc.orderNumber,
    courierName: doc.courierName,
    trackingNumber: doc.trackingNumber,
    expectedAmount: doc.expectedAmount,
    receivedAmount: doc.receivedAmount,
    difference: doc.difference,
    settlementStatus: doc.settlementStatus ?? "pending",
    settlementDate: doc.settlementDate,
    notes: doc.notes,
    reconciledAt: doc.reconciledAt,
    reconciledBy: doc.reconciledBy,
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

export class CodRepository extends BaseRepository<CodReconciliationDocument, CodReconciliation> {
  constructor() {
    super(CodReconciliationModel as any, toDomain);
  }

  async findByOrder(orderId: string): Promise<CodReconciliation[]> {
    return this.find({ orderId }, { sort: { createdAt: -1 } } as any);
  }

  async findByStatus(status: CodSettlementStatus): Promise<CodReconciliation[]> {
    return this.find({ settlementStatus: status } as any);
  }

  async countByStatus(): Promise<Record<string, number>> {
    const pipeline = [{ $group: { _id: "$settlementStatus", count: { $sum: 1 } } }];
    const results = await (CodReconciliationModel as any).aggregate(pipeline);
    const counts: Record<string, number> = {};
    for (const r of results) {
      counts[r._id] = r.count;
    }
    return counts;
  }

  async findMismatched(): Promise<CodReconciliation[]> {
    return this.find({ $expr: { $ne: ["$expectedAmount", "$receivedAmount"] } } as any);
  }

  async findPending(): Promise<CodReconciliation[]> {
    return this.find({ settlementStatus: "pending" } as any);
  }
}

export default CodRepository;
