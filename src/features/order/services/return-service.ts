import { ReturnRepository } from "../repositories/return-repository";
import { OrderRepository } from "../repositories/order-repository";
import { OrderTimelineService } from "./order-timeline-service";
import { canTransitionReturn, getReturnHumanLabel, RETURN_TERMINAL_STATUSES, type ReturnStatus, type ReturnEntity } from "../domain/return-entity";
import { EventBus } from "@/shared/lib/event-bus";
import { NotFoundError, ValidationError } from "@/shared/errors/app-error";
import { logger } from "@/shared/utils/logger";
import { runInTransaction } from "@/shared/lib/database/query-builder";
import { generateUUID } from "@/shared/utils/id-utils";
import type { CreateReturnInput, UpdateReturnStatusInput } from "../types/validation";

export class ReturnService {
  private readonly returnRepository: ReturnRepository;
  private readonly orderRepository: OrderRepository;
  private readonly timelineService: OrderTimelineService;

  constructor() {
    this.returnRepository = new ReturnRepository();
    this.orderRepository = new OrderRepository();
    this.timelineService = new OrderTimelineService();
  }

  async create(input: CreateReturnInput, actor?: { id: string; name?: string; role?: string }): Promise<ReturnEntity> {
    return runInTransaction(async () => {
      const order = await this.orderRepository.findById(input.orderId);
      if (!order) throw new NotFoundError("Order not found");

      const orderStatus = order.status as string;
      if (orderStatus !== "delivered" && orderStatus !== "completed") {
        throw new ValidationError("Returns can only be created for delivered or completed orders");
      }

      const returnNumber = `RET-${Date.now().toString(36).toUpperCase()}`;
      const now = new Date();

      const returnData = {
        returnNumber,
        orderId: input.orderId,
        orderNumber: order.orderNumber,
        status: "requested" as ReturnStatus,
        previousStatuses: [],
        items: input.items,
        reason: input.reason,
        customerNote: input.customerNote,
        requestedAt: now,
        requestedBy: actor?.id,
      };

      const returnRecord = await this.returnRepository.create(returnData as any);

      await this.timelineService.addEntry({
        entityType: "order",
        entityId: input.orderId,
        eventType: "order.return_requested",
        action: "order.return_requested",
        summary: `Return ${returnNumber} requested: ${input.reason}`,
        actor,
      });

      await EventBus.publish("order.return_requested", {
        returnId: returnRecord.id,
        returnNumber,
        orderId: input.orderId,
        orderNumber: order.orderNumber,
        reason: input.reason,
      }, { source: "order" });

      return returnRecord;
    });
  }

  async transitionStatus(
    returnId: string,
    toStatus: ReturnStatus,
    input?: UpdateReturnStatusInput,
    actor?: { id: string; name?: string; role?: string },
  ): Promise<ReturnEntity> {
    const returnRecord = await this.returnRepository.findById(returnId);
    if (!returnRecord) throw new NotFoundError("Return not found");

    const fromStatus = returnRecord.status;
    if (fromStatus === toStatus) {
      throw new ValidationError("Return is already in this status");
    }

    canTransitionReturn(fromStatus, toStatus);

    const now = new Date();
    const updates: Record<string, unknown> = {
      status: toStatus,
      previousStatuses: [...returnRecord.previousStatuses, fromStatus],
    };

    if (toStatus === "approved") {
      updates.approvedAt = now;
      updates.approvedBy = actor?.id;
    }
    if (toStatus === "received") updates.receivedAt = now;
    if (toStatus === "inspecting" && input?.inspectionNotes) updates.inspectionNotes = input.inspectionNotes;
    if (toStatus === "approved_for_refund" && input?.refundAmount !== undefined) updates.refundAmount = input.refundAmount;
    if (toStatus === "rejected") updates.rejectionReason = input?.rejectionReason;
    if (toStatus === "refunded") updates.refundedAt = now;
    if (toStatus === "completed") updates.completedAt = now;

    const updated = await this.returnRepository.update(returnId, updates as any);

    await this.timelineService.addEntry({
      entityType: "order",
      entityId: returnRecord.orderId,
      eventType: "order.return_processed",
      action: "order.return_processed",
      summary: `Return ${returnRecord.returnNumber}: ${getReturnHumanLabel(fromStatus)} → ${getReturnHumanLabel(toStatus)}`,
      actor,
      changes: [{ field: "returnStatus", oldValue: fromStatus, newValue: toStatus }],
    });

    return updated;
  }

  async getReturn(returnId: string): Promise<ReturnEntity | null> {
    return this.returnRepository.findById(returnId);
  }

  async listReturnsByOrder(orderId: string): Promise<ReturnEntity[]> {
    return this.returnRepository.findByOrder(orderId);
  }

  async listReturns(page: number = 1, limit: number = 20): Promise<{ items: ReturnEntity[]; total: number }> {
    const result = await this.returnRepository.findPaginated({}, { page, limit }, { createdAt: -1 } as any);
    return { items: result.items, total: result.totalCount };
  }

  async getStatusSummary(): Promise<Record<string, number>> {
    return this.returnRepository.countByStatus();
  }
}

export default ReturnService;
