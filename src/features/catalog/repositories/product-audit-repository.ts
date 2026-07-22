import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { ProductAuditModel, ProductAuditDocument } from "./product-audit-model";
import { ProductAudit } from "../domain/product-audit-entity";
import { logger } from "@/shared/utils/logger";
import { DatabaseError } from "@/shared/errors/app-error";

export class ProductAuditRepository extends BaseRepository<ProductAuditDocument, ProductAudit> {
  constructor() {
    super(ProductAuditModel, ProductAuditRepository.mapToDomain);
  }

  private static mapToDomain(doc: ProductAuditDocument): ProductAudit {
    return {
      id: doc._id.toString(),
      productId: doc.productId,
      action: doc.action,
      editorId: doc.editorId,
      editorName: doc.editorName,
      changedFields: doc.changedFields || [],
      oldValues: doc.oldValues,
      newValues: doc.newValues,
      summary: doc.summary,
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

  async findByProduct(productId: string): Promise<ProductAudit[]> {
    try {
      return this.find({ productId });
    } catch (error) {
      logger.error("ProductAuditRepository findByProduct failed", error, { productId });
      throw new DatabaseError("Database query error", error);
    }
  }

  async findByAction(action: string, limit: number = 50): Promise<ProductAudit[]> {
    try {
      await this.ensureConnected();
      const docs = await ProductAuditModel
        .find({ action })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();
      return docs.map((doc) => ProductAuditRepository.mapToDomain(doc as ProductAuditDocument));
    } catch (error) {
      logger.error("ProductAuditRepository findByAction failed", error, { action });
      throw new DatabaseError("Database query error", error);
    }
  }

  async getRecent(limit: number = 20): Promise<ProductAudit[]> {
    try {
      await this.ensureConnected();
      const docs = await ProductAuditModel
        .find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();
      return docs.map((doc) => ProductAuditRepository.mapToDomain(doc as ProductAuditDocument));
    } catch (error) {
      logger.error("ProductAuditRepository getRecent failed", error);
      throw new DatabaseError("Database query error", error);
    }
  }
}

export default ProductAuditRepository;
