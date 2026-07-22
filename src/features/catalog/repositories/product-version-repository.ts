import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { ProductVersionModel, ProductVersionDocument } from "./product-version-model";
import { ProductVersion } from "../domain/product-version-entity";
import { logger } from "@/shared/utils/logger";
import { DatabaseError } from "@/shared/errors/app-error";

export class ProductVersionRepository extends BaseRepository<ProductVersionDocument, ProductVersion> {
  constructor() {
    super(ProductVersionModel, ProductVersionRepository.mapToDomain);
  }

  private static mapToDomain(doc: ProductVersionDocument): ProductVersion {
    return {
      id: doc._id.toString(),
      productId: doc.productId,
      versionNumber: doc.versionNumber,
      snapshot: doc.snapshot,
      changedFields: doc.changedFields || [],
      editorId: doc.editorId,
      editorName: doc.editorName,
      reason: doc.reason,
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

  async findByProduct(productId: string): Promise<ProductVersion[]> {
    try {
      return this.find({ productId }).then((versions) =>
        versions.sort((a, b) => b.versionNumber - a.versionNumber),
      );
    } catch (error) {
      logger.error("ProductVersionRepository findByProduct failed", error, { productId });
      throw new DatabaseError("Database query error", error);
    }
  }

  async getLatestVersion(productId: string): Promise<ProductVersion | null> {
    try {
      await this.ensureConnected();
      const doc = await ProductVersionModel
        .findOne({ productId })
        .sort({ versionNumber: -1 })
        .exec();
      return doc ? ProductVersionRepository.mapToDomain(doc as ProductVersionDocument) : null;
    } catch (error) {
      logger.error("ProductVersionRepository getLatestVersion failed", error, { productId });
      throw new DatabaseError("Database query error", error);
    }
  }

  async getVersion(productId: string, versionNumber: number): Promise<ProductVersion | null> {
    try {
      await this.ensureConnected();
      const doc = await ProductVersionModel
        .findOne({ productId, versionNumber })
        .exec();
      return doc ? ProductVersionRepository.mapToDomain(doc as ProductVersionDocument) : null;
    } catch (error) {
      logger.error("ProductVersionRepository getVersion failed", error, { productId, versionNumber });
      throw new DatabaseError("Database query error", error);
    }
  }

  async compareVersions(
    productId: string,
    v1: number,
    v2: number,
  ): Promise<{ added: string[]; removed: string[]; changed: string[] } | null> {
    try {
      const [versionA, versionB] = await Promise.all([
        this.getVersion(productId, v1),
        this.getVersion(productId, v2),
      ]);

      if (!versionA || !versionB) return null;

      const snapshotA = versionA.snapshot;
      const snapshotB = versionB.snapshot;
      const allKeys = new Set([...Object.keys(snapshotA), ...Object.keys(snapshotB)]);

      const added: string[] = [];
      const removed: string[] = [];
      const changed: string[] = [];

      for (const key of allKeys) {
        const inA = key in snapshotA;
        const inB = key in snapshotB;
        if (!inA && inB) {
          added.push(key);
        } else if (inA && !inB) {
          removed.push(key);
        } else if (
          JSON.stringify(snapshotA[key]) !== JSON.stringify(snapshotB[key])
        ) {
          changed.push(key);
        }
      }

      return { added, removed, changed };
    } catch (error) {
      logger.error("ProductVersionRepository compareVersions failed", error, {
        productId,
        v1,
        v2,
      });
      throw new DatabaseError("Database query error", error);
    }
  }
}

export default ProductVersionRepository;
