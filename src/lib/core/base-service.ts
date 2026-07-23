import { logger } from "@/lib/utils/logger";
import { EventBus } from "@/lib/event-bus";
import type { ActorInfo, ChangeRecord } from "./types";
import type { ContractService, DomainEntity } from "./contracts";

export interface ServiceHooks<T extends DomainEntity, TUpdate> {
  beforeUpdate?: (id: string, data: TUpdate, actor?: ActorInfo) => Promise<void>;
  afterUpdate?: (entity: T, actor?: ActorInfo) => Promise<void>;
  beforeDelete?: (id: string, actor?: ActorInfo) => Promise<void>;
  afterDelete?: (id: string, actor?: ActorInfo) => Promise<void>;
  validateCreate?: (data: Record<string, unknown>) => Promise<void>;
  validateUpdate?: (id: string, data: Record<string, unknown>) => Promise<void>;
  authorize?: (action: string, actor?: ActorInfo) => Promise<boolean>;
}

export abstract class BaseService<
  T extends DomainEntity,
  TCreate,
  TUpdate,
> implements ContractService<T, TCreate, TUpdate> {
  protected abstract readonly domainName: string;

  constructor(protected hooks?: ServiceHooks<T, TUpdate>) {}

  abstract create(data: TCreate, actor?: ActorInfo): Promise<T>;
  abstract findById(id: string): Promise<T | null>;
  abstract update(id: string, data: TUpdate, actor?: ActorInfo): Promise<T>;
  abstract delete(id: string, actor?: ActorInfo): Promise<boolean>;

  protected async checkAuthorization(action: string, actor?: ActorInfo): Promise<void> {
    if (this.hooks?.authorize) {
      const allowed = await this.hooks.authorize(action, actor);
      if (!allowed) {
        throw new Error(`Authorization failed: ${actor?.role} cannot ${action} ${this.domainName}`);
      }
    }
  }

  protected async publishEvent(
    eventType: string,
    data: Record<string, unknown>,
    actor?: ActorInfo,
  ): Promise<void> {
    try {
      await EventBus.publish(eventType, data, {
        actor: actor ? { id: actor.id, name: actor.name, role: actor.role } : undefined,
        source: `${this.domainName}-service`,
      });
    } catch (error) {
      logger.error(`${this.domainName}Service: event publication failed`, error, { eventType });
    }
  }

  protected async logAudit(
    action: string,
    entityType: string,
    entityId: string,
    actor?: ActorInfo,
    changes?: ChangeRecord[],
  ): Promise<void> {
    logger.info("Audit", {
      action,
      entityType,
      entityId,
      actorId: actor?.id,
      actorRole: actor?.role,
      changes,
    });
  }

  protected async trackAnalytics(
    event: string,
    data: Record<string, unknown>,
    actor?: ActorInfo,
  ): Promise<void> {
    try {
      const { AnalyticsPublisher } = await import(
        "@/features/analytics/services/analytics-publisher"
      );
      await new AnalyticsPublisher().track({
        eventName: event,
        module: (data.module as any) || "system",
        source: `${this.domainName}-service`,
        actorId: actor?.id,
        actorRole: actor?.role,
        entityType: data.entityType as string | undefined,
        entityId: data.entityId as string | undefined,
        value: typeof data.value === "number" ? data.value : undefined,
        currency: data.currency as string | undefined,
        metadata: Object.fromEntries(
          Object.entries(data).map(([k, v]) => [
            k,
            v === null ||
            v === undefined ||
            typeof v === "string" ||
            typeof v === "number" ||
            typeof v === "boolean"
              ? v
              : String(v),
          ]),
        ),
      });
    } catch (error) {
      logger.warn(`${this.domainName}Service: analytics track failed`, {
        event,
        error,
      });
    }
  }

  protected async triggerNotification(
    type: string,
    recipients: string[],
    data: Record<string, unknown>,
  ): Promise<void> {
    try {
      const { NotificationPublisher } = await import(
        "@/features/notification/services/notification-publisher"
      );
      const publisher = new NotificationPublisher();
      const payload = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [
          k,
          v === null ||
          typeof v === "string" ||
          typeof v === "number" ||
          typeof v === "boolean"
            ? v
            : String(v),
        ]),
      ) as Record<string, string | number | boolean | null>;

      for (const userId of recipients) {
        await publisher.notify({
          userId,
          type,
          templateKey: type,
          variables: payload,
          data: payload,
          title: typeof data.title === "string" ? data.title : undefined,
          body: typeof data.body === "string" ? data.body : undefined,
          href: typeof data.href === "string" ? data.href : undefined,
          entityType: typeof data.entityType === "string" ? data.entityType : undefined,
          entityId: typeof data.entityId === "string" ? data.entityId : undefined,
        });
      }
    } catch (error) {
      logger.warn(`${this.domainName}Service: notification trigger failed`, {
        type,
        error,
      });
      await this.publishEvent("notification.trigger", {
        type,
        recipients,
        data,
      });
    }
  }
}
