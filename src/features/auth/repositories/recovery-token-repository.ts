import { BaseRepository } from "@/lib/database/generic-repository";
import { RecoveryTokenModel, RecoveryTokenDocument } from "./recovery-token-model";
import { RecoveryToken } from "../domain/security-types";
import { DatabaseQueryOptions } from "@/lib/database/types";
import { logger } from "@/lib/utils/logger";
import { DatabaseError, NotFoundError } from "@/lib/errors/app-error";

export class RecoveryTokenRepository extends BaseRepository<RecoveryTokenDocument, RecoveryToken> {
  constructor() {
    super(RecoveryTokenModel, RecoveryTokenRepository.mapToDomain);
  }

  private static mapToDomain(doc: RecoveryTokenDocument): RecoveryToken {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      email: doc.email,
      token: doc.token,
      tokenHash: doc.tokenHash,
      type: doc.type as any,
      status: doc.status as any,
      expiresAt: doc.expiresAt,
      usedAt: doc.usedAt ?? undefined,
      usedByIp: doc.usedByIp ?? undefined,
      usedByUserAgent: doc.usedByUserAgent ?? undefined,
      metadata: doc.metadata ? Object.fromEntries(doc.metadata as any) : undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
    };
  }

  async findByTokenHash(
    tokenHash: string,
    options?: DatabaseQueryOptions,
  ): Promise<RecoveryToken | null> {
    try {
      await this.ensureConnected();
      const query = RecoveryTokenModel.findOne({ tokenHash }).session(options?.session || null);
      if (options?.lean) query.lean();
      if (options?.showDeleted) query.setOptions({ showDeleted: true });
      const doc = await query.exec();
      return doc ? this.toDomainEntity(doc as RecoveryTokenDocument) : null;
    } catch (error) {
      logger.error("RecoveryTokenRepository findByTokenHash failed", error, { tokenHash });
      throw new DatabaseError("Database query error", error);
    }
  }

  async findByToken(token: string, options?: DatabaseQueryOptions): Promise<RecoveryToken | null> {
    try {
      await this.ensureConnected();
      const query = RecoveryTokenModel.findOne({ token }).session(options?.session || null);
      if (options?.lean) query.lean();
      if (options?.showDeleted) query.setOptions({ showDeleted: true });
      const doc = await query.exec();
      return doc ? this.toDomainEntity(doc as RecoveryTokenDocument) : null;
    } catch (error) {
      logger.error("RecoveryTokenRepository findByToken failed", error, { token });
      throw new DatabaseError("Database query error", error);
    }
  }

  async findValidToken(
    token: string,
    options?: DatabaseQueryOptions,
  ): Promise<RecoveryToken | null> {
    try {
      await this.ensureConnected();
      const session = options?.session;
      const doc = await RecoveryTokenModel.findOne({
        token,
        status: "pending",
        expiresAt: { $gt: new Date() },
      }).session(session || null);
      return doc ? this.toDomainEntity(doc as RecoveryTokenDocument) : null;
    } catch (error) {
      logger.error("RecoveryTokenRepository findValidToken failed", error, { token });
      throw new DatabaseError("Database query error", error);
    }
  }

  async markAsUsed(
    id: string,
    usedByIp: string,
    usedByUserAgent: string,
    options?: DatabaseQueryOptions,
  ): Promise<RecoveryToken> {
    try {
      await this.ensureConnected();
      const doc = await RecoveryTokenModel.findByIdAndUpdate(
        id,
        {
          $set: {
            status: "used",
            usedAt: new Date(),
            usedByIp,
            usedByUserAgent,
          },
        },
        { new: true, session: options?.session },
      );
      if (!doc) throw new NotFoundError("Recovery token not found");
      return this.toDomainEntity(doc as RecoveryTokenDocument);
    } catch (error) {
      logger.error("RecoveryTokenRepository markAsUsed failed", error, { id });
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError("Database update error", error);
    }
  }

  async revokeToken(id: string, options?: DatabaseQueryOptions): Promise<RecoveryToken> {
    try {
      await this.ensureConnected();
      const doc = await RecoveryTokenModel.findByIdAndUpdate(
        id,
        {
          $set: {
            status: "revoked",
          },
        },
        { new: true, session: options?.session },
      );
      if (!doc) throw new NotFoundError("Recovery token not found");
      return this.toDomainEntity(doc as RecoveryTokenDocument);
    } catch (error) {
      logger.error("RecoveryTokenRepository revokeToken failed", error, { id });
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError("Database update error", error);
    }
  }

  async findByUserId(userId: string, options?: DatabaseQueryOptions): Promise<RecoveryToken[]> {
    try {
      await this.ensureConnected();
      const query = RecoveryTokenModel.find({ userId }).session(options?.session || null);
      if (options?.lean) query.lean();
      if (options?.showDeleted) query.setOptions({ showDeleted: true });
      const docs = await query.sort({ createdAt: -1 }).exec();
      return docs.map((doc) => this.toDomainEntity(doc as RecoveryTokenDocument));
    } catch (error) {
      logger.error("RecoveryTokenRepository findByUserId failed", error, { userId });
      throw new DatabaseError("Database query error", error);
    }
  }

  async cleanupExpired(options?: DatabaseQueryOptions): Promise<number> {
    try {
      await this.ensureConnected();
      const result = await RecoveryTokenModel.deleteMany({
        $or: [{ status: "used" }, { status: "expired" }, { expiresAt: { $lt: new Date() } }],
      }).session(options?.session || null);
      return result.deletedCount;
    } catch (error) {
      logger.error("RecoveryTokenRepository cleanupExpired failed", error);
      throw new DatabaseError("Database delete error", error);
    }
  }
}

export default RecoveryTokenRepository;
