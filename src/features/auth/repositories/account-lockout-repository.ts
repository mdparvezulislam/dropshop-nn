import { BaseRepository } from "@/lib/database/generic-repository";
import { AccountLockoutModel, AccountLockoutDocument } from "./account-lockout-model";
import { AccountLockout } from "../domain/security-types";
import { DatabaseQueryOptions } from "@/lib/database/types";
import { logger } from "@/lib/utils/logger";
import { DatabaseError, NotFoundError } from "@/lib/errors/app-error";

export class AccountLockoutRepository extends BaseRepository<
  AccountLockoutDocument,
  AccountLockout
> {
  constructor() {
    super(AccountLockoutModel, AccountLockoutRepository.mapToDomain);
  }

  private static mapToDomain(doc: AccountLockoutDocument): AccountLockout {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      type: doc.type as any,
      reason: doc.reason as any,
      lockedAt: doc.lockedAt,
      unlockedAt: doc.unlockedAt ?? undefined,
      unlocksAt: doc.unlocksAt ?? undefined,
      lockedBy: doc.lockedBy ?? undefined,
      unlockedBy: doc.unlockedBy ?? undefined,
      notes: doc.notes ?? undefined,
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

  async findByUserId(
    userId: string,
    options?: DatabaseQueryOptions,
  ): Promise<AccountLockout | null> {
    try {
      await this.ensureConnected();
      const query = AccountLockoutModel.findOne({ userId }).session(options?.session || null);
      if (options?.lean) query.lean();
      if (options?.showDeleted) query.setOptions({ showDeleted: true });
      const doc = await query.exec();
      return doc ? this.toDomainEntity(doc as AccountLockoutDocument) : null;
    } catch (error) {
      logger.error("AccountLockoutRepository findByUserId failed", error, { userId });
      throw new DatabaseError("Database query error", error);
    }
  }

  async unlock(
    userId: string,
    unlockedBy: string,
    notes?: string,
    options?: DatabaseQueryOptions,
  ): Promise<AccountLockout> {
    try {
      await this.ensureConnected();
      const existing = await this.findByUserId(userId, options);
      if (!existing) throw new NotFoundError("Account lockout not found");

      const doc = await AccountLockoutModel.findByIdAndUpdate(
        existing.id,
        {
          $set: {
            unlockedAt: new Date(),
            unlockedBy,
            notes,
            status: "inactive",
          },
        },
        { returnDocument: "after", session: options?.session },
      );
      if (!doc) throw new NotFoundError("Account lockout not found");
      return this.toDomainEntity(doc as AccountLockoutDocument);
    } catch (error) {
      logger.error("AccountLockoutRepository unlock failed", error, { userId });
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError("Database update error", error);
    }
  }

  async getActiveLockouts(options?: DatabaseQueryOptions): Promise<AccountLockout[]> {
    try {
      await this.ensureConnected();
      const query = AccountLockoutModel.find({
        $or: [{ unlocksAt: { $gt: new Date() } }, { unlocksAt: null, type: "permanent" }],
      }).session(options?.session || null);
      if (options?.lean) query.lean();
      if (options?.showDeleted) query.setOptions({ showDeleted: true });
      const docs = await query.sort({ lockedAt: -1 }).exec();
      return docs.map((doc) => this.toDomainEntity(doc as AccountLockoutDocument));
    } catch (error) {
      logger.error("AccountLockoutRepository getActiveLockouts failed", error);
      throw new DatabaseError("Database query error", error);
    }
  }

  async getExpiringLockouts(options?: DatabaseQueryOptions): Promise<AccountLockout[]> {
    try {
      await this.ensureConnected();
      const query = AccountLockoutModel.find({
        type: "temporary",
        unlocksAt: { $lte: new Date() },
        unlockedAt: null,
      }).session(options?.session || null);
      if (options?.lean) query.lean();
      if (options?.showDeleted) query.setOptions({ showDeleted: true });
      const docs = await query.exec();
      return docs.map((doc) => this.toDomainEntity(doc as AccountLockoutDocument));
    } catch (error) {
      logger.error("AccountLockoutRepository getExpiringLockouts failed", error);
      throw new DatabaseError("Database query error", error);
    }
  }

  async cleanupResolved(options?: DatabaseQueryOptions): Promise<number> {
    try {
      await this.ensureConnected();
      const result = await AccountLockoutModel.deleteMany({
        unlockedAt: { $ne: null },
      }).session(options?.session || null);
      return result.deletedCount;
    } catch (error) {
      logger.error("AccountLockoutRepository cleanupResolved failed", error);
      throw new DatabaseError("Database delete error", error);
    }
  }
}

export default AccountLockoutRepository;
