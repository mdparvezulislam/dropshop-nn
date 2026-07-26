import { WarrantyRepository } from "../repositories/warranty-repository";
import { OrderRepository } from "../repositories/order-repository";
import { OrderTimelineService } from "./order-timeline-service";
import {
  canTransitionWarranty,
  getWarrantyHumanLabel,
  type WarrantyStatus,
  type WarrantyEntity,
} from "../domain/warranty-entity";
import { EventBus } from "@/lib/event-bus";
import { NotFoundError, ValidationError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";
import { runInTransaction } from "@/lib/database/query-builder";
import type { CreateWarrantyInput, UpdateWarrantyStatusInput } from "../types/validation";

export class WarrantyService {
  private readonly warrantyRepository: WarrantyRepository;
  private readonly orderRepository: OrderRepository;
  private readonly timelineService: OrderTimelineService;

  constructor() {
    this.warrantyRepository = new WarrantyRepository();
    this.orderRepository = new OrderRepository();
    this.timelineService = new OrderTimelineService();
  }

  async create(
    input: CreateWarrantyInput,
    actor?: { id: string; name?: string; role?: string },
  ): Promise<WarrantyEntity> {
    return runInTransaction(async () => {
      const order = await this.orderRepository.findById(input.orderId);
      if (!order) throw new NotFoundError("Order not found");

      const warrantyNumber = `WRN-${Date.now().toString(36).toUpperCase()}`;
      const now = new Date();

      const warrantyData = {
        warrantyNumber,
        orderId: input.orderId,
        orderNumber: order.orderNumber,
        status: "requested" as WarrantyStatus,
        previousStatuses: [],
        productId: input.productId,
        productName: input.productName,
        variantSku: input.variantSku,
        issue: input.issue,
        customerNote: input.customerNote,
        requestedAt: now,
        requestedBy: actor?.id,
      };

      const warranty = await this.warrantyRepository.create(warrantyData as any);

      await this.timelineService.addEntry({
        entityType: "order",
        entityId: input.orderId,
        eventType: "order.system_action",
        action: "order.system_action",
        summary: `Warranty ${warrantyNumber} requested for ${input.productName}: ${input.issue}`,
        actor,
      });

      await EventBus.publish(
        "order.system_action",
        {
          warrantyId: warranty.id,
          warrantyNumber,
          orderId: input.orderId,
          orderNumber: order.orderNumber,
        },
        { source: "order" },
      );

      return warranty;
    });
  }

  async transitionStatus(
    warrantyId: string,
    toStatus: WarrantyStatus,
    input?: UpdateWarrantyStatusInput,
    actor?: { id: string; name?: string; role?: string },
  ): Promise<WarrantyEntity> {
    const warranty = await this.warrantyRepository.findById(warrantyId);
    if (!warranty) throw new NotFoundError("Warranty not found");

    const fromStatus = warranty.status;
    if (fromStatus === toStatus) {
      throw new ValidationError("Warranty is already in this status");
    }

    canTransitionWarranty(fromStatus, toStatus);

    const now = new Date();
    const updates: Record<string, unknown> = {
      status: toStatus,
      previousStatuses: [...warranty.previousStatuses, fromStatus],
    };

    if (toStatus === "approved") {
      updates.approvedAt = now;
      updates.approvedBy = actor?.id;
    }
    if (toStatus === "in_repair" && input?.repairNotes) updates.repairNotes = input.repairNotes;
    if (toStatus === "repaired" && input?.resolution) updates.resolution = input.resolution;
    if (toStatus === "replaced") {
      updates.replacementProductId = input?.replacementProductId;
      updates.resolution = input?.resolution;
    }
    if (toStatus === "rejected") updates.rejectionReason = input?.rejectionReason;
    if (toStatus === "completed") updates.completedAt = now;

    const updated = await this.warrantyRepository.update(warrantyId, updates as any);

    await this.timelineService.addEntry({
      entityType: "order",
      entityId: warranty.orderId,
      eventType: "order.system_action",
      action: "order.system_action",
      summary: `Warranty ${warranty.warrantyNumber}: ${getWarrantyHumanLabel(fromStatus)} → ${getWarrantyHumanLabel(toStatus)}`,
      actor,
      changes: [{ field: "warrantyStatus", oldValue: fromStatus, newValue: toStatus }],
    });

    return updated;
  }

  async getWarranty(warrantyId: string): Promise<WarrantyEntity | null> {
    return this.warrantyRepository.findById(warrantyId);
  }

  async listWarrantiesByOrder(orderId: string): Promise<WarrantyEntity[]> {
    return this.warrantyRepository.findByOrder(orderId);
  }

  async listWarranties(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ items: WarrantyEntity[]; total: number }> {
    const result = await this.warrantyRepository.findPaginated({}, { page, limit }, {
      createdAt: -1,
    } as any);
    return { items: result.items, total: result.totalCount };
  }

  async getStatusSummary(): Promise<Record<string, number>> {
    return this.warrantyRepository.countByStatus();
  }
}

export default WarrantyService;
