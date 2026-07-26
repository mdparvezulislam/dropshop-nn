import { BaseRepository } from "@/lib/database/generic-repository";
import { TrustedDeviceModel, TrustedDeviceDocument } from "./trusted-device-model";
import { TrustedDevice } from "../domain/security-types";
import { DatabaseQueryOptions } from "@/lib/database/types";
import { logger } from "@/lib/utils/logger";
import { DatabaseError, NotFoundError } from "@/lib/errors/app-error";

export class TrustedDeviceRepository extends BaseRepository<TrustedDeviceDocument, TrustedDevice> {
  constructor() {
    super(TrustedDeviceModel, TrustedDeviceRepository.mapToDomain);
  }

  private static mapToDomain(doc: TrustedDeviceDocument): TrustedDevice {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      deviceId: doc.deviceId,
      deviceInfo: {
        type: doc.deviceInfo.type as any,
        os: doc.deviceInfo.os as any,
        browser: doc.deviceInfo.browser as any,
        userAgent: doc.deviceInfo.userAgent,
        ipAddress: doc.deviceInfo.ipAddress,
        location: doc.deviceInfo.location
          ? {
              country: doc.deviceInfo.location.country,
              city: doc.deviceInfo.location.city,
              timezone: doc.deviceInfo.location.timezone,
            }
          : undefined,
      },
      name: doc.name ?? undefined,
      isTrusted: doc.isTrusted,
      lastUsedAt: doc.lastUsedAt,
      expiresAt: doc.expiresAt ?? undefined,
      autoTrusted: doc.autoTrusted,
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

  async findByUserId(userId: string, options?: DatabaseQueryOptions): Promise<TrustedDevice[]> {
    try {
      await this.ensureConnected();
      const query = TrustedDeviceModel.find({ userId }).session(options?.session || null);
      if (options?.lean) query.lean();
      if (options?.showDeleted) query.setOptions({ showDeleted: true });
      const docs = await query.sort({ lastUsedAt: -1 }).exec();
      return docs.map((doc) => this.toDomainEntity(doc as TrustedDeviceDocument));
    } catch (error) {
      logger.error("TrustedDeviceRepository findByUserId failed", error, { userId });
      throw new DatabaseError("Database query error", error);
    }
  }

  async findByDeviceId(
    deviceId: string,
    options?: DatabaseQueryOptions,
  ): Promise<TrustedDevice | null> {
    try {
      await this.ensureConnected();
      const query = TrustedDeviceModel.findOne({ deviceId }).session(options?.session || null);
      if (options?.lean) query.lean();
      if (options?.showDeleted) query.setOptions({ showDeleted: true });
      const doc = await query.exec();
      return doc ? this.toDomainEntity(doc as TrustedDeviceDocument) : null;
    } catch (error) {
      logger.error("TrustedDeviceRepository findByDeviceId failed", error, { deviceId });
      throw new DatabaseError("Database query error", error);
    }
  }

  async findByUserIdAndDeviceId(
    userId: string,
    deviceId: string,
    options?: DatabaseQueryOptions,
  ): Promise<TrustedDevice | null> {
    try {
      await this.ensureConnected();
      const query = TrustedDeviceModel.findOne({ userId, deviceId }).session(
        options?.session || null,
      );
      if (options?.lean) query.lean();
      if (options?.showDeleted) query.setOptions({ showDeleted: true });
      const doc = await query.exec();
      return doc ? this.toDomainEntity(doc as TrustedDeviceDocument) : null;
    } catch (error) {
      logger.error("TrustedDeviceRepository findByUserIdAndDeviceId failed", error, {
        userId,
        deviceId,
      });
      throw new DatabaseError("Database query error", error);
    }
  }

  async updateLastUsed(
    deviceId: string,
    options?: DatabaseQueryOptions,
  ): Promise<TrustedDevice | null> {
    try {
      await this.ensureConnected();
      const doc = await TrustedDeviceModel.findByIdAndUpdate(
        deviceId,
        {
          $set: {
            lastUsedAt: new Date(),
          },
        },
        { new: true, session: options?.session },
      );
      if (!doc) return null;
      return this.toDomainEntity(doc as TrustedDeviceDocument);
    } catch (error) {
      logger.error("TrustedDeviceRepository updateLastUsed failed", error, { deviceId });
      throw new DatabaseError("Database update error", error);
    }
  }

  async toggleTrust(
    userId: string,
    deviceId: string,
    isTrusted: boolean,
    options?: DatabaseQueryOptions,
  ): Promise<TrustedDevice> {
    try {
      await this.ensureConnected();
      const existing = await this.findByUserIdAndDeviceId(userId, deviceId, options);
      if (!existing) throw new NotFoundError("Trusted device not found");

      const doc = await TrustedDeviceModel.findByIdAndUpdate(
        existing.id,
        {
          $set: {
            isTrusted,
            autoTrusted: false,
          },
        },
        { new: true, session: options?.session },
      );
      if (!doc) throw new NotFoundError("Trusted device not found");
      return this.toDomainEntity(doc as TrustedDeviceDocument);
    } catch (error) {
      logger.error("TrustedDeviceRepository toggleTrust failed", error, { userId, deviceId });
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError("Database update error", error);
    }
  }

  async removeExpired(options?: DatabaseQueryOptions): Promise<number> {
    try {
      await this.ensureConnected();
      const result = await TrustedDeviceModel.deleteMany({
        expiresAt: { $lt: new Date(), $ne: null },
      }).session(options?.session || null);
      return result.deletedCount;
    } catch (error) {
      logger.error("TrustedDeviceRepository removeExpired failed", error);
      throw new DatabaseError("Database delete error", error);
    }
  }
}

export default TrustedDeviceRepository;
