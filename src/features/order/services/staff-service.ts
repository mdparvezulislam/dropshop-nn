import {
  StaffRepository,
  type StaffAssignmentEntity,
  type StaffRole,
} from "../repositories/staff-repository";
import { OrderRepository } from "../repositories/order-repository";
import { OrderTimelineService } from "./order-timeline-service";
import { NotFoundError } from "@/shared/errors/app-error";
import { runInTransaction } from "@/shared/lib/database/query-builder";
import type { PaginatedResult } from "@/shared/types";
import type { z } from "zod";
import type { assignStaffSchema } from "../types/validation";

type AssignStaffInput = z.infer<typeof assignStaffSchema>;

export interface StaffStats {
  total: number;
  active: number;
  completed: number;
  byRole: Record<string, number>;
}

export class StaffService {
  private readonly staffRepository: StaffRepository;
  private readonly orderRepository: OrderRepository;
  private readonly timelineService: OrderTimelineService;

  constructor() {
    this.staffRepository = new StaffRepository();
    this.orderRepository = new OrderRepository();
    this.timelineService = new OrderTimelineService();
  }

  async assign(
    input: AssignStaffInput,
    actor?: { id: string; name?: string; role?: string },
  ): Promise<StaffAssignmentEntity> {
    return runInTransaction(async () => {
      const order = await this.orderRepository.findById(input.orderId);
      if (!order) throw new NotFoundError("Order not found");

      const assignment = await this.staffRepository.create({
        orderId: input.orderId,
        orderNumber: order.orderNumber,
        staffId: input.staffId,
        staffName: input.staffName,
        role: input.role,
        assignedBy: actor?.id ?? "system",
        assignedAt: new Date(),
        notes: input.notes,
      } as any);

      await this.timelineService.addEntry({
        entityType: "order",
        entityId: input.orderId,
        eventType: "order.system_action",
        action: "order.system_action",
        summary: `Staff ${input.staffName} assigned as ${input.role}`,
        actor,
      });

      return assignment;
    });
  }

  async complete(
    assignmentId: string,
    actor?: { id: string; name?: string; role?: string },
  ): Promise<StaffAssignmentEntity> {
    const assignment = await this.staffRepository.findById(assignmentId);
    if (!assignment) throw new NotFoundError("Staff assignment not found");

    const updated = await this.staffRepository.update(assignmentId, {
      completedAt: new Date(),
    } as any);

    await this.timelineService.addEntry({
      entityType: "order",
      entityId: assignment.orderId,
      eventType: "order.system_action",
      action: "order.system_action",
      summary: `Staff ${assignment.staffName} completed ${assignment.role} duty`,
      actor,
    });

    return updated;
  }

  async getOrderAssignments(orderId: string): Promise<StaffAssignmentEntity[]> {
    return this.staffRepository.findByOrder(orderId);
  }

  async getActiveByRole(role: StaffRole): Promise<StaffAssignmentEntity[]> {
    return this.staffRepository.find({ role, completedAt: null } as any);
  }

  async listAll(
    page: number = 1,
    limit: number = 50,
    role?: StaffRole,
  ): Promise<PaginatedResult<StaffAssignmentEntity>> {
    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    return this.staffRepository.findPaginated(
      filter,
      { page, limit },
      { sortBy: "assignedAt", sortOrder: "desc" },
    );
  }

  async getStats(): Promise<StaffStats> {
    const total = await this.staffRepository.count({});
    const active = await this.staffRepository.count({ completedAt: null });
    const completed = await this.staffRepository.count({
      completedAt: { $ne: null },
    });

    const pipeline = [
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ];
    const results = await (
      this.staffRepository as any
    ).model.aggregate(pipeline);
    const byRole: Record<string, number> = {};
    for (const r of results) {
      byRole[r._id] = r.count;
    }

    return { total, active, completed, byRole };
  }
}

export default StaffService;
