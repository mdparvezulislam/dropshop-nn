import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { CostVersionModel, CostVersionDocument } from "./cost-version-model";
import { CostVersion } from "../domain/cost-version-entity";
import { logger } from "@/shared/utils/logger";
import { DatabaseError } from "@/shared/errors/app-error";

export class CostVersionRepository extends BaseRepository<CostVersionDocument, CostVersion> {
  constructor() {
    super(CostVersionModel, CostVersionRepository.mapToDomain);
  }

  private static mapToDomain(doc: CostVersionDocument): CostVersion {
    return {
      id: doc._id.toString(),
      productId: doc.productId.toString(),
      variantSku: doc.variantSku,
      versionNumber: doc.versionNumber,
      costPrice: doc.costPrice,
      currency: doc.currency,
      supplier: {
        supplierId: doc.supplier?.supplierId,
        supplierName: doc.supplier?.supplierName,
        supplierSku: doc.supplier?.supplierSku,
        invoiceNumber: doc.supplier?.invoiceNumber,
        purchaseDate: doc.supplier?.purchaseDate,
        purchaseLink: doc.supplier?.purchaseLink,
        notes: doc.supplier?.notes,
      },
      importCost: doc.importCost,
      shippingCost: doc.shippingCost,
      packagingCost: doc.packagingCost,
      handlingCost: doc.handlingCost,
      otherExpenses: doc.otherExpenses,
      landedCost: doc.landedCost,
      reason: doc.reason as CostVersion["reason"],
      reasonText: doc.reasonText,
      notes: doc.notes,
      effectiveDate: doc.effectiveDate,
      isCurrentVersion: doc.isCurrentVersion,
      previousCostPrice: doc.previousCostPrice,
      previousLandedCost: doc.previousLandedCost,
      changedBy: doc.changedBy,
      changedByName: doc.changedByName,
      approvedBy: doc.approvedBy,
      approvedByName: doc.approvedByName,
      approvalStatus: doc.approvalStatus as CostVersion["approvalStatus"],
      approvedAt: doc.approvedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      status: doc.status,
    };
  }

  async findCurrentByProduct(productId: string, variantSku?: string): Promise<CostVersion | null> {
    try {
      const filter: Record<string, unknown> = { productId, isCurrentVersion: true };
      if (variantSku) filter.variantSku = variantSku;
      return this.findOne(filter);
    } catch (error) {
      logger.error("CostVersionRepository findCurrentByProduct failed", error, { productId });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findVersionsByProduct(
    productId: string,
    variantSku?: string,
    limit = 50,
  ): Promise<CostVersion[]> {
    try {
      await this.ensureConnected();
      const filter: Record<string, unknown> = { productId };
      if (variantSku) filter.variantSku = variantSku;
      const docs = await this.model.find(filter).sort({ versionNumber: -1 }).limit(limit).exec();
      return docs.map((d) => this.toDomainEntity(d as CostVersionDocument));
    } catch (error) {
      logger.error("CostVersionRepository findVersionsByProduct failed", error, { productId });
      throw new DatabaseError("Database search error", error);
    }
  }

  async getNextVersionNumber(productId: string): Promise<number> {
    try {
      await this.ensureConnected();
      const doc = await this.model.findOne({ productId }).sort({ versionNumber: -1 }).exec();
      const latest = doc ? this.toDomainEntity(doc as CostVersionDocument) : null;
      return (latest?.versionNumber ?? 0) + 1;
    } catch (error) {
      logger.error("CostVersionRepository getNextVersionNumber failed", error, { productId });
      throw new DatabaseError("Database search error", error);
    }
  }

  async unsetCurrentVersion(productId: string): Promise<void> {
    try {
      await this.model.updateMany(
        { productId, isCurrentVersion: true },
        { $set: { isCurrentVersion: false } },
      ).exec();
    } catch (error) {
      logger.error("CostVersionRepository unsetCurrentVersion failed", error, { productId });
      throw new DatabaseError("Database update error", error);
    }
  }

  async findVersionsBetween(
    productId: string,
    versionA: number,
    versionB: number,
  ): Promise<CostVersion[]> {
    try {
      return this.find({
        productId,
        versionNumber: { $in: [versionA, versionB] },
      });
    } catch (error) {
      logger.error("CostVersionRepository findVersionsBetween failed", error, { productId });
      throw new DatabaseError("Database search error", error);
    }
  }
}
