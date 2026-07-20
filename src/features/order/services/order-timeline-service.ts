import { generateUUID } from "@/shared/utils/id-utils";
import { logger } from "@/shared/utils/logger";
import { TimelineEntryModel } from "../repositories/timeline-model";
import { EventBus } from "@/shared/lib/event-bus";
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
  async addEntry(input: AddTimelineEntryInput): Promise<OrderTimeline> {
    logger.info("OrderTimelineService: adding entry", {
      entityId: input.entityId,
      action: input.action,
    });

    const entry: OrderTimeline = {
      id: generateUUID(),
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
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      status: "active",
    };

    await TimelineEntryModel.create([entry] as any);

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

    return entry;
  }

  async getTimeline(
    entityType: "order" | "order_item",
    entityId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<OrderTimeline[]> {
    const docs = await TimelineEntryModel.find({ entityType, entityId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();

    return docs.map((doc: any) => this.toDomain(doc));
  }

  async getTimelineByAction(
    entityId: string,
    action: TimelineAction,
    limit: number = 10,
  ): Promise<OrderTimeline[]> {
    const docs = await TimelineEntryModel.find({ entityId, action })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    return docs.map((doc: any) => this.toDomain(doc));
  }

  private toDomain(doc: any): OrderTimeline {
    return {
      id: doc.id ?? doc._id.toString(),
      entityType: doc.entityType,
      entityId: doc.entityId,
      eventType: doc.eventType,
      action: doc.action,
      summary: doc.summary,
      fromStatus: doc.fromStatus,
      toStatus: doc.toStatus,
      actor: doc.actor,
      changes: doc.changes,
      metadata: doc.metadata,
      correlationId: doc.correlationId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      status: doc.status ?? "active",
    };
  }
}

export default OrderTimelineService;
