import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { NotificationModel, type NotificationMongoDocument } from "./notification-model";
import type { DeliveryAttempt, NotificationMessage } from "../domain/notification-entity";

function mapAttempt(a: any): DeliveryAttempt {
  return {
    id: a.id,
    channel: a.channel,
    status: a.status,
    provider: a.provider,
    providerMessageId: a.providerMessageId,
    error: a.error,
    attemptedAt: a.attemptedAt,
    completedAt: a.completedAt,
  };
}

function mapScalarRecord(
  input: any,
): Record<string, string | number | boolean | null> {
  if (!input || typeof input !== "object") return {};
  const out: Record<string, string | number | boolean | null> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v === null || typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      out[k] = v;
    } else if (v !== undefined) {
      out[k] = String(v);
    }
  }
  return out;
}

function toDomain(doc: any): NotificationMessage {
  return {
    id: doc._id?.toString?.() ?? doc.id,
    userId: doc.userId,
    recipientEmail: doc.recipientEmail,
    recipientPhone: doc.recipientPhone,
    category: doc.category,
    type: doc.type,
    title: doc.title,
    body: doc.body,
    channels: doc.channels ?? [],
    priority: doc.priority ?? "medium",
    status: doc.status,
    templateKey: doc.templateKey,
    variables: mapScalarRecord(doc.variables),
    data: mapScalarRecord(doc.data),
    href: doc.href,
    entityType: doc.entityType,
    entityId: doc.entityId,
    attempts: (doc.attempts ?? []).map(mapAttempt),
    scheduledAt: doc.scheduledAt,
    sentAt: doc.sentAt,
    deliveredAt: doc.deliveredAt,
    readAt: doc.readAt,
    expiresAt: doc.expiresAt,
    retryCount: doc.retryCount ?? 0,
    maxRetries: doc.maxRetries ?? 3,
    isRead: !!doc.isRead,
    isArchived: !!doc.isArchived,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted ?? false,
  };
}

export class NotificationRepository extends BaseRepository<
  NotificationMongoDocument,
  NotificationMessage
> {
  constructor() {
    super(NotificationModel as any, toDomain);
  }

  async listForUser(
    userId: string,
    options: {
      unreadOnly?: boolean;
      archived?: boolean;
      limit?: number;
      page?: number;
      search?: string;
      category?: string;
    } = {},
  ): Promise<{ items: NotificationMessage[]; totalCount: number; unreadCount: number }> {
    const filter: Record<string, unknown> = {
      userId,
      isDeleted: { $ne: true },
      isArchived: options.archived ? true : { $ne: true },
    };
    if (options.unreadOnly) filter.isRead = false;
    if (options.category) filter.category = options.category;
    if (options.search) {
      filter.$or = [
        { title: { $regex: options.search, $options: "i" } },
        { body: { $regex: options.search, $options: "i" } },
      ];
    }

    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const [result, unreadCount] = await Promise.all([
      this.findPaginated(filter, { page, limit }, { sortBy: "createdAt", sortOrder: "desc" }),
      this.count({ userId, isRead: false, isArchived: { $ne: true }, isDeleted: { $ne: true } }),
    ]);

    return {
      items: result.items,
      totalCount: result.totalCount,
      unreadCount,
    };
  }

  async markRead(id: string, userId: string): Promise<NotificationMessage | null> {
    const current = await this.findById(id);
    if (!current || current.userId !== userId) return null;
    return this.update(id, {
      isRead: true,
      readAt: new Date(),
      status: current.status === "delivered" || current.status === "queued" ? "read" : current.status,
    } as any);
  }

  async markAllRead(userId: string): Promise<number> {
    const res = await NotificationModel.updateMany(
      { userId, isRead: false, isDeleted: { $ne: true } },
      { $set: { isRead: true, readAt: new Date(), status: "read" } },
    );
    return res.modifiedCount ?? 0;
  }

  async archive(id: string, userId: string): Promise<NotificationMessage | null> {
    const current = await this.findById(id);
    if (!current || current.userId !== userId) return null;
    return this.update(id, { isArchived: true, status: "archived" } as any);
  }

  async listDeliveryLogs(options: {
    status?: string;
    channel?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ items: NotificationMessage[]; totalCount: number }> {
    const filter: Record<string, unknown> = { isDeleted: { $ne: true } };
    if (options.status) filter.status = options.status;
    if (options.channel) filter.channels = options.channel;
    const result = await this.findPaginated(
      filter,
      { page: options.page ?? 1, limit: options.limit ?? 30 },
      { sortBy: "createdAt", sortOrder: "desc" },
    );
    return { items: result.items, totalCount: result.totalCount };
  }

  async countByStatus(): Promise<Record<string, number>> {
    const rows = await NotificationModel.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const out: Record<string, number> = {};
    for (const r of rows) out[String(r._id)] = r.count;
    return out;
  }
}

export default NotificationRepository;
