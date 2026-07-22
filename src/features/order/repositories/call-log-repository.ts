import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { CallLogModel } from "./call-log-model";
import type { CallLogEntry } from "../domain/call-log-entity";
import type { BaseDocument } from "@/shared/lib/database/types";

export interface CallLogDocument extends BaseDocument {
  orderId: string;
  orderNumber?: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  staffId: string;
  staffName: string;
  duration: number;
  outcome: string;
  notes?: string;
  nextFollowUpAt?: Date;
  callTime: Date;
}

function toDomain(doc: any): CallLogEntry {
  return {
    id: doc.id ?? doc._id.toString(),
    orderId: doc.orderId,
    orderNumber: doc.orderNumber,
    customerId: doc.customerId,
    customerName: doc.customerName,
    customerPhone: doc.customerPhone,
    staffId: doc.staffId,
    staffName: doc.staffName,
    duration: doc.duration ?? 0,
    outcome: doc.outcome,
    notes: doc.notes,
    nextFollowUpAt: doc.nextFollowUpAt,
    callTime: doc.callTime,
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

export class CallLogRepository extends BaseRepository<CallLogDocument, CallLogEntry> {
  constructor() {
    super(CallLogModel as any, toDomain);
  }

  async findByOrder(orderId: string): Promise<CallLogEntry[]> {
    return this.find({ orderId }, { sort: { callTime: -1 } } as any);
  }

  async findByStaff(staffId: string): Promise<CallLogEntry[]> {
    return this.find({ staffId }, { sort: { callTime: -1 } } as any);
  }

  async findByDateRange(start: Date, end: Date): Promise<CallLogEntry[]> {
    return this.find({ callTime: { $gte: start, $lte: end } }, { sort: { callTime: -1 } } as any);
  }

  async countByOutcome(): Promise<Record<string, number>> {
    const pipeline = [{ $group: { _id: "$outcome", count: { $sum: 1 } } }];
    const results = await (CallLogModel as any).aggregate(pipeline);
    const counts: Record<string, number> = {};
    for (const r of results) {
      counts[r._id] = r.count;
    }
    return counts;
  }
}

export default CallLogRepository;
