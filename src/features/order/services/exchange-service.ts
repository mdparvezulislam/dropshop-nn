import { ExchangeRepository } from "../repositories/exchange-repository";
import { OrderRepository } from "../repositories/order-repository";
import { OrderTimelineService } from "./order-timeline-service";
import { canTransitionExchange, getExchangeHumanLabel, type ExchangeStatus, type ExchangeEntity } from "../domain/exchange-entity";
import { EventBus } from "@/lib/event-bus";
import { NotFoundError, ValidationError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";
import { runInTransaction } from "@/lib/database/query-builder";
import type { CreateExchangeInput, UpdateExchangeStatusInput } from "../types/validation";

export class ExchangeService {
  private readonly exchangeRepository: ExchangeRepository;
  private readonly orderRepository: OrderRepository;
  private readonly timelineService: OrderTimelineService;

  constructor() {
    this.exchangeRepository = new ExchangeRepository();
    this.orderRepository = new OrderRepository();
    this.timelineService = new OrderTimelineService();
  }

  async create(input: CreateExchangeInput, actor?: { id: string; name?: string; role?: string }): Promise<ExchangeEntity> {
    return runInTransaction(async () => {
      const order = await this.orderRepository.findById(input.orderId);
      if (!order) throw new NotFoundError("Order not found");

      const exchangeNumber = `EXC-${Date.now().toString(36).toUpperCase()}`;
      const now = new Date();

      const exchangeData = {
        exchangeNumber,
        orderId: input.orderId,
        orderNumber: order.orderNumber,
        status: "requested" as ExchangeStatus,
        previousStatuses: [],
        items: input.items,
        reason: input.reason,
        customerNote: input.customerNote,
        requestedAt: now,
        requestedBy: actor?.id,
      };

      const exchange = await this.exchangeRepository.create(exchangeData as any);

      await this.timelineService.addEntry({
        entityType: "order",
        entityId: input.orderId,
        eventType: "order.system_action",
        action: "order.system_action",
        summary: `Exchange ${exchangeNumber} requested: ${input.reason}`,
        actor,
      });

      await EventBus.publish("order.system_action", {
        exchangeId: exchange.id,
        exchangeNumber,
        orderId: input.orderId,
        orderNumber: order.orderNumber,
      }, { source: "order" });

      return exchange;
    });
  }

  async transitionStatus(
    exchangeId: string,
    toStatus: ExchangeStatus,
    input?: UpdateExchangeStatusInput,
    actor?: { id: string; name?: string; role?: string },
  ): Promise<ExchangeEntity> {
    const exchange = await this.exchangeRepository.findById(exchangeId);
    if (!exchange) throw new NotFoundError("Exchange not found");

    const fromStatus = exchange.status;
    if (fromStatus === toStatus) {
      throw new ValidationError("Exchange is already in this status");
    }

    canTransitionExchange(fromStatus, toStatus);

    const now = new Date();
    const updates: Record<string, unknown> = {
      status: toStatus,
      previousStatuses: [...exchange.previousStatuses, fromStatus],
    };

    if (toStatus === "approved") {
      updates.approvedAt = now;
      updates.approvedBy = actor?.id;
    }
    if (toStatus === "pickup_scheduled") {
      updates.pickupAddress = input?.pickupAddress;
      updates.pickupDate = input?.pickupDate ? new Date(input.pickupDate) : undefined;
    }
    if (toStatus === "replacement_shipped") {
      updates.replacementProductId = input?.replacementProductId;
      updates.replacementVariantSku = input?.replacementVariantSku;
      updates.trackingNumber = input?.trackingNumber;
      updates.trackingUrl = input?.trackingUrl;
    }
    if (toStatus === "rejected") updates.rejectionReason = input?.rejectionReason;
    if (toStatus === "completed") updates.completedAt = now;

    const updated = await this.exchangeRepository.update(exchangeId, updates as any);

    await this.timelineService.addEntry({
      entityType: "order",
      entityId: exchange.orderId,
      eventType: "order.system_action",
      action: "order.system_action",
      summary: `Exchange ${exchange.exchangeNumber}: ${getExchangeHumanLabel(fromStatus)} → ${getExchangeHumanLabel(toStatus)}`,
      actor,
      changes: [{ field: "exchangeStatus", oldValue: fromStatus, newValue: toStatus }],
    });

    return updated;
  }

  async getExchange(exchangeId: string): Promise<ExchangeEntity | null> {
    return this.exchangeRepository.findById(exchangeId);
  }

  async listExchangesByOrder(orderId: string): Promise<ExchangeEntity[]> {
    return this.exchangeRepository.findByOrder(orderId);
  }

  async listExchanges(page: number = 1, limit: number = 20): Promise<{ items: ExchangeEntity[]; total: number }> {
    const result = await this.exchangeRepository.findPaginated({}, { page, limit }, { createdAt: -1 } as any);
    return { items: result.items, total: result.totalCount };
  }

  async getStatusSummary(): Promise<Record<string, number>> {
    return this.exchangeRepository.countByStatus();
  }
}

export default ExchangeService;
