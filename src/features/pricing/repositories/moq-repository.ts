import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { MoqTierModel, MoqTierDocument } from "./moq-model";
import { MoqTier, MoqTierEntry } from "../domain/moq-entity";
import { logger } from "@/shared/utils/logger";
import { DatabaseError } from "@/shared/errors/app-error";

export class MoqTierRepository extends BaseRepository<MoqTierDocument, MoqTier> {
  constructor() {
    super(MoqTierModel, MoqTierRepository.mapToDomain);
  }

  private static mapToDomain(doc: MoqTierDocument): MoqTier {
    return {
      id: doc._id.toString(),
      productId: doc.productId.toString(),
      variantSku: doc.variantSku,
      tiers: doc.tiers as MoqTierEntry[],
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      status: doc.status,
    };
  }

  async findByProduct(productId: string, variantSku?: string): Promise<MoqTier | null> {
    try {
      const filter: Record<string, unknown> = { productId, isActive: true };
      if (variantSku) {
        filter.variantSku = variantSku;
      } else {
        filter.$or = [{ variantSku: { $exists: false } }, { variantSku: null }, { variantSku: "" }];
      }
      return this.findOne(filter);
    } catch (error) {
      logger.error("MoqTierRepository findByProduct failed", error, { productId, variantSku });
      throw new DatabaseError("Database search error", error);
    }
  }
}
