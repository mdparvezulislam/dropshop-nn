import { BaseRepository } from "@/lib/database/generic-repository";
import { ComplaintModel } from "./complaint-model";
import type { CustomerComplaint } from "../domain/complaint-entity";
import type { BaseDocument } from "@/lib/database/types";

export interface ComplaintDocument extends BaseDocument {
  complaintNumber: string;
  orderId: string;
  orderNumber?: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  type: string;
  description: string;
  status: string;
  priority: string;
  assignedTo?: string;
  assignedToName?: string;
  resolution?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  internalNote?: string;
  timeline: Array<{
    id: string;
    eventType: string;
    summary: string;
    actorId?: string;
    actorName?: string;
    timestamp: Date;
  }>;
}

function toDomain(doc: any): CustomerComplaint {
  return {
    id: doc.id ?? doc._id.toString(),
    complaintNumber: doc.complaintNumber,
    orderId: doc.orderId,
    orderNumber: doc.orderNumber,
    customerId: doc.customerId,
    customerName: doc.customerName,
    customerPhone: doc.customerPhone,
    type: doc.type,
    description: doc.description,
    status: doc.status ?? "open",
    priority: doc.priority ?? "normal",
    assignedTo: doc.assignedTo,
    assignedToName: doc.assignedToName,
    resolution: doc.resolution,
    resolvedAt: doc.resolvedAt,
    resolvedBy: doc.resolvedBy,
    internalNote: doc.internalNote,
    timeline: doc.timeline || [],
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted,
    metadata: doc.metadata,
  };
}

export class ComplaintRepository extends BaseRepository<ComplaintDocument, CustomerComplaint> {
  constructor() {
    super(ComplaintModel as any, toDomain);
  }

  async findByOrder(orderId: string): Promise<CustomerComplaint[]> {
    return this.find({ orderId }, { sort: { createdAt: -1 } } as any);
  }

  async findByStatus(status: string): Promise<CustomerComplaint[]> {
    return this.find({ status });
  }

  async findByAssignee(assigneeId: string): Promise<CustomerComplaint[]> {
    return this.find({ assignedTo: assigneeId });
  }

  async findByType(type: string): Promise<CustomerComplaint[]> {
    return this.find({ type });
  }

  async countByStatus(): Promise<Record<string, number>> {
    const pipeline = [{ $group: { _id: "$status", count: { $sum: 1 } } }];
    const results = await (ComplaintModel as any).aggregate(pipeline);
    const counts: Record<string, number> = {};
    for (const r of results) {
      counts[r._id] = r.count;
    }
    return counts;
  }

  async search(query: string): Promise<CustomerComplaint[]> {
    const regex = new RegExp(query, "i");
    return this.find({
      $or: [
        { complaintNumber: regex },
        { customerName: regex },
        { customerPhone: regex },
        { orderNumber: regex },
        { description: regex },
      ],
    });
  }
}

export default ComplaintRepository;
