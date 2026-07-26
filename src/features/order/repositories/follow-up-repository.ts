import { BaseRepository } from "@/lib/database/generic-repository";
import { FollowUpModel } from "./follow-up-model";
import type { FollowUpReminder } from "../domain/follow-up-entity";
import type { BaseDocument } from "@/lib/database/types";

export interface FollowUpDocument extends BaseDocument {
  orderId: string;
  orderNumber?: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  type: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignedTo?: string;
  assignedToName?: string;
  dueDate: Date;
  completedAt?: Date;
  completedBy?: string;
  notes?: string;
  isRecurring: boolean;
  recurringInterval?: string;
}

function toDomain(doc: any): FollowUpReminder {
  return {
    id: doc.id ?? doc._id.toString(),
    orderId: doc.orderId,
    orderNumber: doc.orderNumber,
    customerId: doc.customerId,
    customerName: doc.customerName,
    customerPhone: doc.customerPhone,
    type: doc.type,
    title: doc.title,
    description: doc.description,
    status: doc.status ?? "pending",
    priority: doc.priority ?? "normal",
    assignedTo: doc.assignedTo,
    assignedToName: doc.assignedToName,
    dueDate: doc.dueDate,
    completedAt: doc.completedAt,
    completedBy: doc.completedBy,
    notes: doc.notes,
    isRecurring: doc.isRecurring ?? false,
    recurringInterval: doc.recurringInterval,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted,
    metadata: doc.metadata,
  };
}

export class FollowUpRepository extends BaseRepository<FollowUpDocument, FollowUpReminder> {
  constructor() {
    super(FollowUpModel as any, toDomain);
  }

  async findByOrder(orderId: string): Promise<FollowUpReminder[]> {
    return this.find({ orderId }, { sort: { dueDate: 1 } } as any);
  }

  async findByAssignee(assigneeId: string, status?: string): Promise<FollowUpReminder[]> {
    const filter: Record<string, unknown> = { assignedTo: assigneeId };
    if (status) filter.status = status;
    return this.find(filter, { sort: { dueDate: 1 } } as any);
  }

  async findOverdue(): Promise<FollowUpReminder[]> {
    return this.find({ status: "pending", dueDate: { $lt: new Date() } }, {
      sort: { dueDate: 1 },
    } as any);
  }

  async findDueToday(): Promise<FollowUpReminder[]> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return this.find({ status: "pending", dueDate: { $gte: start, $lte: end } }, {
      sort: { dueDate: 1 },
    } as any);
  }

  async findByDateRange(start: Date, end: Date): Promise<FollowUpReminder[]> {
    return this.find({ dueDate: { $gte: start, $lte: end } }, { sort: { dueDate: 1 } } as any);
  }

  async countByStatus(): Promise<Record<string, number>> {
    const pipeline = [{ $group: { _id: "$status", count: { $sum: 1 } } }];
    const results = await (FollowUpModel as any).aggregate(pipeline);
    const counts: Record<string, number> = {};
    for (const r of results) {
      counts[r._id] = r.count;
    }
    return counts;
  }

  async countByPriority(): Promise<Record<string, number>> {
    const pipeline = [{ $group: { _id: "$priority", count: { $sum: 1 } } }];
    const results = await (FollowUpModel as any).aggregate(pipeline);
    const counts: Record<string, number> = {};
    for (const r of results) {
      counts[r._id] = r.count;
    }
    return counts;
  }
}

export default FollowUpRepository;
