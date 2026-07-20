import { logger } from "@/shared/utils/logger";
import { EventBus } from "@/shared/lib/event-bus";
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

export abstract class BaseService<T extends DomainEntity, TCreate, TUpdate> implements ContractService<T, TCreate, TUpdate> {
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

  protected async publishEvent(eventType: string, data: Record<string, unknown>, actor?: ActorInfo): Promise<void> {
    try {
      await EventBus.publish(eventType, data, {
        actor: actor ? { id: actor.id, name: actor.name, role: actor.role } : undefined,
        source: `${this.domainName}-service`,
      });
    } catch (error) {
      logger.error(`${this.domainName}Service: event publication failed`, error, { eventType });
    }
  }

  protected async logAudit(action: string, entityType: string, entityId: string, actor?: ActorInfo, changes?: ChangeRecord[]): Promise<void> {
    logger.info("Audit", {
      action,
      entityType,
      entityId,
      actorId: actor?.id,
      actorRole: actor?.role,
      changes,
    });
  }

  protected async trackAnalytics(event: string, data: Record<string, unknown>, actor?: ActorInfo): Promise<void> {
    logger.info("Analytics", {
      event,
      actorId: actor?.id,
      ...data,
    });
  }

  protected async triggerNotification(type: string, recipients: string[], data: Record<string, unknown>): Promise<void> {
    await this.publishEvent("notification.trigger", {
      type,
      recipients,
      data,
    });
  }
}
