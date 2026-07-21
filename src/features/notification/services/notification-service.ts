import type {
  NotifyInput,
  NotificationCategory,
  NotificationMessage,
  NotificationTemplate,
} from "../domain/notification-entity";
import { DEFAULT_TEMPLATES } from "../domain/notification-entity";
import { NotificationRepository } from "../repositories/notification-repository";
import { NotificationTemplateRepository } from "../repositories/template-repository";
import { PreferenceResolver } from "./preference-resolver";
import { renderNotificationContent } from "./template-renderer";
import { NotificationDispatcher } from "./notification-dispatcher";
import { EventBus } from "@/shared/lib/event-bus";
import { NOTIFICATION_EVENTS } from "../domain/notification-events";
import { logger } from "@/shared/utils/logger";
import { NotFoundError, ValidationError } from "@/shared/errors/app-error";
import type { NotificationChannelType } from "../domain/notification-entity";

function inferCategory(type: string, explicit?: NotificationCategory): NotificationCategory {
  if (explicit) return explicit;
  if (type.startsWith("order.") || type.includes("order")) return "order";
  if (type.startsWith("shipping") || type.includes("shipped")) return "shipping";
  if (type.startsWith("payment") || type.includes("payment")) return "payment";
  if (type.startsWith("security") || type.includes("login")) return "security";
  if (type.startsWith("cms") || type.includes("content")) return "cms";
  if (type.startsWith("blog")) return "blog";
  if (type.startsWith("marketing")) return "marketing";
  if (type.startsWith("account") || type.includes("welcome")) return "account";
  return "system";
}

function sanitizeVars(
  input?: Record<string, string | number | boolean | null | undefined>,
): Record<string, string | number | boolean | null> {
  if (!input) return {};
  const out: Record<string, string | number | boolean | null> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined) continue;
    out[k] = v;
  }
  return out;
}

export class NotificationService {
  private readonly repo = new NotificationRepository();
  private readonly templates = new NotificationTemplateRepository();
  private readonly preferences = new PreferenceResolver();
  private readonly dispatcher = new NotificationDispatcher();

  async ensureDefaultTemplates(): Promise<void> {
    for (const tpl of DEFAULT_TEMPLATES) {
      const existing = await this.templates.findByKey(tpl.key);
      if (!existing) {
        await this.templates.create({
          ...tpl,
          status: "active",
        } as any);
      }
    }
  }

  async notify(input: NotifyInput): Promise<NotificationMessage | null> {
    if (!input.userId && !input.recipientEmail && !input.recipientPhone) {
      throw new ValidationError("userId or recipient contact is required");
    }

    const type = input.type?.trim();
    if (!type) throw new ValidationError("type is required");

    const category = inferCategory(type, input.category);
    const templateKey = input.templateKey || type;
    let template = await this.templates.findByKey(templateKey);
    if (!template && templateKey !== "generic") {
      template = await this.templates.findByKey("generic");
    }

    const requestedChannels: NotificationChannelType[] =
      input.channels ??
      template?.channels ??
      (["in_app"] as NotificationChannelType[]);

    const resolved = await this.preferences.resolveChannels(
      input.userId,
      category,
      requestedChannels,
      input.forceChannels,
    );

    if (!resolved.allowed || resolved.channels.length === 0) {
      logger.info("NotificationService: skipped by preferences", {
        type,
        userId: input.userId,
        reason: resolved.reason,
      });
      return null;
    }

    const variables = sanitizeVars(input.variables);
    const rendered = renderNotificationContent(template, variables, {
      title: input.title,
      body: input.body,
      href: input.href,
    });

    const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null;
    const isScheduled = scheduledAt && scheduledAt.getTime() > Date.now();

    const message = await this.repo.create({
      userId: input.userId ?? "anonymous",
      recipientEmail: input.recipientEmail,
      recipientPhone: input.recipientPhone,
      category,
      type,
      title: rendered.title,
      body: rendered.body,
      channels: resolved.channels,
      priority: input.priority ?? "medium",
      status: isScheduled ? "queued" : "queued",
      templateKey: template?.key,
      variables,
      data: sanitizeVars(input.data),
      href: rendered.href || input.href,
      entityType: input.entityType,
      entityId: input.entityId,
      attempts: [],
      scheduledAt,
      sentAt: null,
      deliveredAt: null,
      readAt: null,
      expiresAt: null,
      retryCount: 0,
      maxRetries: input.maxRetries ?? 3,
      isRead: false,
      isArchived: false,
    } as any);

    await EventBus.publish(
      NOTIFICATION_EVENTS.QUEUED,
      {
        notificationId: message.id,
        type: message.type,
        userId: message.userId,
        channels: message.channels,
      },
      { source: "notification-service" },
    );

    if (isScheduled) {
      return message;
    }

    const delivered = await this.dispatcher.dispatch(message);

    await EventBus.publish(
      delivered.status === "failed" ? NOTIFICATION_EVENTS.FAILED : NOTIFICATION_EVENTS.DELIVERED,
      {
        notificationId: delivered.id,
        type: delivered.type,
        userId: delivered.userId,
        status: delivered.status,
        channels: delivered.channels,
      },
      { source: "notification-service" },
    );

    // Analytics mirror (best-effort)
    try {
      const { AnalyticsPublisher } = await import(
        "@/features/analytics/services/analytics-publisher"
      );
      await new AnalyticsPublisher().track({
        eventName:
          delivered.status === "failed" ? "notification.failed" : "notification.delivered",
        module: "notification",
        source: "notification-service",
        actorId: delivered.userId,
        entityType: "notification",
        entityId: delivered.id,
        metadata: {
          type: delivered.type,
          category: delivered.category,
          status: delivered.status,
        },
      });
    } catch {
      // ignore
    }

    return delivered;
  }

  async getInbox(
    userId: string,
    options?: {
      unreadOnly?: boolean;
      archived?: boolean;
      limit?: number;
      page?: number;
      search?: string;
      category?: string;
    },
  ) {
    return this.repo.listForUser(userId, options);
  }

  async markRead(id: string, userId: string): Promise<NotificationMessage> {
    const updated = await this.repo.markRead(id, userId);
    if (!updated) throw new NotFoundError("Notification not found");
    await EventBus.publish(
      NOTIFICATION_EVENTS.READ,
      { notificationId: id, userId },
      { source: "notification-service" },
    );
    return updated;
  }

  async markAllRead(userId: string): Promise<number> {
    return this.repo.markAllRead(userId);
  }

  async archive(id: string, userId: string): Promise<NotificationMessage> {
    const updated = await this.repo.archive(id, userId);
    if (!updated) throw new NotFoundError("Notification not found");
    return updated;
  }

  async deleteForUser(id: string, userId: string): Promise<boolean> {
    const current = await this.repo.findById(id);
    if (!current || current.userId !== userId) throw new NotFoundError("Notification not found");
    return this.repo.delete(id);
  }

  async listTemplates(): Promise<NotificationTemplate[]> {
    await this.ensureDefaultTemplates();
    return this.templates.listAll();
  }

  async upsertTemplate(
    data: Partial<NotificationTemplate> & { key: string; name: string; inAppTitle: string; inAppBody: string },
  ): Promise<NotificationTemplate> {
    const existing = await this.templates.findByKey(data.key);
    if (existing) {
      return this.templates.update(existing.id, data as any);
    }
    return this.templates.create({
      category: data.category ?? "system",
      channels: data.channels ?? ["in_app"],
      variables: data.variables ?? [],
      isActive: data.isActive ?? true,
      locale: data.locale ?? "en",
      ...data,
      status: "active",
    } as any);
  }

  async getDeliveryLogs(options?: {
    status?: string;
    channel?: string;
    page?: number;
    limit?: number;
  }) {
    return this.repo.listDeliveryLogs(options);
  }

  async getStatusSummary(): Promise<Record<string, number>> {
    return this.repo.countByStatus();
  }

  async retryDelivery(id: string): Promise<NotificationMessage> {
    const current = await this.repo.findById(id);
    if (!current) throw new NotFoundError("Notification not found");
    return this.dispatcher.dispatch(current);
  }
}

export default NotificationService;
