import { BaseRepository } from "@/lib/database/generic-repository";
import {
  PriceApprovalModel,
  PriceApprovalDocument,
  PriceHistoryEntryModel,
  PriceHistoryEntryDocument,
} from "./approval-model";
import { PriceApproval, PriceChange } from "../domain/price-approval-entity";
import { PriceHistoryEntry } from "../domain/price-history-entity";
import { logger } from "@/lib/utils/logger";
import { DatabaseError } from "@/lib/errors/app-error";

export class PriceApprovalRepository extends BaseRepository<PriceApprovalDocument, PriceApproval> {
  constructor() {
    super(PriceApprovalModel, PriceApprovalRepository.mapToDomain);
  }

  private static mapToDomain(doc: PriceApprovalDocument): PriceApproval {
    return {
      id: doc._id.toString(),
      entityType: doc.entityType,
      entityId: doc.entityId,
      requestedBy: doc.requestedBy,
      requestedByName: doc.requestedByName,
      reviewedBy: doc.reviewedBy,
      reviewedByName: doc.reviewedByName,
      status: doc.status,
      changes: doc.changes as unknown as PriceChange[],
      reason: doc.reason,
      reviewNote: doc.reviewNote,
      approvedAt: doc.approvedAt,
      rejectedAt: doc.rejectedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
    };
  }

  async findPendingApprovals(): Promise<PriceApproval[]> {
    try {
      return this.find({ status: "pending" });
    } catch (error) {
      logger.error("PriceApprovalRepository findPendingApprovals failed", error);
      throw new DatabaseError("Database search error", error);
    }
  }

  async findByEntity(entityType: string, entityId: string): Promise<PriceApproval[]> {
    try {
      return this.find({ entityType, entityId });
    } catch (error) {
      logger.error("PriceApprovalRepository findByEntity failed", error, { entityType, entityId });
      throw new DatabaseError("Database search error", error);
    }
  }
}

export class PriceHistoryRepository extends BaseRepository<
  PriceHistoryEntryDocument,
  PriceHistoryEntry
> {
  constructor() {
    super(PriceHistoryEntryModel, PriceHistoryRepository.mapToDomain);
  }

  private static mapToDomain(doc: PriceHistoryEntryDocument): PriceHistoryEntry {
    return {
      id: doc._id.toString(),
      productId: doc.productId.toString(),
      variantSku: doc.variantSku,
      field: doc.field,
      oldValue: doc.oldValue,
      newValue: doc.newValue,
      changedBy: doc.changedBy,
      changedByName: doc.changedByName,
      reason: doc.reason,
      source: doc.source,
      affectedProducts: doc.affectedProducts,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      status: doc.status,
    };
  }

  async findByProduct(productId: string, variantSku?: string): Promise<PriceHistoryEntry[]> {
    try {
      const filter: Record<string, unknown> = { productId };
      if (variantSku) filter.variantSku = variantSku;
      return this.find(filter);
    } catch (error) {
      logger.error("PriceHistoryRepository findByProduct failed", error, { productId, variantSku });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findByChangedBy(changedBy: string): Promise<PriceHistoryEntry[]> {
    try {
      return this.find({ changedBy });
    } catch (error) {
      logger.error("PriceHistoryRepository findByChangedBy failed", error, { changedBy });
      throw new DatabaseError("Database search error", error);
    }
  }
}
