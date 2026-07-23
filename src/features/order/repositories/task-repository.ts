import { BaseRepository } from "@/lib/database/generic-repository";
import { TaskModel } from "./task-model";
import type { BaseDocument } from "@/lib/database/types";

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
  mentions?: string[];
}

export type TaskStatus = "open" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "normal" | "high" | "urgent";

export interface TaskDocument extends BaseDocument {
  orderId: string;
  orderNumber: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  assignedTo?: string;
  assignedToName?: string;
  dueDate?: Date;
  completedAt?: Date;
  checklist: ChecklistItem[];
  comments: TaskComment[];
}

export interface TaskEntity {
  id: string;
  orderId: string;
  orderNumber: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  assignedTo?: string;
  assignedToName?: string;
  dueDate?: Date;
  completedAt?: Date;
  checklist: ChecklistItem[];
  comments: TaskComment[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date;
  isDeleted: boolean;
  status: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

function toDomain(doc: any): TaskEntity {
  return {
    id: doc.id ?? doc._id.toString(),
    orderId: doc.orderId,
    orderNumber: doc.orderNumber,
    title: doc.title,
    description: doc.description,
    priority: doc.priority ?? "normal",
    status: doc.status ?? "active",
    assignedTo: doc.assignedTo,
    assignedToName: doc.assignedToName,
    dueDate: doc.dueDate,
    completedAt: doc.completedAt,
    checklist: doc.checklist || [],
    comments: doc.comments || [],
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted,
    metadata: doc.metadata,
  };
}

export class TaskRepository extends BaseRepository<TaskDocument, TaskEntity> {
  constructor() {
    super(TaskModel as any, toDomain);
  }

  async findByOrder(orderId: string): Promise<TaskEntity[]> {
    return this.find({ orderId }, { sort: { createdAt: -1 } } as any);
  }

  async findByAssignee(
    assigneeId: string,
    status?: TaskStatus,
  ): Promise<TaskEntity[]> {
    const filter: Record<string, unknown> = { assignedTo: assigneeId };
    if (status) filter.status = status;
    return this.find(filter, { sort: { createdAt: -1 } } as any);
  }

  async findOverdue(): Promise<TaskEntity[]> {
    const now = new Date();
    return this.find({
      dueDate: { $lt: now },
      status: { $in: ["open", "in_progress"] },
    } as any);
  }

  async countByStatus(): Promise<Record<string, number>> {
    const pipeline = [{ $group: { _id: "$status", count: { $sum: 1 } } }];
    const results = await (TaskModel as any).aggregate(pipeline);
    const counts: Record<string, number> = {};
    for (const r of results) {
      counts[r._id] = r.count;
    }
    return counts;
  }
}

export default TaskRepository;
