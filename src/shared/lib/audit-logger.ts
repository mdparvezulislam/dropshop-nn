import { logger } from "@/shared/utils/logger";
import { EventBus } from "@/shared/lib/event-bus";
import type { ActorInfo, ChangeRecord } from "@/shared/core/types";

export interface AuditEntry {
  action: string;
  entityType: string;
  entityId: string;
  actor: ActorInfo;
  changes?: ChangeRecord[];
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

export class AuditLogger {
  static async record(entry: AuditEntry): Promise<void> {
    logger.info("Audit", {
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      actorId: entry.actor.id,
      actorRole: entry.actor.role,
      changes: entry.changes,
      ip: entry.ip,
    });

    try {
      await EventBus.publish("audit.entry_created", {
        ...entry,
        timestamp: new Date().toISOString(),
      }, {
        actor: { id: entry.actor.id, name: entry.actor.name, role: entry.actor.role },
        source: "audit-logger",
      });
    } catch {
      // fire-and-forget: audit logging must never fail the main operation
    }
  }
}
