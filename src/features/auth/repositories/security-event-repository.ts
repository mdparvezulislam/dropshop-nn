import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { SecurityEventModel, SecurityEventDocument } from "./security-event-model";
import { SecurityEvent } from "../domain/security-types";
import { DatabaseQueryOptions } from "@/shared/lib/database/types";
import { logger } from "@/shared/utils/logger";
import { DatabaseError } from "@/shared/errors/app-error";

export class SecurityEventRepository extends BaseRepository<SecurityEventDocument, SecurityEvent> {
  constructor() {
    super(SecurityEventModel, SecurityEventRepository.mapToDomain);
  }

  private static mapToDomain(doc: SecurityEventDocument): SecurityEvent {
    return {
      id: doc._id.toString(),
      userId: doc.userId ?? undefined,
      eventType: doc.eventType as any,
      severity: doc.severity as any,
      title: doc.title,
      description: doc.description ?? undefined,
      metadata: doc.metadata ? Object.fromEntries(doc.metadata as any) : {},
      ipAddress: doc.ipAddress ?? undefined,
      userAgent: doc.userAgent ?? undefined,
      deviceInfo: doc.deviceInfo ? {
        type: doc.deviceInfo.type as any,
        os: doc.deviceInfo.os as any,
        browser: doc.deviceInfo.browser as any,
      } : undefined,
      resolved: doc.resolved,
      resolvedAt: doc.resolvedAt ?? undefined,
      resolvedBy: doc.resolvedBy ?? undefined,
      resolvedNotes: doc.resolvedNotes ?? undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      status: doc.status,
    };
  }

  async findByUserId(userId: string, options?: DatabaseQueryOptions): Promise<SecurityEvent[]> {
    try {
      await this.ensureConnected();
      const query = SecurityEventModel.find({ userId }).session(options?.session || null);
      if (options?.lean) query.lean();
      if (options?.showDeleted) query.setOptions({ showDeleted: true });
      const docs = await query.sort({ createdAt: -1 }).exec();
      return docs.map((doc) => this.toDomainEntity(doc as SecurityEventDocument));
    } catch (error) {
      logger.error("SecurityEventRepository findByUserId failed", error, { userId });
      throw new DatabaseError("Database query error", error);
    }
  }

  async findByEventType(eventType: string, options?: DatabaseQueryOptions): Promise<SecurityEvent[]> {
    try {
      await this.ensureConnected();
      const query = SecurityEventModel.find({ eventType }).session(options?.session || null);
      if (options?.lean) query.lean();
      if (options?.showDeleted) query.setOptions({ showDeleted: true });
      const docs = await query.sort({ createdAt: -1 }).exec();
      return docs.map((doc) => this.toDomainEntity(doc as SecurityEventDocument));
    } catch (error) {
      logger.error("SecurityEventRepository findByEventType failed", error, { eventType });
      throw new DatabaseError("Database query error", error);
    }
  }

  async findUnresolved(options?: DatabaseQueryOptions): Promise<SecurityEvent[]> {
    try {
      await this.ensureConnected();
      const query = SecurityEventModel.find({ resolved: false }).session(options?.session || null);
      if (options?.lean) query.lean();
      if (options?.showDeleted) query.setOptions({ showDeleted: true });
      const docs = await query.sort({ createdAt: -1 }).exec();
      return docs.map((doc) => this.toDomainEntity(doc as SecurityEventDocument));
    } catch (error) {
      logger.error("SecurityEventRepository findUnresolved failed", error);
      throw new DatabaseError("Database query error", error);
    }
  }

  async findBySeverity(severity: string, options?: DatabaseQueryOptions): Promise<SecurityEvent[]> {
    try {
      await this.ensureConnected();
      const query = SecurityEventModel.find({ severity }).session(options?.session || null);
      if (options?.lean) query.lean();
      if (options?.showDeleted) query.setOptions({ showDeleted: true });
      const docs = await query.sort({ createdAt: -1 }).exec();
      return docs.map((doc) => this.toDomainEntity(doc as SecurityEventDocument));
    } catch (error) {
      logger.error("SecurityEventRepository findBySeverity failed", error, { severity });
      throw new DatabaseError("Database query error", error);
    }
  }

  async getStats(options?: DatabaseQueryOptions): Promise<{
    total: number;
    bySeverity: Record<string, number>;
    byEventType: Record<string, number>;
    unresolved: number;
  }> {
    try {
      await this.ensureConnected();
      const session = options?.session;

      const [total, unresolved, bySeverity, byEventType] = await Promise.all([
        SecurityEventModel.countDocuments().session(session || null),
        SecurityEventModel.countDocuments({ resolved: false }).session(session || null),
        SecurityEventModel.aggregate([
          { $group: { _id: "$severity", count: { $sum: 1 } } },
        ]).session(session || null),
        SecurityEventModel.aggregate([
          { $group: { _id: "$eventType", count: { $sum: 1 } } },
        ]).session(session || null),
      ]);

      const severityMap: Record<string, number> = {};
      for (const { _id, count } of bySeverity) {
        severityMap[_id] = count;
      }

      const eventTypeMap: Record<string, number> = {};
      for (const { _id, count } of byEventType) {
        eventTypeMap[_id] = count;
      }

      return {
        total,
        bySeverity: severityMap,
        byEventType: eventTypeMap,
        unresolved,
      };
    } catch (error) {
      logger.error("SecurityEventRepository getStats failed", error);
      throw new DatabaseError("Database aggregation error", error);
    }
  }

  async resolveEvent(
    id: string,
    resolvedBy: string,
    resolvedNotes?: string,
    options?: DatabaseQueryOptions,
  ): Promise<SecurityEvent> {
    try {
      await this.ensureConnected();
      const doc = await SecurityEventModel.findByIdAndUpdate(
        id,
        {
          $set: {
            resolved: true,
            resolvedAt: new Date(),
            resolvedBy,
            resolvedNotes,
          },
        },
        { new: true, session: options?.session },
      );
      if (!doc) throw new DatabaseError("Security event not found");
      return this.toDomainEntity(doc as SecurityEventDocument);
    } catch (error) {
      logger.error("SecurityEventRepository resolveEvent failed", error, { id });
      throw new DatabaseError("Database update error", error);
    }
  }

  async getRecentEvents(limit = 50, options?: DatabaseQueryOptions): Promise<SecurityEvent[]> {
    try {
      await this.ensureConnected();
      const query = SecurityEventModel.find()
        .session(options?.session || null)
        .sort({ createdAt: -1 })
        .limit(limit);
      if (options?.lean) query.lean();
      const docs = await query.exec();
      return docs.map((doc) => this.toDomainEntity(doc as SecurityEventDocument));
    } catch (error) {
      logger.error("SecurityEventRepository getRecentEvents failed", error);
      throw new DatabaseError("Database query error", error);
    }
  }
}

export default SecurityEventRepository;
