import { generateUUID } from "@/lib/utils/id-utils";
import { logger } from "@/lib/utils/logger";
import { OrderTimelineRepository } from "../repositories/timeline-repository";
import { EventBus } from "@/lib/event-bus";
import type {
  OrderTimeline,
  TimelineAction,
  TimelineChange,
  TimelineActor,
} from "../domain/order-timeline";

export interface AddTimelineEntryInput {
  entityType: "order" | "order_item";
  entityId: string;
  eventType: string;
  action: TimelineAction;
  summary: string;
  fromStatus?: string;
  toStatus?: string;
  actor?: TimelineActor;
  changes?: TimelineChange[];
  metadata?: Record<string, string | number | boolean | null | undefined>;
  correlationId?: string;
}

export class OrderTimelineService {
  private readonly repo = new OrderTimelineRepository();

  async addEntry(input: AddTimelineEntryInput): Promise<OrderTimeline> {
    logger.info("OrderTimelineService: adding entry", {
      entityId: input.entityId,
      action: input.action,
    });

    const created = await this.repo.create({
      entityType: input.entityType,
      entityId: input.entityId,
      eventType: input.eventType,
      action: input.action,
      summary: input.summary,
      fromStatus: input.fromStatus,
      toStatus: input.toStatus,
      actor: input.actor,
      changes: input.changes,
      metadata: input.metadata,
      correlationId: input.correlationId,
    } as any);

    await EventBus.publish(
      "order.timeline_entry_added",
      {
        orderId: input.entityId,
        orderNumber: input.entityId,
        action: input.action,
        summary: input.summary,
      },
      { source: "order", correlationId: input.correlationId },
    );

    return created;
  }

  async getTimeline(
    entityType: "order" | "order_item",
    entityId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<OrderTimeline[]> {
    const page = Math.floor(offset / limit) + 1;
    const res = await this.repo.findPaginated(
      { entityType, entityId },
      { page, limit },
      { sortBy: "createdAt", sortOrder: "desc" },
    );
    return res.items;
  }

  async getTimelineByAction(
    entityId: string,
    action: TimelineAction,
    limit: number = 10,
  ): Promise<OrderTimeline[]> {
    const res = await this.repo.findPaginated(
      { entityId, action },
      { page: 1, limit },
      { sortBy: "createdAt", sortOrder: "desc" },
    );
    return res.items;
  }
}

export default OrderTimelineService;
