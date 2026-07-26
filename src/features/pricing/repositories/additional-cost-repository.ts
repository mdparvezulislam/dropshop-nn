import { BaseRepository } from "@/lib/database/generic-repository";
import { AdditionalCostModel, AdditionalCostDocument } from "./additional-cost-model";
import { AdditionalCost } from "../domain/additional-cost-entity";
import { logger } from "@/lib/utils/logger";
import { DatabaseError } from "@/lib/errors/app-error";

export class AdditionalCostRepository extends BaseRepository<
  AdditionalCostDocument,
  AdditionalCost
> {
  constructor() {
    super(AdditionalCostModel, AdditionalCostRepository.mapToDomain);
  }

  private static mapToDomain(doc: AdditionalCostDocument): AdditionalCost {
    return {
      id: doc._id.toString(),
      productId: doc.productId.toString(),
      variantSku: doc.variantSku,
      costType: doc.costType,
      label: doc.label,
      amount: doc.amount,
      isPercentage: doc.isPercentage,
      percentageOfField: doc.percentageOfField,
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

  async findByProduct(productId: string, variantSku?: string): Promise<AdditionalCost[]> {
    try {
      const filter: Record<string, unknown> = { productId, isActive: true };
      if (variantSku) {
        filter.variantSku = variantSku;
      }
      return this.find(filter);
    } catch (error) {
      logger.error("AdditionalCostRepository findByProduct failed", error, {
        productId,
        variantSku,
      });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findActiveByType(costType: string): Promise<AdditionalCost[]> {
    try {
      return this.find({ costType, isActive: true });
    } catch (error) {
      logger.error("AdditionalCostRepository findActiveByType failed", error, { costType });
      throw new DatabaseError("Database search error", error);
    }
  }
}
