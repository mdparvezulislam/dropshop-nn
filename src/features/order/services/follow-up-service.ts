import { FollowUpRepository } from "../repositories/follow-up-repository";
import { OrderRepository } from "../repositories/order-repository";
import { OrderTimelineService } from "./order-timeline-service";
import { EventBus } from "@/lib/event-bus";
import { NotFoundError, ValidationError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";
import { runInTransaction } from "@/lib/database/query-builder";
import type { FollowUpReminder } from "../domain/follow-up-entity";
import type { z } from "zod";
import type { createFollowUpSchema, updateFollowUpStatusSchema } from "../types/validation";

type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>;
type UpdateFollowUpStatusInput = z.infer<typeof updateFollowUpStatusSchema>;

export interface FollowUpStats {
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  overdueCount: number;
  todayCount: number;
  total: number;
}

export class FollowUpService {
  private readonly followUpRepository: FollowUpRepository;
  private readonly orderRepository: OrderRepository;
  private readonly timelineService: OrderTimelineService;

  constructor() {
    this.followUpRepository = new FollowUpRepository();
    this.orderRepository = new OrderRepository();
    this.timelineService = new OrderTimelineService();
  }

  async create(
    input: CreateFollowUpInput,
    actor?: { id: string; name?: string; role?: string },
  ): Promise<FollowUpReminder> {
    return runInTransaction(async () => {
      const order = await this.orderRepository.findById(input.orderId);
      if (!order) throw new NotFoundError("Order not found");

      const followUp = await this.followUpRepository.create({
        orderId: input.orderId,
        orderNumber: order.orderNumber,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        type: input.type,
        title: input.title,
        description: input.description,
        priority: input.priority ?? "normal",
        assignedTo: input.assignedTo,
        assignedToName: input.assignedToName,
        dueDate: new Date(input.dueDate),
        isRecurring: input.isRecurring ?? false,
        recurringInterval: input.recurringInterval,
        status: "pending",
      } as any);

      await this.timelineService.addEntry({
        entityType: "order",
        entityId: input.orderId,
        eventType: "order.system_action",
        action: "order.system_action",
        summary: `Follow-up "${input.title}" created for ${input.customerName}, due ${new Date(input.dueDate).toLocaleDateString()}`,
        actor,
      });

      await EventBus.publish(
        "order.follow_up_created",
        {
          followUpId: followUp.id,
          orderId: input.orderId,
          orderNumber: order.orderNumber,
          type: input.type,
          title: input.title,
          dueDate: input.dueDate,
        },
        { source: "order" },
      );

      return followUp;
    });
  }

  async updateStatus(
    followUpId: string,
    status: string,
    actor?: { id: string; name?: string; role?: string },
  ): Promise<FollowUpReminder> {
    const followUp = await this.followUpRepository.findById(followUpId);
    if (!followUp) throw new NotFoundError("Follow-up not found");

    const now = new Date();
    const updates: Record<string, unknown> = { status };

    if (status === "completed") {
      updates.completedAt = now;
      updates.completedBy = actor?.id;
    }

    const updated = await this.followUpRepository.update(followUpId, updates as any);

    await this.timelineService.addEntry({
      entityType: "order",
      entityId: followUp.orderId,
      eventType: "order.system_action",
      action: "order.system_action",
      summary: `Follow-up "${followUp.title}" ${status}`,
      actor,
    });

    if (status === "completed" && followUp.isRecurring && followUp.recurringInterval) {
      const nextDue = this.calculateNextDue(followUp.dueDate, followUp.recurringInterval);
      await this.followUpRepository.create({
        orderId: followUp.orderId,
        orderNumber: followUp.orderNumber,
        customerName: followUp.customerName,
        customerPhone: followUp.customerPhone,
        type: followUp.type,
        title: followUp.title,
        description: followUp.description,
        priority: followUp.priority,
        assignedTo: followUp.assignedTo,
        assignedToName: followUp.assignedToName,
        dueDate: nextDue,
        isRecurring: true,
        recurringInterval: followUp.recurringInterval,
        status: "pending",
      } as any);
    }

    return updated;
  }

  async assign(
    followUpId: string,
    staffId: string,
    staffName: string,
    actor?: { id: string; name?: string; role?: string },
  ): Promise<FollowUpReminder> {
    const followUp = await this.followUpRepository.findById(followUpId);
    if (!followUp) throw new NotFoundError("Follow-up not found");

    const updated = await this.followUpRepository.update(followUpId, {
      assignedTo: staffId,
      assignedToName: staffName,
    } as any);

    await this.timelineService.addEntry({
      entityType: "order",
      entityId: followUp.orderId,
      eventType: "order.system_action",
      action: "order.system_action",
      summary: `Follow-up "${followUp.title}" assigned to ${staffName}`,
      actor,
    });

    return updated;
  }

  async getByOrder(orderId: string): Promise<FollowUpReminder[]> {
    return this.followUpRepository.findByOrder(orderId);
  }

  async listAll(
    page: number = 1,
    limit: number = 20,
    status?: string,
    priority?: string,
    assigneeId?: string,
    type?: string,
  ): Promise<{ items: FollowUpReminder[]; total: number }> {
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assigneeId) filter.assignedTo = assigneeId;
    if (type) filter.type = type;

    const result = await this.followUpRepository.findPaginated(filter, { page, limit }, {
      dueDate: 1,
    } as any);
    return { items: result.items, total: result.totalCount };
  }

  async getOverdue(): Promise<FollowUpReminder[]> {
    return this.followUpRepository.findOverdue();
  }

  async getDueToday(): Promise<FollowUpReminder[]> {
    return this.followUpRepository.findDueToday();
  }

  async getStats(): Promise<FollowUpStats> {
    const byStatus = await this.followUpRepository.countByStatus();
    const byPriority = await this.followUpRepository.countByPriority();
    const overdue = await this.followUpRepository.findOverdue();
    const dueToday = await this.followUpRepository.findDueToday();
    const total = Object.values(byStatus).reduce((a, b) => a + b, 0);

    return {
      byStatus,
      byPriority,
      overdueCount: overdue.length,
      todayCount: dueToday.length,
      total,
    };
  }

  private calculateNextDue(current: Date, interval: string): Date {
    const next = new Date(current);
    switch (interval) {
      case "daily":
        next.setDate(next.getDate() + 1);
        break;
      case "weekly":
        next.setDate(next.getDate() + 7);
        break;
      case "monthly":
        next.setMonth(next.getMonth() + 1);
        break;
    }
    return next;
  }
}

export default FollowUpService;
