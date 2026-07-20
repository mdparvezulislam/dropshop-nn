import type { ActorInfo, ChangeRecord } from "./types";
import type { BusinessEvent } from "@/shared/lib/event-bus/types";

export interface DomainEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDeletableEntity extends DomainEntity {
  deletedAt?: Date | null;
  isDeleted: boolean;
}

export interface AuditableEntity extends SoftDeletableEntity {
  createdBy?: string;
  updatedBy?: string;
  version: number;
  status: string;
}

export interface ContractRepository<T extends DomainEntity, TCreate, TUpdate> {
  create(data: TCreate, actor?: ActorInfo): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(filters?: Record<string, unknown>): Promise<T[]>;
  update(id: string, data: TUpdate, actor?: ActorInfo): Promise<T>;
  delete(id: string, actor?: ActorInfo): Promise<boolean>;
  restore(id: string, actor?: ActorInfo): Promise<T>;
  count(filters?: Record<string, unknown>): Promise<number>;
}

export interface ContractService<T extends DomainEntity, TCreate, TUpdate> {
  create(data: TCreate, actor?: ActorInfo): Promise<T>;
  findById(id: string): Promise<T | null>;
  update(id: string, data: TUpdate, actor?: ActorInfo): Promise<T>;
  delete(id: string, actor?: ActorInfo): Promise<boolean>;
}

export interface EventPublisherContract {
  publish(
    eventType: string,
    data: Record<string, unknown>,
    actor?: ActorInfo,
    correlationId?: string,
  ): Promise<BusinessEvent>;
}

export interface AuditPublisherContract {
  record(
    action: string,
    entityType: string,
    entityId: string,
    actor: ActorInfo,
    changes?: ChangeRecord[],
    metadata?: Record<string, unknown>,
  ): Promise<void>;
}

export interface AnalyticsPublisherContract {
  track(event: string, data: Record<string, unknown>, actor?: ActorInfo): Promise<void>;
}

export interface NotificationPublisherContract {
  send(
    type: string,
    recipients: string[],
    data: Record<string, unknown>,
    channels?: string[],
  ): Promise<void>;
}
