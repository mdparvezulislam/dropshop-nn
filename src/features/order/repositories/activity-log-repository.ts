import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { ActivityLogModel } from "./activity-log-model";
import type { ActivityLogEntry } from "../domain/activity-log-entity";
import type { BaseDocument } from "@/shared/lib/database/types";

export interface ActivityLogDocument extends BaseDocument {
  entityType: string;
  entityId: string;
  action: string;
  summary: string;
  actorId?: string;
  actorName?: string;
  actorRole?: string;
  oldValue?: unknown;
  newValue?: unknown;
}

function toDomain(doc: any): ActivityLogEntry {
  return {
    id: doc.id ?? doc._id.toString(),
    entityType: doc.entityType,
    entityId: doc.entityId,
    action: doc.action,
    summary: doc.summary,
    actorId: doc.actorId,
    actorName: doc.actorName,
    actorRole: doc.actorRole,
    oldValue: doc.oldValue,
    newValue: doc.newValue,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted ?? false,
    status: doc.status ?? "active",
    metadata: doc.metadata,
  };
}

export class ActivityLogRepository extends BaseRepository<ActivityLogDocument, ActivityLogEntry> {
  constructor() {
    super(ActivityLogModel as any, toDomain);
  }

  async findByEntity(entityType: string, entityId: string): Promise<ActivityLogEntry[]> {
    return this.find({ entityType, entityId }, { sort: { createdAt: -1 } } as any);
  }
}

export default ActivityLogRepository;
