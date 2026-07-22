import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { FailedLoginModel, FailedLoginDocument } from "./failed-login-model";
import { FailedLoginAttempt } from "../domain/security-types";
import { DatabaseQueryOptions } from "@/shared/lib/database/types";
import { logger } from "@/shared/utils/logger";
import { DatabaseError } from "@/shared/errors/app-error";

export class FailedLoginRepository extends BaseRepository<FailedLoginDocument, FailedLoginAttempt> {
  constructor() {
    super(FailedLoginModel, FailedLoginRepository.mapToDomain);
  }

  private static mapToDomain(doc: FailedLoginDocument): FailedLoginAttempt {
    return {
      id: doc._id.toString(),
      identifier: doc.identifier,
      ipAddress: doc.ipAddress,
      userAgent: doc.userAgent,
      deviceInfo: doc.deviceInfo ? {
        type: doc.deviceInfo.type as any,
        os: doc.deviceInfo.os as any,
        browser: doc.deviceInfo.browser as any,
      } : undefined,
      reason: doc.reason as any,
      attemptCount: doc.attemptCount,
      lastAttemptAt: doc.lastAttemptAt,
      resolvedAt: doc.resolvedAt ?? undefined,
      resolvedBy: doc.resolvedBy ?? undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      status: doc.status,
      metadata: doc.metadata ? Object.fromEntries(doc.metadata as any) : undefined,
    };
  }

  async findByIdentifier(identifier: string, options?: DatabaseQueryOptions): Promise<FailedLoginAttempt[]> {
    try {
      await this.ensureConnected();
      const query = FailedLoginModel.find({ identifier: identifier.trim() }).session(options?.session || null);
      if (options?.lean) query.lean();
      if (options?.showDeleted) query.setOptions({ showDeleted: true });
      const docs = await query.sort({ lastAttemptAt: -1 }).exec();
      return docs.map((doc) => this.toDomainEntity(doc as FailedLoginDocument));
    } catch (error) {
      logger.error("FailedLoginRepository findByIdentifier failed", error, { identifier });
      throw new DatabaseError("Database query error", error);
    }
  }

  async findByIpAddress(ipAddress: string, options?: DatabaseQueryOptions): Promise<FailedLoginAttempt[]> {
    try {
      await this.ensureConnected();
      const query = FailedLoginModel.find({ ipAddress }).session(options?.session || null);
      if (options?.lean) query.lean();
      if (options?.showDeleted) query.setOptions({ showDeleted: true });
      const docs = await query.sort({ lastAttemptAt: -1 }).exec();
      return docs.map((doc) => this.toDomainEntity(doc as FailedLoginDocument));
    } catch (error) {
      logger.error("FailedLoginRepository findByIpAddress failed", error, { ipAddress });
      throw new DatabaseError("Database query error", error);
    }
  }

  async incrementAttempt(
    identifier: string,
    ipAddress: string,
    userAgent: string,
    reason: string,
    deviceInfo?: { type?: string; os?: string; browser?: string },
    options?: DatabaseQueryOptions,
  ): Promise<FailedLoginAttempt> {
    try {
      await this.ensureConnected();
      const session = options?.session;

      const existing = await FailedLoginModel.findOne({
        identifier: identifier.trim(),
        ipAddress,
        resolvedAt: null,
      }).session(session || null);

      if (existing) {
        const update = {
          $inc: { attemptCount: 1 },
          $set: {
            lastAttemptAt: new Date(),
            reason,
            userAgent,
            deviceInfo,
          },
        };
        const doc = await FailedLoginModel.findByIdAndUpdate(existing._id, update, {
          new: true,
          session,
        });
        if (!doc) throw new DatabaseError("Failed to update failed login attempt");
        return this.toDomainEntity(doc as FailedLoginDocument);
      }

      const newAttempt = await FailedLoginModel.create([{
        identifier: identifier.trim(),
        ipAddress,
        userAgent,
        deviceInfo,
        reason,
        attemptCount: 1,
        lastAttemptAt: new Date(),
      }], { session });

      if (!newAttempt[0]) throw new DatabaseError("Failed to create failed login attempt");
      return this.toDomainEntity(newAttempt[0] as FailedLoginDocument);
    } catch (error) {
      logger.error("FailedLoginRepository incrementAttempt failed", error, {
        identifier,
        ipAddress,
      });
      throw new DatabaseError("Database write error", error);
    }
  }

  async resolveAttempt(id: string, resolvedBy: string, options?: DatabaseQueryOptions): Promise<FailedLoginAttempt> {
    try {
      await this.ensureConnected();
      const doc = await FailedLoginModel.findByIdAndUpdate(
        id,
        {
          $set: {
            resolvedAt: new Date(),
            resolvedBy,
          },
        },
        { new: true, session: options?.session },
      );
      if (!doc) throw new DatabaseError("Failed login attempt not found");
      return this.toDomainEntity(doc as FailedLoginDocument);
    } catch (error) {
      logger.error("FailedLoginRepository resolveAttempt failed", error, { id });
      throw new DatabaseError("Database update error", error);
    }
  }

  async getRecentAttempts(limit = 100, options?: DatabaseQueryOptions): Promise<FailedLoginAttempt[]> {
    try {
      await this.ensureConnected();
      const query = FailedLoginModel.find({ resolvedAt: null })
        .session(options?.session || null)
        .sort({ lastAttemptAt: -1 })
        .limit(limit);
      if (options?.lean) query.lean();
      const docs = await query.exec();
      return docs.map((doc) => this.toDomainEntity(doc as FailedLoginDocument));
    } catch (error) {
      logger.error("FailedLoginRepository getRecentAttempts failed", error);
      throw new DatabaseError("Database query error", error);
    }
  }

  async countByIdentifier(identifier: string, options?: DatabaseQueryOptions): Promise<number> {
    try {
      await this.ensureConnected();
      const query = FailedLoginModel.countDocuments({
        identifier: identifier.trim(),
        resolvedAt: null,
      }).session(options?.session || null);
      return await query.exec();
    } catch (error) {
      logger.error("FailedLoginRepository countByIdentifier failed", error, { identifier });
      throw new DatabaseError("Database count error", error);
    }
  }
}

export default FailedLoginRepository;
