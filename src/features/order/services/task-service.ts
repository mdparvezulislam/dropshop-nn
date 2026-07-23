import {
  TaskRepository,
  type TaskEntity,
  type TaskStatus,
  type TaskPriority,
  type TaskComment,
  type ChecklistItem,
} from "../repositories/task-repository";
import { OrderRepository } from "../repositories/order-repository";
import { OrderTimelineService } from "./order-timeline-service";
import { NotFoundError, ValidationError } from "@/lib/errors/app-error";
import { runInTransaction } from "@/lib/database/query-builder";
import { generateUUID } from "@/lib/utils/id-utils";
import type { PaginatedResult } from "@/types";
import type { z } from "zod";
import type {
  createTaskSchema,
  updateTaskStatusSchema,
  addTaskCommentSchema,
} from "../types/validation";

type CreateTaskInput = z.infer<typeof createTaskSchema>;
type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
type AddTaskCommentInput = z.infer<typeof addTaskCommentSchema>;

export interface TaskStats {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  overdue: number;
  byPriority: Record<string, number>;
}

export class TaskService {
  private readonly taskRepository: TaskRepository;
  private readonly orderRepository: OrderRepository;
  private readonly timelineService: OrderTimelineService;

  constructor() {
    this.taskRepository = new TaskRepository();
    this.orderRepository = new OrderRepository();
    this.timelineService = new OrderTimelineService();
  }

  async create(
    input: CreateTaskInput,
    actor?: { id: string; name?: string; role?: string },
  ): Promise<TaskEntity> {
    return runInTransaction(async () => {
      const order = await this.orderRepository.findById(input.orderId);
      if (!order) throw new NotFoundError("Order not found");

      const task = await this.taskRepository.create({
        orderId: input.orderId,
        orderNumber: order.orderNumber,
        title: input.title,
        description: input.description,
        priority: input.priority ?? "normal",
        status: "open",
        assignedTo: input.assignedTo,
        assignedToName: input.assignedToName,
        createdBy: actor?.id ?? "system",
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        checklist: [],
        comments: [],
      } as any);

      await this.timelineService.addEntry({
        entityType: "order",
        entityId: input.orderId,
        eventType: "order.system_action",
        action: "order.system_action",
        summary: `Task created: ${input.title}`,
        actor,
      });

      return task;
    });
  }

  async updateStatus(
    taskId: string,
    status: TaskStatus,
    actor?: { id: string; name?: string; role?: string },
  ): Promise<TaskEntity> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) throw new NotFoundError("Task not found");

    const updates: Record<string, unknown> = { status };
    if (status === "completed") {
      updates.completedAt = new Date();
    }

    const updated = await this.taskRepository.update(taskId, updates as any);

    await this.timelineService.addEntry({
      entityType: "order",
      entityId: task.orderId,
      eventType: "order.system_action",
      action: "order.system_action",
      summary: `Task "${task.title}" status: ${task.status} → ${status}`,
      actor,
      changes: [
        { field: "taskStatus", oldValue: task.status, newValue: status },
      ],
    });

    return updated;
  }

  async addChecklistItem(
    taskId: string,
    text: string,
  ): Promise<TaskEntity> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) throw new NotFoundError("Task not found");

    const newItem: ChecklistItem = {
      id: generateUUID(),
      text,
      completed: false,
    };

    const checklist = [...task.checklist, newItem];
    return this.taskRepository.update(taskId, { checklist } as any);
  }

  async toggleChecklistItem(
    taskId: string,
    itemId: string,
  ): Promise<TaskEntity> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) throw new NotFoundError("Task not found");

    const checklist = task.checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item,
    );
    return this.taskRepository.update(taskId, { checklist } as any);
  }

  async addComment(
    taskId: string,
    input: AddTaskCommentInput,
    actor?: { id: string; name?: string; role?: string },
  ): Promise<TaskEntity> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) throw new NotFoundError("Task not found");

    const comment: TaskComment = {
      id: generateUUID(),
      authorId: actor?.id ?? "system",
      authorName: actor?.name ?? "System",
      content: input.content,
      createdAt: new Date(),
      mentions: input.mentions,
    };

    const comments = [...task.comments, comment];
    return this.taskRepository.update(taskId, { comments } as any);
  }

  async getOrderTasks(orderId: string): Promise<TaskEntity[]> {
    return this.taskRepository.findByOrder(orderId);
  }

  async listByAssignee(
    assigneeId: string,
    status?: TaskStatus,
  ): Promise<TaskEntity[]> {
    return this.taskRepository.findByAssignee(assigneeId, status);
  }

  async listAll(
    page: number = 1,
    limit: number = 50,
    status?: TaskStatus,
    priority?: TaskPriority,
  ): Promise<PaginatedResult<TaskEntity>> {
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    return this.taskRepository.findPaginated(
      filter,
      { page, limit },
      { sortBy: "createdAt", sortOrder: "desc" },
    );
  }

  async getStats(): Promise<TaskStats> {
    const byStatus = await this.taskRepository.countByStatus();
    const overdue = await this.taskRepository.findOverdue();

    const pipeline = [
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ];
    const results = await (this.taskRepository as any).model.aggregate(
      pipeline,
    );
    const byPriority: Record<string, number> = {};
    for (const r of results) {
      byPriority[r._id] = r.count;
    }

    return {
      total: Object.values(byStatus).reduce((a, b) => a + b, 0),
      open: byStatus["open"] ?? 0,
      inProgress: byStatus["in_progress"] ?? 0,
      completed: byStatus["completed"] ?? 0,
      cancelled: byStatus["cancelled"] ?? 0,
      overdue: overdue.length,
      byPriority,
    };
  }
}

export default TaskService;
