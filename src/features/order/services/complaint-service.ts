import { ComplaintRepository, type ComplaintDocument } from "../repositories/complaint-repository";
import { ComplaintModel } from "../repositories/complaint-model";
import { OrderRepository } from "../repositories/order-repository";
import { OrderTimelineService } from "./order-timeline-service";
import { COMPLAINT_VALID_TRANSITIONS, type CustomerComplaint } from "../domain/complaint-entity";
import { EventBus } from "@/lib/event-bus";
import { NotFoundError, ValidationError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";
import { runInTransaction } from "@/lib/database/query-builder";
import { generateUUID } from "@/lib/utils/id-utils";
import type { z } from "zod";
import type {
  createComplaintSchema,
  updateComplaintStatusSchema,
  assignComplaintSchema,
} from "../types/validation";

type CreateComplaintInput = z.infer<typeof createComplaintSchema>;
type UpdateComplaintStatusInput = z.infer<typeof updateComplaintStatusSchema>;
type AssignComplaintInput = z.infer<typeof assignComplaintSchema>;

export interface ComplaintStats {
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  total: number;
}

export class ComplaintService {
  private readonly complaintRepository: ComplaintRepository;
  private readonly orderRepository: OrderRepository;
  private readonly timelineService: OrderTimelineService;

  constructor() {
    this.complaintRepository = new ComplaintRepository();
    this.orderRepository = new OrderRepository();
    this.timelineService = new OrderTimelineService();
  }

  async create(
    input: CreateComplaintInput,
    actor?: { id: string; name?: string; role?: string },
  ): Promise<CustomerComplaint> {
    return runInTransaction(async () => {
      const order = await this.orderRepository.findById(input.orderId);
      if (!order) throw new NotFoundError("Order not found");

      const complaintNumber = `CMP-${Date.now().toString(36).toUpperCase()}`;
      const now = new Date();

      const complaint = await this.complaintRepository.create({
        complaintNumber,
        orderId: input.orderId,
        orderNumber: order.orderNumber,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        type: input.type,
        description: input.description,
        priority: input.priority ?? "normal",
        status: "open",
        timeline: [
          {
            id: generateUUID(),
            eventType: "complaint.created",
            summary: `Complaint ${complaintNumber} created: ${input.type}`,
            actorId: actor?.id,
            actorName: actor?.name,
            timestamp: now,
          },
        ],
      } as any);

      await this.timelineService.addEntry({
        entityType: "order",
        entityId: input.orderId,
        eventType: "order.system_action",
        action: "order.system_action",
        summary: `Complaint ${complaintNumber} filed: ${input.type} - ${input.description.substring(0, 100)}`,
        actor,
      });

      await EventBus.publish(
        "order.complaint_created",
        {
          complaintId: complaint.id,
          complaintNumber,
          orderId: input.orderId,
          orderNumber: order.orderNumber,
          type: input.type,
          priority: input.priority,
        },
        { source: "order" },
      );

      return complaint;
    });
  }

  async updateStatus(
    complaintId: string,
    status: string,
    resolution?: string,
    actor?: { id: string; name?: string; role?: string },
  ): Promise<CustomerComplaint> {
    const complaint = await this.complaintRepository.findById(complaintId);
    if (!complaint) throw new NotFoundError("Complaint not found");

    const fromStatus = complaint.status;
    if (fromStatus === status) {
      throw new ValidationError("Complaint is already in this status");
    }

    const validTransitions = COMPLAINT_VALID_TRANSITIONS[fromStatus] || [];
    if (!validTransitions.includes(status)) {
      throw new ValidationError(`Cannot transition complaint from ${fromStatus} to ${status}`);
    }

    const now = new Date();
    const updates: Record<string, unknown> = { status };
    if (status === "resolved" || status === "closed") {
      updates.resolvedAt = now;
      updates.resolvedBy = actor?.id;
    }
    if (resolution) updates.resolution = resolution;

    const timelineEntry = {
      id: generateUUID(),
      eventType: "complaint.status_changed",
      summary: `Status changed from ${fromStatus} to ${status}`,
      actorId: actor?.id,
      actorName: actor?.name,
      timestamp: now,
    };

    const updated = await this.complaintRepository.update(complaintId, {
      ...updates,
      timeline: [...complaint.timeline, timelineEntry],
    } as any);

    await this.timelineService.addEntry({
      entityType: "order",
      entityId: complaint.orderId,
      eventType: "order.system_action",
      action: "order.system_action",
      summary: `Complaint ${complaint.complaintNumber}: ${fromStatus} → ${status}`,
      actor,
      changes: [{ field: "complaintStatus", oldValue: fromStatus, newValue: status }],
    });

    return updated;
  }

  async assign(
    complaintId: string,
    staffId: string,
    staffName: string,
    actor?: { id: string; name?: string; role?: string },
  ): Promise<CustomerComplaint> {
    const complaint = await this.complaintRepository.findById(complaintId);
    if (!complaint) throw new NotFoundError("Complaint not found");

    const now = new Date();
    const timelineEntry = {
      id: generateUUID(),
      eventType: "complaint.assigned",
      summary: `Assigned to ${staffName}`,
      actorId: actor?.id,
      actorName: actor?.name,
      timestamp: now,
    };

    const updated = await this.complaintRepository.update(complaintId, {
      assignedTo: staffId,
      assignedToName: staffName,
      timeline: [...complaint.timeline, timelineEntry],
    } as any);

    await this.timelineService.addEntry({
      entityType: "order",
      entityId: complaint.orderId,
      eventType: "order.system_action",
      action: "order.system_action",
      summary: `Complaint ${complaint.complaintNumber} assigned to ${staffName}`,
      actor,
    });

    return updated;
  }

  async getComplaint(complaintId: string): Promise<CustomerComplaint | null> {
    return this.complaintRepository.findById(complaintId);
  }

  async listByOrder(orderId: string): Promise<CustomerComplaint[]> {
    return this.complaintRepository.findByOrder(orderId);
  }

  async listAll(
    page: number = 1,
    limit: number = 20,
    status?: string,
    priority?: string,
    type?: string,
    assigneeId?: string,
  ): Promise<{ items: CustomerComplaint[]; total: number }> {
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (type) filter.type = type;
    if (assigneeId) filter.assignedTo = assigneeId;

    const result = await this.complaintRepository.findPaginated(filter, { page, limit }, {
      createdAt: -1,
    } as any);
    return { items: result.items, total: result.totalCount };
  }

  async getStats(): Promise<ComplaintStats> {
    const byStatus = await this.complaintRepository.countByStatus();

    const byTypePipeline = [{ $group: { _id: "$type", count: { $sum: 1 } } }];
    const byTypeResults = await (ComplaintModel as any).aggregate(byTypePipeline);
    const byType: Record<string, number> = {};
    for (const r of byTypeResults) {
      byType[r._id] = r.count;
    }

    const byPriorityPipeline = [{ $group: { _id: "$priority", count: { $sum: 1 } } }];
    const byPriorityResults = await (ComplaintModel as any).aggregate(byPriorityPipeline);
    const byPriority: Record<string, number> = {};
    for (const r of byPriorityResults) {
      byPriority[r._id] = r.count;
    }

    const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
    return { byStatus, byType, byPriority, total };
  }
}

export default ComplaintService;
