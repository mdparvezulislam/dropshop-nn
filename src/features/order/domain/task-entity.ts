import { BaseDBEntity } from "@/shared/lib/database/types";

export type TaskStatus = "open" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "normal" | "high" | "urgent";

export interface InternalTask extends BaseDBEntity {
  orderId: string;
  orderNumber: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  assignedToName?: string;
  createdBy: string;
  dueDate?: Date;
  completedAt?: Date;
  checklist: TaskChecklistItem[];
  comments: TaskComment[];
}

export interface TaskChecklistItem {
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

export const TASK_STATUSES: TaskStatus[] = ["open", "in_progress", "completed", "cancelled"];
export const TASK_PRIORITIES: TaskPriority[] = ["low", "normal", "high", "urgent"];
