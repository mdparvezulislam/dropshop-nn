import { FailedDeliveryRepository } from "../repositories/failed-delivery-repository";
import { OrderRepository } from "../repositories/order-repository";
import { OrderTimelineService } from "./order-timeline-service";
import { EventBus } from "@/shared/lib/event-bus";
import { NotFoundError, ValidationError } from "@/shared/errors/app-error";
import { logger } from "@/shared/utils/logger";
import { runInTransaction } from "@/shared/lib/database/query-builder";
import type { FailedDelivery } from "../domain/failed-delivery-entity";
import type { z } from "zod";
import type {
  createFailedDeliverySchema,
  resolveFailedDeliverySchema,
} from "../types/validation";

type CreateFailedDeliveryInput = z.infer<typeof createFailedDeliverySchema>;
type ResolveFailedDeliveryInput = z.infer<typeof resolveFailedDeliverySchema>;

export interface FailedDeliveryStats {
  byReason: Record<string, number>;
  byAction: Record<string, number>;
  unresolvedCount: number;
  total: number;
}

export class FailedDeliveryService {
  private readonly failedDeliveryRepository: FailedDeliveryRepository;
  private readonly orderRepository: OrderRepository;
  private readonly timelineService: OrderTimelineService;

  constructor() {
    this.failedDeliveryRepository = new FailedDeliveryRepository();
    this.orderRepository = new OrderRepository();
    this.timelineService = new OrderTimelineService();
  }

  async create(
    input: CreateFailedDeliveryInput,
    actor?: { id: string; name?: string; role?: string },
  ): Promise<FailedDelivery> {
    return runInTransaction(async () => {
      const order = await this.orderRepository.findById(input.orderId);
      if (!order) throw new NotFoundError("Order not found");

      const delivery = await this.failedDeliveryRepository.create({
        orderId: input.orderId,
        orderNumber: order.orderNumber,
        courierName: input.courierName,
        trackingNumber: input.trackingNumber,
        reason: input.reason,
        attemptCount: input.attemptCount ?? 1,
        customerResponse: input.customerResponse,
        nextAction: input.nextAction,
        notes: input.notes,
        resolved: false,
      } as any);

      await this.timelineService.addEntry({
        entityType: "order",
        entityId: input.orderId,
        eventType: "order.system_action",
        action: "order.system_action",
        summary: `Delivery failed: ${input.reason} (attempt ${input.attemptCount ?? 1})`,
        actor,
      });

      await EventBus.publish("order.delivery_failed", {
        failedDeliveryId: delivery.id,
        orderId: input.orderId,
        orderNumber: order.orderNumber,
        reason: input.reason,
        courierName: input.courierName,
        nextAction: input.nextAction,
      }, { source: "order" });

      return delivery;
    });
  }

  async resolve(
    failedDeliveryId: string,
    nextAction: string,
    notes?: string,
    actor?: { id: string; name?: string; role?: string },
  ): Promise<FailedDelivery> {
    const delivery = await this.failedDeliveryRepository.findById(failedDeliveryId);
    if (!delivery) throw new NotFoundError("Failed delivery record not found");
    if (delivery.resolved) throw new ValidationError("Failed delivery is already resolved");

    const now = new Date();
    const updated = await this.failedDeliveryRepository.update(failedDeliveryId, {
      resolved: true,
      resolvedAt: now,
      resolvedBy: actor?.id,
      nextAction,
      notes: notes ?? delivery.notes,
    } as any);

    await this.timelineService.addEntry({
      entityType: "order",
      entityId: delivery.orderId,
      eventType: "order.system_action",
      action: "order.system_action",
      summary: `Delivery failure resolved: ${nextAction}`,
      actor,
    });

    return updated;
  }

  async getByOrder(orderId: string): Promise<FailedDelivery[]> {
    return this.failedDeliveryRepository.findByOrder(orderId);
  }

  async listUnresolved(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ items: FailedDelivery[]; total: number }> {
    const result = await this.failedDeliveryRepository.findPaginated(
      { resolved: false },
      { page, limit },
      { createdAt: -1 } as any,
    );
    return { items: result.items, total: result.totalCount };
  }

  async getStats(): Promise<FailedDeliveryStats> {
    const byReason = await this.failedDeliveryRepository.countByReason();
    const byAction = await this.failedDeliveryRepository.countByAction();
    const unresolvedCount = await this.failedDeliveryRepository.count({ resolved: false });
    const total = Object.values(byReason).reduce((a, b) => a + b, 0);

    return { byReason, byAction, unresolvedCount, total };
  }
}

export default FailedDeliveryService;
