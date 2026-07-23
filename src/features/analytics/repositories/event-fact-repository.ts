import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { EventFactModel, type EventFactMongoDocument } from "./event-fact-model";
import type { AnalyticsEventFact, AnalyticsModule } from "../domain/analytics-entity";

function mapFact(doc: any): AnalyticsEventFact {
  return {
    id: doc._id?.toString?.() ?? doc.id,
    eventId: doc.eventId,
    eventName: doc.eventName,
    timestamp: doc.timestamp,
    actorId: doc.actorId,
    actorRole: doc.actorRole,
    sessionId: doc.sessionId,
    requestId: doc.requestId,
    source: doc.source,
    module: doc.module as AnalyticsModule,
    entityType: doc.entityType,
    entityId: doc.entityId,
    value: doc.value,
    currency: doc.currency,
    metadata: (doc.metadata as Record<string, string | number | boolean | null | undefined>) ?? {},
    idempotencyKey: doc.idempotencyKey,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted ?? false,
    status: doc.status ?? "active",
  };
}

export class EventFactRepository extends BaseRepository<EventFactMongoDocument, AnalyticsEventFact> {
  constructor() {
    super(EventFactModel as any, mapFact);
  }

  async findByIdempotencyKey(key: string): Promise<AnalyticsEventFact | null> {
    return this.findOne({ idempotencyKey: key, isDeleted: { $ne: true } });
  }

  async findByEventId(eventId: string): Promise<AnalyticsEventFact | null> {
    return this.findOne({ eventId, isDeleted: { $ne: true } });
  }

  async countInRange(
    from: Date,
    to: Date,
    filter: { eventName?: string | string[]; module?: string } = {},
  ): Promise<number> {
    const dbFilter: Record<string, unknown> = {
      timestamp: { $gte: from, $lte: to },
      isDeleted: { $ne: true },
    };
    if (filter.eventName) {
      dbFilter.eventName = Array.isArray(filter.eventName)
        ? { $in: filter.eventName }
        : filter.eventName;
    }
    if (filter.module) dbFilter.module = filter.module;
    return this.count(dbFilter);
  }

  async sumValueInRange(from: Date, to: Date, eventNames: string[]): Promise<number> {
    const rows = await EventFactModel.aggregate([
      {
        $match: {
          timestamp: { $gte: from, $lte: to },
          eventName: { $in: eventNames },
          isDeleted: { $ne: true },
          value: { $type: "number" },
        },
      },
      { $group: { _id: null, total: { $sum: "$value" } } },
    ]);
    return rows[0]?.total ?? 0;
  }

  async distinctSessions(from: Date, to: Date): Promise<number> {
    const sessions = await EventFactModel.distinct("sessionId", {
      timestamp: { $gte: from, $lte: to },
      sessionId: { $exists: true, $nin: [null, ""] },
      isDeleted: { $ne: true },
    });
    return sessions.length;
  }

  async topByField(
    from: Date,
    to: Date,
    eventName: string | string[],
    fieldPath: string,
    limit = 10,
  ): Promise<{ key: string; count: number; sum: number }[]> {
    const names = Array.isArray(eventName) ? eventName : [eventName];
    const rows = await EventFactModel.aggregate([
      {
        $match: {
          timestamp: { $gte: from, $lte: to },
          eventName: { $in: names },
          isDeleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: `$${fieldPath}`,
          count: { $sum: 1 },
          sum: { $sum: { $ifNull: ["$value", 0] } },
        },
      },
      { $match: { _id: { $nin: [null, ""] } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);
    return rows.map((r: any) => ({
      key: String(r._id),
      count: r.count as number,
      sum: r.sum as number,
    }));
  }

  async seriesByDay(
    from: Date,
    to: Date,
    eventNames: string[],
    mode: "count" | "sum" = "count",
  ): Promise<{ date: string; value: number }[]> {
    const rows = await EventFactModel.aggregate([
      {
        $match: {
          timestamp: { $gte: from, $lte: to },
          eventName: { $in: eventNames },
          isDeleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          value: mode === "sum" ? { $sum: { $ifNull: ["$value", 0] } } : { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return rows.map((r: any) => ({ date: r._id as string, value: r.value as number }));
  }

  async getSeriesByTimeUnit(
    from: Date,
    to: Date,
    format: string,
    eventNames?: string[],
  ): Promise<{ _id: string; value: number }[]> {
    const match: Record<string, unknown> = {
      timestamp: { $gte: from, $lte: to },
      isDeleted: { $ne: true },
    };
    if (eventNames && eventNames.length > 0) {
      match.eventName = { $in: eventNames };
    }
    return EventFactModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format, date: "$timestamp" } },
          value: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async distinctActors(from: Date, to: Date, role?: string): Promise<number> {
    const filter: Record<string, unknown> = {
      timestamp: { $gte: from, $lte: to },
      actorId: { $exists: true, $nin: [null, ""] },
      isDeleted: { $ne: true },
    };
    if (role) filter.actorRole = role;
    const actors = await EventFactModel.distinct("actorId", filter);
    return actors.length;
  }

  async getDistinctActorsWithCount(
    from: Date,
    to: Date,
    role?: string,
  ): Promise<{ actorId: string; count: number }[]> {
    const match: Record<string, unknown> = {
      timestamp: { $gte: from, $lte: to },
      actorId: { $exists: true, $nin: [null, ""] },
      isDeleted: { $ne: true },
    };
    if (role) match.actorRole = role;
    const rows = await EventFactModel.aggregate([
      { $match: match },
      { $group: { _id: "$actorId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    return rows.map((r: any) => ({ actorId: String(r._id), count: r.count }));
  }

  async listRecent(limit = 50): Promise<AnalyticsEventFact[]> {
    const docs = await EventFactModel.find({ isDeleted: { $ne: true } })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    return docs.map(mapFact);
  }
}

export default EventFactRepository;
