import { BaseRepository } from "@/lib/database/generic-repository";
import { TimelineEntryModel } from "./timeline-model";
import type { OrderTimeline } from "../domain/order-timeline";

function mapToDomain(doc: any): OrderTimeline {
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
    correlationId: doc.correlationId,
    createdAt: doc.createdAt ?? new Date(),
    updatedAt: doc.updatedAt ?? new Date(),
    isDeleted: doc.isDeleted ?? false,
    status: doc.status ?? "active",
    metadata: doc.metadata,
  };
}

export class OrderTimelineRepository extends BaseRepository<any, OrderTimeline> {
  constructor() {
    super(TimelineEntryModel as any, mapToDomain);
  }

  async findByEntity(entityType: "order" | "order_item", entityId: string): Promise<OrderTimeline[]> {
    return this.find({ entityType, entityId }, { sort: { createdAt: -1 } } as any);
  }
}
